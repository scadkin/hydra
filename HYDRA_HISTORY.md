# Hydra — Session History

## Session 1 (2026-04-01 to 2026-04-04)

### What changed
- Project created from scratch: GitHub repo, Next.js scaffold, all dependencies
- Full backend: 7 LLM provider modules, SSE streaming API route, provider metadata endpoint
- 4 complete page designs (Main, Arena, Sanctum, Nexus) with ASCII Hydra backgrounds
- 4 output display formats (Editorial, Terminal, Gradient Glass, Stacks)
- Mock streaming on all pages
- Dev tooling: Puppeteer, YouTube transcript MCP, permissive allowlist

### Key decisions
- Tech stack: Next.js 16 + TypeScript + Tailwind CSS 4 + Motion + react-markdown
- Design direction: award-winning, dark, dramatic, Space Grotesk font, warm amber accent
- ASCII approach: real artwork → background removal → canvas → ASCII downsampling

---

## Session 2 (2026-04-04)

### What changed
- **Real API integration**: Replaced all mock streaming with live API calls to 5 LLM providers
- **Provider evolution**: Started with 7 providers (Claude, Gemini, Grok, DeepSeek, 3x OpenRouter), ended with 5 (Claude, Gemini, Gemma 3, Llama 3.3, Qwen 3) after discovering Grok/DeepSeek have no free credits and OpenRouter free tier is unreliable
- **Gemma 3 via Google AI Studio**: Discovered Gemma 3 is available directly through Google AI (same key as Gemini), bypassing OpenRouter rate limits
- **Google AI provider factory**: Created `google-ai.ts` factory for multiple Google models (Gemini + Gemma)
- **Knowledge cutoffs verified empirically**: Tested each model with time-specific events (Super Bowl, Olympics, CrowdStrike, election, DeepSeek R1). Found models consistently lie about their own cutoff dates.
- **Full RAG pipeline built**: classify → rewrite → multi-source search → rerank → smart snippets → dynamic prompting
  - Query classification: regex heuristics + Groq LLM fallback
  - Query rewriting: 2-3 search-optimized queries via Groq Llama 3.3
  - Multi-source search: Jina Search (full page content) + Google News RSS (free, no key) + HackerNews Algolia API (free, no key)
  - Jina Reader: fetches full article content for News/HN results that have empty content
  - Jina Reranker: semantic relevance scoring, replaces heuristic-only ranking
  - Smart snippet extraction: query-term paragraph scoring instead of dumb truncation
  - Lost-in-the-middle reordering: most relevant source first, second-most last
  - Structured source tags: `<source>` XML format for better LLM parsing
  - Dynamic prompt framing: adapts instruction strength based on relevance score (high/moderate/low)
- **Usage tracker**: `/usage` page with per-provider request counts, token estimates, cost estimates, dashboard links
- **LLM toggle**: Clickable model pills to select/deselect which providers to query
- **Sources panel**: Horizontal scrollable strip with trust tiers, freshness tags, domain info
- **Copy features**: Per-card copy (hover icons), Copy All/Selected (action bar), selection checkboxes
- **Hover effects**: Cards glow + scale on hover, reveal action icons (copy, expand)
- **Action bar**: Shows after responses complete with Copy All, Select/Deselect All

### Key decisions
- **RAG over raw queries**: Knowledge cutoff makes raw LLM responses useless for current-info queries. RAG with web search compensates.
- **Jina over other search APIs**: Returns full page content in markdown (not just snippets). 10M free tokens. Also has Reader and Reranker APIs on the same key.
- **Google News RSS + HackerNews as free supplements**: Zero cost, zero auth, great for news and tech queries respectively.
- **Dynamic prompt framing**: Fixed "ONLY use sources" prompts cause models to refuse answering when sources are tangential. Dynamic framing based on relevance score lets models use their knowledge when sources don't help.
- **Dropped Llama 4 Scout**: 17B model with Dec 2022 cutoff is worse than Llama 3.3 70B in every way. Kept only Llama 3.3.
- **Dropped OpenRouter entirely**: Gemma 3 available directly via Google AI (same free key), eliminating the last OpenRouter dependency.

### Problems encountered
- OpenRouter free models constantly 429 rate limited
- Grok has no free credits on new accounts anymore
- DeepSeek has insufficient balance on free tier
- Groq deprecated models mid-session (deepseek-r1-distill-llama-70b, qwen-qwq-32b)
- Qwen 3 outputs `<think>` tags that needed stripping
- Models lie about their own knowledge cutoff dates
- RAG with poor-quality sources makes responses WORSE than no sources
- React "Maximum update depth exceeded" from stale closure in SSE parsing loop
- Gemini rate limits (10 RPM) hit during heavy testing

### What's NOT done yet
- Merge feature (combine all responses into one super response)
- Focus/expand mode (click card to enlarge)
- Design variant pages don't have RAG yet
- Hydra animation improvements
- Output format toggle
- Design polish
