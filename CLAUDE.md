# Hydra — Project Brief for Claude Code

## What is Hydra?

Hydra is a web app that lets you type one search query and sends it to multiple LLMs at the same time, displaying all responses side by side. Think of it as a "compare all" tool for AI models.

## Supported LLMs

Hydra connects to LLMs through a mix of direct APIs and OpenRouter:

### Direct API connections:
- **Claude** (Anthropic) — via Anthropic API. Covered by the user's Max account.
- **Gemini** (Google) — via Google AI Studio free tier. Rate limits: 10 RPM, 250 requests/day.
- **Grok** (xAI) — via xAI API. $25 free credits on signup.
- **DeepSeek** — via DeepSeek API. Free tokens on signup, then very cheap.

### Via OpenRouter (free models, $0/token):
- **Llama 4 Maverick** (Meta)
- **Qwen3-235B** (Alibaba)
- **DeepSeek R1** (reasoning variant)
- And any other free models on OpenRouter

OpenRouter rate limits on free tier: ~20 req/min, ~200 req/day.

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
- ASCII Hydra background: load REAL dragon artwork → remove background → convert to ASCII → animate with wave distortion. NEVER try to draw dragons with code shapes.
- 4 design variants exist: main page, Arena (crimson), Sanctum (gold/blue), Nexus (cyan/cyberpunk). Each has its own hydra variant.
- Output display formats: Editorial cards (Design C), Bento grid, Columns, Stacks — all built, user likes all 4, wants a toggle.
- YouTube transcripts: MCP server `youtube-transcript` installed + `yt-dlp` available as fallback.

## Current State (updated Session 1)

### What's working:
- Next.js scaffold with all dependencies (Anthropic SDK, Google AI, OpenAI, Motion, react-markdown, Three.js)
- All 7 provider modules (Claude, Gemini, Grok, DeepSeek, 3x OpenRouter) with SSE streaming API route
- 4 page designs: main (`/`), Arena (`/design/1`), Sanctum (`/design/2`), Nexus (`/design/3`)
- 4 card/output components: Editorial (CardDesignC), Terminal (CardDesignA), Gradient Glass (CardDesignB), Stacks (accordion)
- ASCII Hydra backgrounds on all 4 pages using real artwork → ASCII conversion with independent head wave distortion
- Mock streaming works on all pages
- GitHub repo live at https://github.com/scadkin/hydra
- Puppeteer installed for screenshot comparison workflow
- Permissive allowlist configured in `.claude/settings.local.json`

### What needs work:
- **Hydra animation**: Wave distortion approach is better than chunk-moving but heads still don't move convincingly enough. User wants heads/necks to move like real dragons, not just rippling ASCII. May need a fundamentally different animation approach (pre-rendered frames like Ghostty, or actual 3D model with ASCII post-processing).
- **Hydra isolation**: Background removal via thresholding works but is imprecise — some background bleeds through, some creature detail gets stripped.
- **Design polish**: All 4 designs need continued refinement. User wants "award-winning, eye-catching, dramatic" — not minimalist.
- **Output format toggle**: User wants to toggle between the 4 output display formats (cards, bento, columns, stacks) on any design.
- **Real API integration**: All pages still use mock streaming data. Need to wire up to actual `/api/query` endpoint with real API keys.
- **2 new design variants**: User asked for 2 more completely different designs (old Lab/Forge were scrapped, replaced with Sanctum/Nexus). May want more.

### Exact next step:
Continue iterating the Hydra ASCII art animation (make heads/necks move more realistically), then wire up real LLM API integration (Task 5), then continue design polish.
