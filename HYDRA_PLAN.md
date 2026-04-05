# Hydra — Project Plan

## Current Focus
> Improving RAG response quality, then building merge/copy/expand UX features, then design polish.

## Plan

- [x] 1. Project setup
- [x] 2. Backend (providers + API)
- [x] 3. Frontend UI components
- [x] 4. Design variants (4 complete page designs)

- [x] 5. Wire up real LLM APIs (Session 2)
  - [x] 5.1 Replace mock streaming with real fetch to /api/query
  - [x] 5.2 Parse SSE stream on client (useStreamQuery hook)
  - [x] 5.3 Set up .env.local with API keys
  - [x] 5.4 Test end-to-end with real responses
  - [x] 5.5 Provider lineup: Claude, Gemini, Gemma 3, Llama 3.3, Qwen 3

- [x] 6. RAG Pipeline (Session 2)
  - [x] 6.1 Query classification (regex + Groq LLM fallback)
  - [x] 6.2 Query rewriting (2-3 optimized search queries via Groq)
  - [x] 6.3 Multi-source search (Jina + Google News RSS + HackerNews API)
  - [x] 6.4 Jina Reader for news content enrichment
  - [x] 6.5 Jina Reranker for semantic relevance scoring
  - [x] 6.6 Smart snippet extraction (query-term paragraph scoring)
  - [x] 6.7 Lost-in-the-middle source reordering
  - [x] 6.8 Structured source tags (<source> XML format)
  - [x] 6.9 Dynamic prompt framing (high/moderate/low relevance)
  - [x] 6.10 Web search toggle in UI
  - [x] 6.11 Sources panel with trust tiers + freshness
  - [x] 6.12 Knowledge cutoff display (verified via testing)

- [x] 7. Usage Tracker (Session 2)
  - [x] 7.1 In-memory usage tracking per provider
  - [x] 7.2 /usage page with requests, tokens, costs, dashboard links

- [x] 8. UX Features — Partial (Session 2)
  - [x] 8.1 LLM toggle (select/deselect which models to query)
  - [x] 8.2 Hover effects on cards (glow, scale, action icons)
  - [x] 8.3 Per-card copy (copy individual response)
  - [x] 8.4 Copy All/Selected with action bar
  - [x] 8.5 Selection checkboxes on response cards
  - [ ] 8.6 Focus/Expand mode (click to expand card full-width)
  - [ ] 8.7 Merge into super response (new /api/merge endpoint)

- [ ] 9. RAG Quality Tuning (IN PROGRESS)
  - [ ] 9.1 Further prompt tuning for niche/tangential queries
  - [ ] 9.2 Consider Brave Search API as complementary source
  - [ ] 9.3 Consider Exa AI for semantic search
  - [ ] 9.4 Gemini native grounding (v2 — requires SDK migration)
  - [ ] 9.5 Claude native web search (v2 — costs $10/1K searches)

- [ ] 10. Design Pages RAG Integration
  - [ ] 10.1 Wire RAG into Arena, Sanctum, Nexus pages

- [ ] 11. ASCII Hydra Animation
  - [ ] 11.1 Make heads/necks move realistically
  - [ ] 11.2 Consider pre-rendered frames (Ghostty-style)

- [ ] 12. Design Polish
  - [ ] 12.1 Output format toggle between 4 display types
  - [ ] 12.2 Responsive layout testing
  - [ ] 12.3 Screenshot comparison with award-winning sites

## Additions

| Added | Description | Status | Origin |
|-------|-------------|--------|--------|
| Session 1 | YouTube transcript MCP + yt-dlp | Done | User request |
| Session 1 | Permissive allowlist in settings.local.json | Done | User frustrated by permission prompts |
| Session 2 | Full RAG pipeline with multi-source search | Done | Knowledge cutoff was undermining the app |
| Session 2 | Jina Search + Reader + Reranker integration | Done | Best free search option |
| Session 2 | Google News RSS + HackerNews API (free) | Done | Supplementary search for news/tech queries |
| Session 2 | Dynamic relevance-based prompt framing | Done | Prevent models over-anchoring on tangential sources |
| Session 2 | LLM toggle, copy, hover effects | Done | User requested from original vision |
| Session 2 | Merge feature | Planned | User wants combined "super response" |
| Session 2 | Focus/expand mode | Planned | User wants to click and enlarge one card |
