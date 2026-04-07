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
  - [x] 8.6 Focus/Expand mode (click to expand card full-width)
  - [x] 8.7 Merge into super response (new /api/merge endpoint)

- [x] 9. RAG Quality Tuning (Session 3)
  - [x] 9.1 Stronger low-relevance prompt framing ("ignore sources unless useful")
  - [x] 9.2 Domain diversity enforcement (max 2 per domain)
  - [x] 9.3 Shorter snippets for low-relevance results (600 vs 1500 chars)
  - [x] 9.4 Cap low-relevance results to 3 sources (less noise)
  - [x] 9.5 Raised skip threshold (0.1→0.15)
  - [x] 9.6 HackerNews for general queries (not just tech)
  - [ ] 9.7 Consider Brave Search API as complementary source (v2)
  - [ ] 9.8 Consider Exa AI for semantic search (v2)
  - [ ] 9.9 Gemini native grounding (v2 — requires SDK migration)
  - [ ] 9.10 Claude native web search (v2 — costs $10/1K searches)

- [x] 10. Design Pages RAG Integration (Session 3)
  - [x] 10.1 Wire RAG into Arena, Sanctum, Nexus pages

- [ ] 11. ASCII Hydra Animation
  - [x] 11.1 Removed wave distortion (looked cheap), kept breathing + shimmer
  - [x] 11.2 Attempted video-to-ASCII pipeline (Sketchfab 3D model → screen record → ffmpeg → ASCII frames) — promising but rendering quality needs work
  - [ ] 11.3 Needs: better video-to-ASCII renderer (canvas pre-render approach was stuttery, need smoother interpolation or higher-quality source)

- [ ] 12. Design Polish
  - [x] 12.1 Layout toggle (grid/columns/stack) with icons
  - [x] 12.2 Responsive layout testing + mobile fixes (Session 3)
  - [x] 12.3 Screenshot comparison + polish pass (Session 3)
  - [x] 12.4 Home links on all design variant navs
  - [x] 12.5 Footer nav on main page (Arena/Sanctum/Nexus/Usage)
  - [x] 12.6 Text contrast improvements (subtitle, "Every AI answers")

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
| Session 3 | Focus/Expand mode | Done | Click card to expand full-width, Escape to close |
| Session 3 | Merge feature | Done | /api/merge endpoint + useMerge hook + MergeCard UI |
| Session 3 | Design pages RAG | Done | Web search toggle + sources panel on all 3 variant pages |
| Session 3 | RAG quality tuning | Done | Domain diversity, shorter low-relevance snippets, stronger ignore framing |
| Session 3 | Layout toggle | Done | Grid/columns/stack toggle with icon buttons in action bar |
| Session 3 | Responsive fixes | Done | Arena auto-fit grid, Sanctum circle scaling, Nexus mobile spacing |
| Session 3 | Design polish | Done | Text contrast, Home nav links, footer nav, model count fix |
| Session 3 | Hydra animation cleanup | Done | Removed wave distortion, kept breathing + shimmer. Video-to-ASCII pipeline built but needs quality work |
