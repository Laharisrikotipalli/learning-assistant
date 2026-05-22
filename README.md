# 🦞 ClawTutor — Personalized AI Learning Assistant on Telegram

ClawTutor is a Dockerized OpenClaw-powered Telegram AI learning assistant built using Ollama local LLMs.

The assistant helps users:
- Prepare for technical interviews
- Stay updated with technology trends
- Receive personalized learning assistance
- Store and manage learning preferences persistently

The bot automatically onboards users through Telegram, stores user preferences, and uses those preferences for personalized future interactions.

---

# Architecture
┌─────────────────────┐
                │     Telegram User   │
                └─────────┬───────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │ Telegram Bot API    │
                └─────────┬───────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │ OpenClaw Gateway    │
                │                     │
                │ - Session Handling  │
                │ - Skill Routing     │
                │ - Message Processing│
                │ - Cron Workflows    │
                └─────────┬───────────┘
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
 ┌────────────────┐ ┌──────────────┐ ┌────────────────┐
 │ user-onboarding│ │ daily-quiz   │ │ memory_store   │
 │ skill          │ │ skill        │ │                │
 └────────────────┘ └──────────────┘ └────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │ Ollama Local LLM    │
                │ llama3.2:3b         │
                └─────────────────────┘

# Features

- Telegram onboarding assistant
- Persistent user profile storage
- Dockerized deployment
- Ollama local AI integration
- OpenClaw-based architecture
- Personalized daily quiz workflow
- Local-first privacy-focused setup
- Persistent memory storage

---

# Tech Stack

- Node.js
- Docker & Docker Compose
- Telegram Bot API
- Ollama
- OpenClaw
- JSON-based persistent storage

---

# Project Structure

```text
learning-assistant/
├── skills/
│   ├── user-onboarding/
│   │   └── SKILL.md
│   └── daily-quiz/
│       └── SKILL.md
├── config/
│   └── openclaw.json
├── Dockerfile
├── docker-compose.yml
├── index.js
├── setup.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

The `config/openclaw.json` file contains the OpenClaw gateway, Telegram plugin, Ollama model, and tool configuration required for the assistant.

---

# Environment Variables

Create a `.env` file in the project root.

Example:

```env
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
OLLAMA_HOST=http://ollama:11434
```

---

# Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/learning-assistant.git
cd learning-assistant
```

---

## 2. Install Ollama

Download Ollama:

https://ollama.com/download

Pull required model:

```bash
ollama pull llama3.2:3b
```

Verify installed models:

```bash
ollama list
```

---

## 3. Start Docker Containers

```bash
docker-compose up -d --build
```

---

## 4. Verify Running Containers

```bash
docker ps
```

Expected containers:

- clawtutor-openclaw
- studybuddy-ollama

---

## 5. View Logs

```bash
docker logs -f clawtutor-openclaw
```

Expected output:

```text
ClawTutor Bot Started
```

---

# Telegram Usage

1. Open Telegram
2. Search for your configured bot
3. Send:

```text
/start
```

or

```text
Hello
```

4. The bot automatically begins onboarding.

The onboarding flow collects:
- Technical domains
- Experience level
- Learning goals
- User timezone

The collected preferences are stored persistently.

---

# Onboarding Trigger Design

The onboarding flow is triggered automatically when a Telegram user sends their first message to the bot.

The system checks whether a stored profile exists for the user:

```text
user_profile_{{user.id}}
```

If no profile exists, the `user-onboarding` skill is automatically executed.

This approach was chosen because:
- It is simple and reliable
- No external webhook infrastructure is required
- It integrates naturally with Telegram polling
- It works well for local Docker deployments

---

# Persistent Memory

User profiles are stored locally.

Example structure:

```json
{
  "domains": ["Python", "AWS"],
  "level": "Intermediate",
  "goals": ["Interview Preparation"],
  "timezone": "Asia/Kolkata"
}
```

Memory location:

```text
/data/memory/
```

Check stored profiles:

```bash
docker exec -it clawtutor-openclaw ls /data/memory
```

---

# Skills

## 1. user-onboarding

Responsible for:
- Greeting users
- Collecting preferences
- Saving profiles
- Managing onboarding flow

Location:

```text
skills/user-onboarding/SKILL.md
```

---

## 2. daily-quiz

Responsible for:
- Personalized interview questions
- Technical tidbits workflow
- Daily learning assistance

Location:

```text
skills/daily-quiz/SKILL.md
```

---

# Daily Quiz Workflow

A cron job named:

```text
nightly-tech-brief
```

is configured to generate a personalized daily technical brief workflow.

Verify cron job:

```bash
openclaw cron list
```

---

# Daily Tech Brief Format

The generated daily brief contains:

- 5 personalized interview questions
- 3–5 technical tidbits
- Domain-specific learning content
- Difficulty tailored to the user's experience level

The workflow uses:
- Stored user preferences
- Web search
- Personalized skill prompts

---

# Docker Services

## ClawTutor Bot

Main Telegram assistant service.

Port:

```text
3000
```

---

## Ollama

Local LLM inference engine.

Port:

```text
11434
```

---

# Privacy & Local AI

- No cloud database required
- User data stored locally
- Ollama runs fully offline
- No external AI API dependency required

---

# Useful Commands

## Start Containers

```bash
docker-compose up -d
```

---

## Stop Containers

```bash
docker-compose down
```

---

## Restart Containers

```bash
docker-compose restart
```

---

## Rebuild Containers

```bash
docker-compose up -d --build
```

---

## View Logs

```bash
docker logs -f clawtutor-openclaw
```

---

## Check Ollama Models

```bash
ollama list
```

---

# openclaw.json Example

```json
{
  "gateway": {
    "mode": "local"
  },

  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      },

      "ollama": {
        "enabled": true
      }
    }
  },

  "llm": {
    "provider": "ollama",
    "model": "llama3.2:3b"
  }
}
```

---

# .env.example

```env
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
OLLAMA_HOST=http://ollama:11434
```

---

# .gitignore

```gitignore
node_modules/
.env
logs/
*.log
.openclaw/
data/
.vscode/
.idea/
```

---

# Future Improvements

- Real-time daily quiz delivery
- Smarter personalized learning
- Multi-user support
- PostgreSQL integration
- Voice-enabled interactions
- Web dashboard

---

# Author

Built as part of an AI Automation & OpenClaw workflow project.

---