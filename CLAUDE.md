# Hydra — Project Brief for Claude Code

## What is Hydra?

Hydra is a web app that lets you type one search query and sends it to multiple LLMs at the same time, displaying all responses side by side. Think of it as a "compare all" tool for AI models.

## Supported LLMs (updated Session 2)

5 active providers, all free except Claude (covered by Max account):

### Direct API connections:
- **Claude** (Anthropic) — Sonnet 4, via Anthropic SDK. Cutoff: ~Feb 2025.
- **Gemini** (Google) — 2.5 Flash, via Google AI SDK. Free tier. Cutoff: ~Sep 2024.
- **Gemma 3** (Google) — 27B, via Google AI SDK (same key as Gemini). Free tier. Cutoff: ~Aug 2024.

### Via Groq (free tier, fast inference):
- **Llama 3.3** (Meta) — 70B via Groq. Free forever. Cutoff: ~Dec 2023.
- **Qwen 3** (Alibaba) — 32B via Groq. Free forever. Cutoff: ~Jul 2024.

### Disabled (no free credits):
- Grok (xAI) — no free credits available
- DeepSeek — insufficient balance
- OpenRouter — rate limits too aggressive on free tier

## Tech Stack

### Next.js (React framework) — The entire app
- **Why**: Next.js combines the frontend (what you see) and backend (API calls to LLMs) into one project. No need to run two separate servers. It's the most popular React framework and has excellent documentation.
- The frontend is built with React components.
- The backend uses Next.js API routes (files in `app/api/`) to securely call LLM APIs. API keys stay on the server and are never exposed to the browser.

### Tailwind CSS — Styling
- **Why**: Instead of writing custom CSS files, you add styling classes directly to your HTML elements. It's fast to build with and keeps things simple. No separate stylesheet to manage.

### TypeScript — Language
- **Why**: TypeScript is JavaScript with type checking. It catches bugs before they happen (like passing a number where a string is expected). Every modern Next.js project uses it, and Claude Code works great with it.

## Architecture (keep it simple)

```
Browser (React UI)
    |
    v
Next.js API Route (/api/query)
    |
    +---> Anthropic API (Claude)
    +---> Google AI API (Gemini)
    +---> xAI API (Grok)
    +---> DeepSeek API (DeepSeek)
    +---> OpenRouter API (Llama, Qwen, DeepSeek R1, etc.)
    |
    v
All responses streamed back to the browser
```

The API route fans out requests to all providers in parallel, then streams responses back as they arrive. Each LLM response appears in its own panel in the UI.

## Design System (Awwwards/Godly standard)

### Philosophy
We design like Linear and Raycast — bold typography, generous whitespace, purposeful motion, warm dark surfaces. Every element earns its place. Restraint is the superpower.

### Anti-patterns (NEVER do these)
- No purple/blue gradients (the "AI slop" tell)
- No default Tailwind colors — always use custom tokens
- No glassmorphism/backdrop-blur on cards (overused, dated)
- No generic card-grid-on-dark-bg patterns
- No system fonts as display text
- No gradient text for headings
- No neon glow effects on inputs
- No bouncy spring animations — use intentional easing
- No "startup template" aesthetic

### Typography
- **Display font**: Space Grotesk (distinctive character, not generic)
- **Body/UI font**: Geist Sans (clean, modern)
- **Mono font**: Geist Mono (for code/response text)
- **Heading scale**: text-6xl → text-4xl → text-2xl → text-lg (large jumps create drama)
- **Letter-spacing**: -0.02em to -0.04em on headings (tight = premium)
- **Line-height**: 1.1 on headings, 1.6 on body

### Color Tokens
```
--bg:             #0c0c0c     (near-black, warm)
--surface:        #141414     (raised cards)
--surface-hover:  #1a1a1a     (interactive)
--border:         rgba(255,255,255,0.05)
--border-hover:   rgba(255,255,255,0.12)
--text-primary:   #e8e8e6     (warm off-white)
--text-secondary: #999
--text-tertiary:  #555
--text-muted:     #333
--accent:         #d4a574     (warm amber — ONE accent, used sparingly)
--accent-hover:   #c4956a
```

### Spacing (base-4 scale, generous)
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px
- Sections need room to breathe: py-20 minimum between major sections
- Cards: gap-3 to gap-4 (tight grid = dashboard feel)

### Motion (Framer Motion)
- **Easing**: [0.25, 0.1, 0.25, 1] (cubic-bezier) — smooth, not bouncy
- **Duration**: 0.3s–0.5s for UI, 0.6s–0.8s for hero entrances
- **Stagger**: 0.05s–0.08s between grid items
- **No spring physics** on cards — use easeOut
- **Cursor blink**: step-end timing (terminal-like, not smooth pulse)

### Layout
- Max-width: 5xl (1024px) for content, 2xl (672px) for search
- Response grid: 1 col mobile → 2 col tablet → 3 col desktop
- Hero section: centered, generous vertical padding (pt-20 pb-12)
- Search bar: the centerpiece, prominent, clearly the main interaction

### Self-Critique Loop
After any UI change, use Puppeteer to screenshot localhost:3000, compare to references (Linear, Raycast, Cursor), and fix the 3 biggest gaps before shipping.

## Coding Preferences

- **Clean, well-commented code.** Every function and non-obvious block should have a plain English comment explaining what it does.
- **Simple architecture.** No unnecessary abstractions, no over-engineering. If something can be done in a straightforward way, do it that way.
- **No unnecessary complexity.** Don't add features, patterns, or libraries unless they're actually needed.
- **Flat file structure.** Avoid deeply nested folders. Keep things easy to find.

## Key Decisions

- API keys are stored in `.env.local` (never committed to git).
- All LLM calls happen server-side (in API routes) to protect API keys.
- Responses are streamed so the user sees text appear in real-time, not after a long wait.
- ASCII Hydra background: load REAL dragon artwork → remove background → convert to ASCII → breathing + shimmer only (wave distortion removed). Future: animate from 3D model video, not 2D image warping. NEVER try to draw dragons with code shapes.
- 4 design variants exist: main page, Arena (crimson), Sanctum (gold/blue), Nexus (cyan/cyberpunk). Each has its own hydra variant.
- Output display formats: Editorial cards (Design C), Bento grid, Columns, Stacks — all built, user likes all 4, wants a toggle.
- YouTube transcripts: MCP server `youtube-transcript` installed + `yt-dlp` available as fallback.

## Current State (updated Session 3)

### What's working:
- **Real LLM API integration**: All 5 providers streaming real responses via SSE
- **Full RAG pipeline**: Query classification → rewriting → multi-source search (Jina + Google News RSS + HackerNews) → Jina Reranker → smart snippet extraction → dynamic prompt building
- **RAG quality tuning**: Domain diversity (max 2/domain), shorter low-relevance snippets (600 chars), stronger ignore framing, raised skip threshold (0.15), HN for general queries
- **Web search toggle**: On all pages (main + 3 design variants)
- **LLM toggle**: Clickable model pills to select/deselect which models to query
- **Sources panel**: On all pages — horizontal scrollable strip with trust tiers, freshness tags, domain info
- **Knowledge cutoff display**: Verified cutoff dates shown on every response card
- **Focus/Expand mode**: Click expand icon on any card → full-width overlay modal, Escape to close
- **Merge feature**: `/api/merge` endpoint streams Claude synthesis of all/selected responses into a "super response" via MergeCard component
- **Copy features**: Per-card copy (hover action), Copy All/Selected (action bar), selection checkboxes
- **Layout toggle**: Grid/columns/stack icon buttons in action bar
- **Hover effects**: Cards glow + scale on hover, reveal copy/expand action icons
- **Usage tracker**: `/usage` page tracking requests, tokens, costs per provider
- **Navigation**: Footer nav on main page (Arena/Sanctum/Nexus/Usage), Home links on all variant pages
- **Responsive**: All 4 pages tested at mobile/tablet/desktop — Arena auto-fit grid, Sanctum circle scaling, Nexus mobile spacing
- All API keys configured in `.env.local` (Claude, Gemini/Gemma, Groq, Jina)
- 4 page designs all fully functional: main (`/`), Arena, Sanctum, Nexus

### What needs work:
- **Hydra animation**: Wave distortion removed. Video-to-ASCII pipeline exists (scripts/, AsciiPlayer.tsx, hydra-anim.json) but rendering quality was too low. Needs: higher-quality source video, better ASCII rendering, smoother playback. Currently static with breathing + shimmer.
- **RAG v2 options**: Brave Search, Exa AI semantic search, Gemini native grounding, Claude native web search (all cost money or require migration).
- **Gemini rate limits**: Free tier (10 RPM / 250 RPD) gets hit during heavy testing. Resets automatically.

### Exact next step:
Improve hydra animation — the video-to-ASCII pipeline is built but the rendering quality needs significant work. Try: higher resolution source, canvas-based renderer with better font metrics, or a completely different approach (e.g. Blender pre-rendered frames at exact ASCII resolution).
