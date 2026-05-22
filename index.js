require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const MEMORY_DIR = "/data/memory";

function loadUser(chatId) {
  const file = path.join(MEMORY_DIR, `user_${chatId}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file));
  return null;
}

function saveUser(chatId, data) {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
  fs.writeFileSync(path.join(MEMORY_DIR, `user_${chatId}.json`), JSON.stringify(data, null, 2));
}

const sessions = {};

console.log("ClawTutor Bot Started");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const existing = loadUser(chatId);
  if (existing && !sessions[chatId]) {
    return bot.sendMessage(chatId, `✅ Welcome back! Your profile is already saved.\n\n📌 Domains: ${existing.domains}\n📌 Level: ${existing.level}\n📌 Goals: ${existing.goals}\n📌 Timezone: ${existing.timezone}\n\n🦞 Your daily brief arrives at 9 PM!`);
  }

  if (!sessions[chatId]) {
    sessions[chatId] = { step: 1, profile: {} };
    return bot.sendMessage(chatId, "🦞 Welcome to ClawTutor AI Learning Assistant!\n\n💻 What technical domains are you interested in?\nExample: DevOps, AWS, Python");
  }

  const user = sessions[chatId];

  if (user.step === 1) {
    user.profile.domains = text.split(",").map(s => s.trim());
    user.step = 2;
    return bot.sendMessage(chatId, "📚 What is your experience level?\n(beginner / intermediate / advanced)");
  }

  if (user.step === 2) {
    user.profile.level = text.trim();
    user.step = 3;
    return bot.sendMessage(chatId, "🎯 What are your learning goals?");
  }

  if (user.step === 3) {
    user.profile.goals = [text.trim()];
    user.step = 4;
    return bot.sendMessage(chatId, "🌍 What is your timezone?\nExample: Asia/Kolkata");
  }

  if (user.step === 4) {
    user.profile.timezone = text.trim();
    saveUser(chatId, user.profile);
    user.step = 5;
    return bot.sendMessage(chatId,
      `✅ Profile Saved Successfully!\n\n` +
      `📌 Domains: ${user.profile.domains.join(", ")}\n` +
      `📌 Level: ${user.profile.level}\n` +
      `📌 Goals: ${user.profile.goals.join(", ")}\n` +
      `📌 Timezone: ${user.profile.timezone}\n\n` +
      `🦞 ClawTutor will now send daily tech briefs at 9 PM!`
    );
  }

  if (user.step === 5) {
    return bot.sendMessage(chatId, "✅ Your onboarding is already completed. Daily brief arrives at 9 PM!");
  }
});