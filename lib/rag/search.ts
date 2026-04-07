/**
 * Multi-source search — fetches results from Jina, Google News RSS,
 * and HackerNews depending on the query's focus mode.
 *
 * All sources are free. Jina needs an API key (free tier: 10M tokens).
 * Google News RSS and HackerNews need no API key at all.
 */

import { JinaResult, NewsResult, HNResult } from "./types";

// ---------------------------------------------------------------------------
// Jina Search (primary — full page content in markdown)
// ---------------------------------------------------------------------------

async function searchJina(query: string): Promise<JinaResult[]> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("https://s.jina.ai/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 5 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();

    // Jina returns { data: [...] } with each item having title, url, content
    const results = data.data ?? data.results ?? data;
    if (!Array.isArray(results)) return [];

    return results.map((r: Record<string, string>) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: r.content ?? r.description ?? "",
      description: r.description ?? "",
      publishedDate: r.publishedDate ?? r.published_date ?? undefined,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Google News RSS (free, no API key, no rate limit)
// ---------------------------------------------------------------------------

async function searchGoogleNews(query: string): Promise<NewsResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://news.google.com/rss/search?q=${encoded}+when:7d&hl=en-US&gl=US&ceid=US:en`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();

    // Parse RSS XML — extract <item> elements
    const items: NewsResult[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const itemXml = match[1];
      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link");
      const pubDate = extractTag(itemXml, "pubDate");
      const source = extractTag(itemXml, "source");

      if (title && link) {
        items.push({
          title: decodeHtmlEntities(title),
          url: link,
          pubDate: pubDate ?? "",
          source: source ?? "",
        });
      }
    }

    return items;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// HackerNews Algolia API (free, no auth)
// ---------------------------------------------------------------------------

async function searchHackerNews(query: string): Promise<HNResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://hn.algolia.com/api/v1/search?query=${encoded}&tags=story&hitsPerPage=5`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const hits = data.hits ?? [];

    return hits
      .filter((h: Record<string, unknown>) => h.url) // Skip text-only posts
      .map((h: Record<string, unknown>) => ({
        title: (h.title as string) ?? "",
        url: (h.url as string) ?? "",
        points: (h.points as number) ?? 0,
        numComments: (h.num_comments as number) ?? 0,
        createdAt: (h.created_at as string) ?? "",
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Multi-source orchestrator
// ---------------------------------------------------------------------------

export interface RawSearchResult {
  title: string;
  url: string;
  content: string;   // full content (Jina) or empty (News/HN)
  date?: string;
  source: "jina" | "news" | "hackernews";
}

/**
 * Search multiple sources in parallel based on focus mode.
 * All queries searched against all selected sources simultaneously.
 * Results are merged and deduplicated by URL.
 */
export async function searchMultiSource(
  queries: string[],
  focus: "news" | "tech" | "academic" | "general"
): Promise<RawSearchResult[]> {
  const primaryQuery = queries[0] ?? "";
  const allPromises: Promise<RawSearchResult[]>[] = [];

  // Jina: search all rewritten queries in parallel
  for (const q of queries) {
    allPromises.push(
      searchJina(q).then((results) =>
        results.map((r) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          date: r.publishedDate,
          source: "jina" as const,
        }))
      )
    );
  }

  // Google News: add for news and general focus
  if (focus === "news" || focus === "general") {
    allPromises.push(
      searchGoogleNews(primaryQuery).then((results) =>
        results.map((r) => ({
          title: r.title,
          url: r.url,
          content: "", // News RSS doesn't include full content
          date: r.pubDate,
          source: "news" as const,
        }))
      )
    );
  }

  // HackerNews: add for tech and general focus (HN covers many topics well)
  if (focus === "tech" || focus === "general") {
    allPromises.push(
      searchHackerNews(primaryQuery).then((results) =>
        results.map((r) => ({
          title: r.title,
          url: r.url,
          content: "",
          date: r.createdAt,
          source: "hackernews" as const,
        }))
      )
    );
  }

  // Run all searches in parallel
  const settled = await Promise.allSettled(allPromises);
  const allResults: RawSearchResult[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
    }
  }

  // Deduplicate by URL (keep the one with more content)
  const seen = new Map<string, RawSearchResult>();
  for (const r of allResults) {
    const normalized = r.url.replace(/\/$/, "").toLowerCase();
    const existing = seen.get(normalized);
    if (!existing || r.content.length > existing.content.length) {
      seen.set(normalized, r);
    }
  }

  const deduped = Array.from(seen.values());

  // Enrich results that have no content (News RSS, HN) via Jina Reader
  await enrichEmptyContent(deduped);

  return deduped;
}

// ---------------------------------------------------------------------------
// Jina Reader — fetch full content for results with empty content (A2)
// ---------------------------------------------------------------------------

/**
 * For results that have no content (e.g. Google News RSS headlines, HackerNews links),
 * fetch the full page content via Jina Reader (r.jina.ai). Runs in parallel, 3s timeout.
 */
async function enrichEmptyContent(results: RawSearchResult[]): Promise<void> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) return;

  const emptyResults = results.filter((r) => !r.content || r.content.length < 50);
  if (emptyResults.length === 0) return;

  const fetchPromises = emptyResults.map(async (result) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`https://r.jina.ai/${result.url}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "text/plain",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) return;

      const text = await res.text();
      if (text && text.length > 50) {
        result.content = text;
      }
    } catch {
      // Graceful: if reader fails, the result keeps its empty content
    }
  });

  await Promise.allSettled(fetchPromises);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}
