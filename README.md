# Hydra

Type one query, get answers from multiple AI models side by side.

Hydra sends your prompt to Claude, Gemini, Grok, DeepSeek, Llama, Qwen, and more — all at the same time — and displays every response in a clean, side-by-side layout.

## How it works

1. You type a question or prompt in the search bar.
2. Hydra sends that prompt to all configured LLMs in parallel.
3. Responses stream in real-time, each in its own panel.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- API keys for the LLM providers you want to use (see below)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/hydra.git
cd hydra

# Install dependencies
npm install

# Copy the example env file and add your API keys
cp .env.example .env.local

# Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### API Keys

You'll need API keys from the providers you want to use. Copy `.env.example` to `.env.local` and fill in your keys:

| Provider | Where to get a key | Cost |
|----------|-------------------|------|
| **Claude** (Anthropic) | [console.anthropic.com](https://console.anthropic.com/) | Free with Max plan |
| **Gemini** (Google) | [aistudio.google.com](https://aistudio.google.com/) | Free tier available |
| **Grok** (xAI) | [console.x.ai](https://console.x.ai/) | $25 free credits |
| **DeepSeek** | [platform.deepseek.com](https://platform.deepseek.com/) | Free tokens on signup |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai/) | Free models available |

You don't need all keys — Hydra will only query the providers you've configured.

## Tech Stack

- **Next.js** — React framework (frontend + backend in one)
- **Tailwind CSS** — Styling
- **TypeScript** — Type-safe JavaScript

## License

MIT
