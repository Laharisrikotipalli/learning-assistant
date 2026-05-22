# 🦞 ClawTutor — Personalized AI Learning Assistant on Telegram

ClawTutor is a Dockerized Telegram-based AI learning assistant built using an OpenClaw-style skill architecture and Ollama local LLMs.

The assistant helps users:
- Prepare for technical interviews
- Stay updated with technology trends
- Receive personalized learning assistance
- Store and manage learning preferences persistently

The bot automatically onboards users through Telegram, stores their preferences, and uses those preferences for personalized future interactions.

---

#  Features

✅ Telegram onboarding assistant  
✅ Persistent user profile storage  
✅ Dockerized deployment  
✅ Ollama local AI integration  
✅ Skill-based architecture  
✅ Personalized daily quiz workflow  
✅ OpenClaw-compatible configuration  
✅ Local-first privacy-focused setup  

---

#  Tech Stack

- Node.js
- Docker & Docker Compose
- Telegram Bot API
- Ollama
- JSON-based persistent storage
- OpenClaw-style skills architecture

---

#  Project Structure

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

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

Example:

```env
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
OLLAMA_HOST=http://ollama:11434
```

---

#  Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/learning-assistant.git
cd learning-assistant
```

---

## 2. Start Ollama

Install Ollama:

https://ollama.com/download

Pull required model:

```bash
ollama pull llama3.2:3b
```

Verify:

```bash
ollama list
```

---

## 3. Start Docker Containers

```bash
docker-compose up -d --build
```

---

## 4. Verify Containers

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

Expected:

```text
ClawTutor Bot Started
```

---

# 🤖 Telegram Usage

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

#  Persistent Memory

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

#  Skills

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

#  Daily Quiz Workflow

A cron job named:

```text
nightly-tech-brief
```

is configured to generate a personalized daily technical brief workflow.

Example cron verification:

```bash
openclaw cron list
```

---

# 🐳 Docker Services

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

#  Privacy & Local AI

- No cloud database required
- User data stored locally
- Ollama runs fully offline
- No external AI API dependency required

---

#  Useful Commands

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

#  openclaw.json Example

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

  "agents": {
    "defaults": {
      "model": "ollama/llama3.2:3b"
    }
  }
}
```

---

#  .env.example

```env
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
OLLAMA_HOST=http://ollama:11434
```

---

#  .gitignore

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

#  Future Improvements

- Real-time daily quiz delivery
- Smarter personalized learning
- Multi-user support
- PostgreSQL integration
- Voice-enabled interactions
- Web dashboard

---

#  Author

Built as part of an AI Automation & OpenClaw workflow project.

---