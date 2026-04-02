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

## Coding Preferences

- **Clean, well-commented code.** Every function and non-obvious block should have a plain English comment explaining what it does.
- **Simple architecture.** No unnecessary abstractions, no over-engineering. If something can be done in a straightforward way, do it that way.
- **No unnecessary complexity.** Don't add features, patterns, or libraries unless they're actually needed.
- **Flat file structure.** Avoid deeply nested folders. Keep things easy to find.

## Key Decisions

- API keys are stored in `.env.local` (never committed to git).
- All LLM calls happen server-side (in API routes) to protect API keys.
- Responses are streamed so the user sees text appear in real-time, not after a long wait.
- The UI is a simple grid: one text input at the top, response panels below.
