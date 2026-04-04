# Hydra — Project Plan

## Current Focus
> Iterating Hydra ASCII art animation (heads/necks need more realistic independent movement), then wiring up real LLM API integration, then design polish.

## Plan

- [x] 1. Project setup
  - [x] 1.1 Research free API tiers for all LLM providers
  - [x] 1.2 Create project files (CLAUDE.md, README, .env.example, .gitignore)
  - [x] 1.3 Create GitHub repo (scadkin/hydra)
  - [x] 1.4 Scaffold Next.js with TypeScript + Tailwind
  - [x] 1.5 Install dependencies (Anthropic SDK, Google AI, OpenAI, Motion, react-markdown, Three.js)

- [x] 2. Backend (providers + API)
  - [x] 2.1 Provider type system (ProviderInfo, Provider interfaces)
  - [x] 2.2 Claude provider (Anthropic SDK)
  - [x] 2.3 Gemini provider (Google AI SDK)
  - [x] 2.4 OpenAI-compatible factory (Grok, DeepSeek, OpenRouter)
  - [x] 2.5 Provider registry (index.ts with getActiveProviders)
  - [x] 2.6 SSE streaming API route (/api/query) with parallel fan-out + timeouts
  - [x] 2.7 Provider metadata endpoint (/api/providers)

- [x] 3. Frontend UI components
  - [x] 3.1 4 output display formats: Editorial cards, Terminal cards, Gradient Glass, Stacks/Accordion
  - [x] 3.2 QueryInput component with mock streaming
  - [x] 3.3 ResponseGrid with staggered animations
  - [x] 3.4 Header with bold headline + brand mark

- [x] 4. Design variants (4 complete page designs)
  - [x] 4.1 Main page — warm amber, editorial cards, "Ask once. Every AI answers."
  - [x] 4.2 Arena (/design/1) — dark black + crimson, full-width command bar, dense grid
  - [x] 4.3 Sanctum (/design/2) — midnight blue + gold, summoning circle, scroll strips
  - [x] 4.4 Nexus (/design/3) — cyberpunk black + cyan, terminal prompt, horizontal card scroll

- [ ] 5. ASCII Hydra background (IN PROGRESS)
  - [x] 5.1 Real artwork → ASCII conversion engine (AsciiRenderer)
  - [x] 5.2 Background removal via brightness thresholding
  - [x] 5.3 4 unique hydra variants (one per page, different source art + colors)
  - [x] 5.4 Wave distortion animation for head movement
  - [ ] 5.5 Make head/neck movement look realistic (current wave distortion is too subtle/generic)
  - [ ] 5.6 Better background isolation (cleaner separation of dragon from background)
  - [ ] 5.7 Consider pre-rendered frame approach (Ghostty-style) for higher quality animation

- [ ] 6. Wire up real LLM APIs
  - [ ] 6.1 Replace mock streaming in main page with real fetch to /api/query
  - [ ] 6.2 Parse SSE stream on client (provider chunks → state updates)
  - [ ] 6.3 Replace mock streaming in all design variant pages
  - [ ] 6.4 Set up .env.local with actual API keys
  - [ ] 6.5 Test end-to-end with real responses
  - [ ] 6.6 Error handling for missing keys, timeouts, rate limits

- [ ] 7. Output format toggle
  - [ ] 7.1 Build toggle UI to switch between 4 display formats
  - [ ] 7.2 Integrate all 4 card components into each design page

- [ ] 8. Design polish
  - [ ] 8.1 Continue refining all 4 designs based on user feedback
  - [ ] 8.2 Build 2 more completely different design variants
  - [ ] 8.3 Add hover effects on output panels
  - [ ] 8.4 Responsive layout testing
  - [ ] 8.5 Screenshot comparison loop with award-winning sites

- [ ] 9. Future features (planned hooks in architecture)
  - [ ] 9.1 LLM selector (choose which models to query)
  - [ ] 9.2 Combine mode (merge all responses into one doc)
  - [ ] 9.3 Summarize mode (AI-analyzed synthesis)
  - [ ] 9.4 Mobile / PWA
  - [ ] 9.5 Integration API for other projects

## Additions

| Added | Description | Status | Origin |
|-------|-------------|--------|--------|
| Session 1 | YouTube transcript MCP + yt-dlp | Done | User request for learning from YT videos |
| Session 1 | Permissive allowlist in settings.local.json | Done | User frustrated by constant permission prompts |
| Session 1 | Output format toggle between 4 display types | Planned | User wants to switch between cards/bento/columns/stacks |
| Session 1 | 2 additional design variants | Planned | User wants more radically different layouts |
| Session 1 | Pre-rendered frame animation (Ghostty approach) | Consider | May be needed for truly realistic head movement |
