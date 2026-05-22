#!/usr/bin/env node
/**
 * setup.js — Run this ONCE after `openclaw gateway start` to register
 * the Standing Order (onboarding trigger) and the nightly cron job.
 *
 * Usage:
 *   node setup.js
 *
 * In Docker:
 *   docker exec -it clawtutor-openclaw node /app/setup.js
 */

const { execSync } = require("child_process");

function run(label, cmd) {
  console.log(`\n⚙️  ${label}...`);
  try {
    execSync(cmd, { stdio: "inherit" });
    console.log(`✅ Done: ${label}`);
  } catch (err) {
    console.error(`❌ Failed: ${label}`);
    console.error(err.message);
    process.exit(1);
  }
}

// 1. Register Standing Order — triggers onboarding for any new user
run(
  "Registering Standing Order for user onboarding",
  `openclaw standing-orders add \
    --name "trigger-user-onboarding" \
    --if "memory.user_profile_{{user.id}} does not exist" \
    --run-skill "user-onboarding"`
);

// 2. Register nightly cron job — sends daily brief at 9 PM
//    Default timezone: Asia/Kolkata — update with user's timezone after onboarding
run(
  "Registering nightly-tech-brief cron job",
  `openclaw cron add \
    --name "nightly-tech-brief" \
    --cron "0 21 * * *" \
    --tz "Asia/Kolkata" \
    --session isolated \
    --message "Run the daily-quiz skill for the primary user. Use their stored preferences to generate and send the daily brief to them on Telegram." \
    --announce \
    --channel telegram`
);

console.log("\n🦞 Setup complete! Your bot is ready.");
console.log("   → Send any message to your Telegram bot to begin onboarding.");
console.log('   → To test the quiz immediately: openclaw cron trigger "nightly-tech-brief"');