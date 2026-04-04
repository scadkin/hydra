# Hydra — Session History

## Session 1 (2026-04-01 to 2026-04-04)

### What changed
- **Project created from scratch**: GitHub repo, Next.js scaffold, all dependencies
- **Full backend built**: 7 LLM provider modules (Claude, Gemini, Grok, DeepSeek, 3x OpenRouter free models), SSE streaming API route with parallel fan-out and 60s timeouts, provider metadata endpoint
- **4 complete page designs created**:
  - Main page: warm amber, editorial cards, bold hero headline
  - Arena (/design/1): dark black + crimson, full-width command bar, dense grid
  - Sanctum (/design/2): midnight blue + gold, summoning circle with oracle dots
  - Nexus (/design/3): cyberpunk black + cyan, terminal prompt, horizontal card carousel
- **4 output display formats built**: Editorial (CardDesignC), Terminal (CardDesignA), Gradient Glass (CardDesignB), Stacks/Accordion
- **ASCII Hydra background system**: Shared AsciiRenderer engine that loads real dragon artwork, removes background via brightness thresholding, converts to ASCII characters at full screen resolution, and animates with localized wave distortion per head region. 4 unique variants with different source art and colors.
- **Multiple design iterations**: Started generic (purple glassmorphism), got feedback, studied Linear/Raycast/Cursor, stripped back to minimal, got feedback that it was too minimal, added bold headlines + Space Grotesk font, created multiple design variants, iterated ASCII hydra through ~8 versions
- **Dev tooling**: Puppeteer installed for screenshot comparison workflow, YouTube transcript MCP server configured, permissive allowlist in settings.local.json

### Key decisions
- **LLM lineup**: Claude (direct, Max account), Gemini (direct, free tier), Grok (direct, free credits), DeepSeek (direct, free tokens), Llama/Qwen/DeepSeek R1 (via OpenRouter, free models)
- **Tech stack**: Next.js 16 + TypeScript + Tailwind CSS 4 + Motion (Framer Motion) + react-markdown + Three.js
- **Design direction**: Award-winning quality, dark themes, dramatic/bold (not minimalist), Space Grotesk for display font, warm amber accent color
- **ASCII approach**: Real artwork → background removal → full-res canvas → ASCII downsampling. NOT procedural geometry. NOT hand-drawn code shapes.
- **Architecture**: Each provider has unique ID, API route accepts optional provider filter, SSE events include fullText on done (for future combine/summarize features)
- **Output formats**: User likes all 4 (editorial, terminal, gradient glass, stacks), wants a toggle to switch between them
- **Cost**: Everything free — all APIs on free tiers, Next.js open source, deploy to Vercel free tier

### Design evolution
1. v1: Generic AI template (purple glassmorphism, aurora blobs) → rejected as cliché
2. v2: Cold gray minimalist → rejected as too plain
3. v3: Warm surfaces, monospace-heavy → rejected as too developer-admin
4. v4: Bold headline, Space Grotesk, warm amber → better but still "basic"
5. v5+: Multiple layout variants created (Arena, Sanctum, Nexus), ASCII hydra backgrounds, editorial card design chosen as favorite
6. ASCII Hydra progression: hand-drawn ASCII text → Three.js primitives → Three.js AsciiEffect → canvas drawing at ASCII res → canvas drawing at FULL res with downsampling → real artwork conversion (breakthrough moment) → background isolation → wave distortion animation

### Archived from CLAUDE.md
(Nothing archived — all content in CLAUDE.md is still relevant)
