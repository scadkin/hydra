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

---

## Session 3 (2026-04-04 to 2026-04-05)

### What changed
- **Focus/Expand mode**: New `FocusModal` component — click expand icon on any card to open full-width overlay with larger text (14px). Escape key, X button, or backdrop click to close. Body scroll locked while open.
- **Merge feature**: Full pipeline for synthesizing all/selected responses into one "super response":
  - `app/api/merge/route.ts` — SSE streaming endpoint that sends responses to Claude Sonnet for synthesis
  - `lib/useMerge.ts` — client hook managing merge state and SSE parsing
  - `components/MergeCard.tsx` — styled card with streaming animation, copy, and dismiss
  - Merge button in ActionBar (appears when 2+ responses done)
- **Design pages RAG integration**: All 3 variant pages (Arena, Sanctum, Nexus) now have:
  - Web search toggle styled to match each theme (crimson/gold/neon green)
  - SourcesPanel showing search results
- **RAG quality tuning** (6 improvements):
  - Stronger low-relevance prompt framing ("ignore sources unless useful" vs. old wishy-washy framing)
  - Domain diversity enforcement (max 2 results per domain)
  - Shorter snippets for low-relevance results (600 vs 1500 chars)
  - Cap low-relevance results to 3 sources (less noise)
  - Raised skip threshold (0.1 → 0.15) to filter more irrelevant results
  - HackerNews added for general queries (was tech-only)
- **Layout toggle**: New `LayoutToggle` component with grid/columns/stack modes and icon buttons
- **Responsive fixes**: Arena auto-fit grid (was fixed 4-col), Sanctum circle scaling (300px mobile → 420px desktop with percentage-based oracle dot positioning), Nexus mobile spacing
- **Design polish**: Text contrast improvements, "Home" nav links on all variant pages, footer nav on main page (Arena/Sanctum/Nexus/Usage), model count fixed ("Five" not "Seven")

### Key decisions
- **Layout toggle over card style toggle**: The 3 card designs (A/B/C) have divergent prop interfaces. Switching layouts (grid/columns/stack) with the same CardDesignC is more useful and avoids retrofitting old components.
- **Merge uses Claude only**: The merge endpoint always uses Claude Sonnet since it's the most capable model for synthesis. Uses the same Anthropic SDK pattern as the main provider.
- **RAG low-relevance strategy**: Rather than trying to make bad sources useful, the new approach tells models to ignore them entirely. Less noise > marginally relevant context.

### Hydra animation attempts (reverted)
- **Skeletal spine system**: Replaced wave distortion with joint-chain animation — displacement math worked but still looked like 2D image warping because it WAS 2D image warping. User correctly pointed out you can't animate a painting.
- **Video-to-ASCII pipeline**: Screen-recorded Sketchfab's animated 3D hydra model (by Thanos Bompotas), extracted frames via ffmpeg, converted to ASCII JSON. Built AsciiPlayer component with canvas crossfade. Pipeline works but rendering was too low quality — stuttery, choppy, and the ASCII resolution wasn't high enough to look good.
- **Final state**: Reverted to original static ASCII art from source images, removed wave distortion, kept only breathing (subtle scale pulse) and shimmer (brightness oscillation). Video-to-ASCII pipeline code preserved in scripts/ and components/hydra/AsciiPlayer.tsx for future work.
- **Lesson**: Animating a 2D painting with any technique (waves, spines, mesh warp) will always look fake. Real animation requires a real 3D model → video → ASCII pipeline. The pipeline exists but the rendering quality needs significant improvement.

### Problems encountered
- Puppeteer not installed as project dependency (global only) — used global path
- Desktop screenshots timing out with `networkidle2` — switched to `domcontentloaded` + sleep
- Sanctum oracle dots used fixed pixel radius that didn't scale — converted to percentage-based positioning
- macOS screen recordings have Unicode narrow no-break spaces in filenames — required wildcard copy to sane paths
- ffmpeg not installed — installed via homebrew mid-session

### What's NOT done yet
- Hydra animation (video-to-ASCII pipeline exists but quality too low)
- RAG v2 search sources (Brave, Exa, native grounding)
- Further design refinement (ongoing)
