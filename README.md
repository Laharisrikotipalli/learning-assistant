# 🦞 ClawTutor — Personalized AI Learning Assistant on Telegram

A self-hosted Telegram bot that onboards users to understand their technical interests and delivers a curated daily brief every evening — 5 tailored interview questions and 3–5 fresh technical tidbits. Built with Node.js, Docker, and OpenClaw-compatible skill architecture.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Quick Start (Docker — Recommended)](#quick-start-docker--recommended)
5. [Manual Setup (Without Docker)](#manual-setup-without-docker)
6. [Onboarding Trigger: Standing Order (Rationale)](#onboarding-trigger-standing-order-rationale)
7. [Cron Job Configuration](#cron-job-configuration)
8. [OpenClaw Configuration Reference](#openclaw-configuration-reference)
9. [Skills Reference](#skills-reference)
10. [Testing the System](#testing-the-system)
11. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Architecture Overview

```
User on Telegram
      │
      ▼
Telegram API ──► Node.js Bot Gateway
                      │
          ┌───────────┴──────────────┐
          │                          │
   Standing Order               Cron Scheduler
   (new user detected)          (9 PM nightly)
          │                          │
          ▼                          ▼
  user-onboarding/           daily-quiz/
    SKILL.md                   SKILL.md
          │                          │
          ├── memory_store (write)    ├── memory_store (read profile)
          │                          ├── web_search (fresh content)
          │                          ├── memory_store (write recent topics)
          │                          └── Telegram (send formatted message)
          ▼
   Profile saved in
   Persistent Memory (/data/memory)
```

The system is built on these primitives:

- **Gateway** — The persistent Node.js process that handles Telegram messages and orchestrates everything.
- **Skills** — Markdown files (`SKILL.md`) that define the agent's behavior in natural language.
- **Tools** — `web_search` and `memory_store` for live content and persistent state.
- **Persistent Memory** — JSON files in `/data/memory` that survive container reboots.
- **Standing Order** — Conditional trigger that fires the onboarding skill for any new user.
- **Cron Scheduler** — Schedules the daily quiz at 9 PM in the user's local timezone.
- **Telegram Plugin** — Communication bridge between the agent and the user.

---

## Project Structure

```
learning-assistant/
├── skills/
│   ├── user-onboarding/
│   │   └── SKILL.md          # Onboarding conversation flow
│   └── daily-quiz/
│       └── SKILL.md          # Daily brief generation logic
├── config/
│   └── openclaw.json         # OpenClaw configuration (no real secrets)
├── index.js                  # Main bot gateway
├── setup.js                  # One-time automation registration script
├── Dockerfile                # Container image
├── docker-compose.yml        # Orchestrates bot + Ollama services
├── package.json
├── .env.example              # Documents all required environment variables
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Docker & Docker Compose** — [Install Docker](https://docs.docker.com/get-docker/)
- **Telegram account** to create and test the bot
- **BotFather token** (see Step 2 below)
- Optional: An OpenAI or Anthropic API key if you prefer a cloud LLM over local Ollama

---

## Quick Start (Docker — Recommended)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/learning-assistant.git
cd learning-assistant
```

### Step 2 — Create Your Telegram Bot

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts (name it e.g. `MyStudyBuddyBot`).
3. Copy the **HTTP API token** BotFather gives you.

### Step 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and set your token:

```
TELEGRAM_BOT_TOKEN=your_actual_token_here
```

> ⚠️ Never commit `.env` to version control. It is already listed in `.gitignore`.

### Step 4 — Start the Stack

```bash
docker-compose up -d --build
```

This will:
- Pull and start the **Ollama** server (first run takes a few minutes to download the model).
- Build and start the **bot gateway** connected to your Telegram bot.

### Step 5 — Verify It's Running

```bash
docker logs -f clawtutor-openclaw
```

You should see:
```
ClawTutor Bot Started
```

### Step 6 — Register Automation (run once)

```bash
docker exec -it clawtutor-openclaw node /app/setup.js
```

This registers:
- The **Standing Order** — triggers onboarding for any new user automatically.
- The **nightly cron job** — sends the daily brief at 9 PM.

### Step 7 — Test It

Go to Telegram, find your bot, and send `Hello`. It will immediately start the onboarding conversation.

---

## Manual Setup (Without Docker)

### 1. Install Node.js (LTS)

Download from [nodejs.org](https://nodejs.org).

### 2. Install dependencies

```bash
npm install
```

### 3. Install and Start Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

ollama pull llama3:8b
ollama serve
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env and add your TELEGRAM_BOT_TOKEN
```

### 5. Start the bot

```bash
npm start
```

### 6. Register Automation

```bash
node setup.js
```

---

## Onboarding Trigger: Standing Order (Rationale)

**Method chosen: Standing Order**

A **Standing Order** is a persistent conditional rule that evaluates on every incoming message. If the condition is true, the onboarding skill executes automatically before any other response.

The Standing Order used here:

```
IF memory.user_profile_{{user.id}} does not exist → RUN skill: user-onboarding
```

Implemented via:

```bash
openclaw standing-orders add \
  --name "trigger-user-onboarding" \
  --if "memory.user_profile_{{user.id}} does not exist" \
  --run-skill "user-onboarding"
```

**Why Standing Order over a Webhook?**

| Factor | Standing Order | Webhook |
|---|---|---|
| Complexity | Low — single CLI command | High — requires an HTTP endpoint |
| Maintenance | Zero — handled by the Gateway | Requires running a separate server |
| Reliability | Built into the Gateway process | External dependency; potential downtime |
| Portability | Works in any OpenClaw setup | Requires public URL or tunneling (ngrok) |
| Use case fit | Reactive to memory state — ideal here | Better for event-driven external integrations |

Since the condition is purely internal (whether a memory key exists), the Standing Order is the cleanest, most robust solution. It handles multi-user scenarios naturally — each user's ID is interpolated at runtime.

---

## Cron Job Configuration

The daily quiz is scheduled with:

```bash
openclaw cron add \
  --name "nightly-tech-brief" \
  --cron "0 21 * * *" \
  --tz "Asia/Kolkata" \
  --session isolated \
  --message "Run the daily-quiz skill for the primary user. Use their stored preferences to generate and send the daily brief to them on Telegram." \
  --announce \
  --channel telegram
```

**Cron flags explained:**

| Flag | Value | Purpose |
|---|---|---|
| `--name` | `nightly-tech-brief` | Unique identifier for this job |
| `--cron` | `0 21 * * *` | Run at 21:00 (9 PM) every day |
| `--tz` | `Asia/Kolkata` | Timezone for the schedule |
| `--session isolated` | — | Fresh context; no bleed from previous sessions |
| `--message` | (prompt) | Instruction given to the agent when the job runs |
| `--announce` | — | Sends the result to the user |
| `--channel telegram` | — | Delivers via the Telegram plugin |

**For multi-timezone users:** The onboarding skill captures each user's timezone. Update the cron job after onboarding:

```bash
openclaw cron update "nightly-tech-brief" --tz "{{user.timezone}}"
```

---

## OpenClaw Configuration Reference

The file at `config/openclaw.json` configures the entire system. No real secrets are included — all sensitive values use environment variable references.

```json
{
  "agent": {
    "name": "StudyBuddyBot",
    "description": "A personalized daily tech brief and interview prep assistant delivered via Telegram."
  },
  "llm": {
    "provider": "ollama",
    "model": "llama3:8b",
    "options": {
      "temperature": 0.7,
      "num_ctx": 4096
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true,
        "package": "@openclaw/plugin-telegram",
        "config": {
          "botToken": "${env.TELEGRAM_BOT_TOKEN}"
        }
      }
    }
  },
  "tools": {
    "web_search": {
      "enabled": true,
      "provider": "duckduckgo"
    },
    "memory_store": {
      "enabled": true,
      "persistPath": "/data/memory"
    }
  },
  "skills": {
    "directory": "/app/skills"
  }
}
```

**To use a cloud LLM instead of Ollama**, replace the `llm` block:

```json
"llm": {
  "provider": "openai",
  "model": "gpt-4o",
  "apiKey": "${env.OPENAI_API_KEY}"
}
```

**For Anthropic Claude:**

```json
"llm": {
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "apiKey": "${env.ANTHROPIC_API_KEY}"
}
```

---

## Skills Reference

### `skills/user-onboarding/SKILL.md`

Defines a conversational onboarding flow that:
- Greets the user warmly
- Asks 4 sequential questions one at a time (domains, level, goals, timezone)
- Saves the profile to `memory_store` under key `user_profile_{{user.id}}`
- Confirms the saved data with the user

**Memory schema stored:**
```json
{
  "domains": ["DevOps", "AWS", "Python"],
  "level": "beginner",
  "goals": ["interview preparation"],
  "timezone": "Asia/Kolkata"
}
```

### `skills/daily-quiz/SKILL.md`

Defines the daily brief generation logic that:
- Reads the user profile from `memory_store`
- Runs `web_search` queries for each of the user's domains
- Generates exactly 5 interview questions (varied by type and difficulty)
- Synthesizes 3–5 technical tidbits from live search results
- Sends a formatted Telegram message

**Output message format:**
```
🦞 *Your Daily Tech Brief* — Friday, 22 May 2026

━━━━━━━━━━━━━━━

🧠 *Interview Questions*

*Q1 [Conceptual — DevOps]*
Explain the difference between blue-green and canary deployments...

*Q2 [Coding — Python]*
Write a Python function that retries a failed HTTP request up to 3 times...

... (5 questions total)

━━━━━━━━━━━━━━━

💡 *Today's Tidbits*

• AWS announced Graviton4 instances offering 40% better price-performance...

... (3–5 tidbits)

━━━━━━━━━━━━━━━

_Reply *answers* to get feedback, or *more* for extra questions._
```

---

## Testing the System

### Test Onboarding

Send any message to your bot from Telegram. It will immediately begin the onboarding conversation. After completing it, verify the profile was saved:

```bash
docker exec -it clawtutor-openclaw ls /data/memory
docker exec -it clawtutor-openclaw cat /data/memory/user_YOUR_USER_ID.json
```

### Test the Daily Quiz Manually

```bash
docker exec -it clawtutor-openclaw openclaw cron trigger "nightly-tech-brief"
```

### Verify Cron Job is Registered

```bash
docker exec -it clawtutor-openclaw openclaw cron list
```

### Check Gateway Logs

```bash
docker logs -f clawtutor-openclaw
```

### Restart the Stack

```bash
docker-compose restart clawtutor
```

### Full Clean Restart

```bash
docker-compose down
docker-compose up -d --build
```
