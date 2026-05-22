# SKILL: Daily Tech Brief and Quiz Generation

## GOAL
Your goal is to generate a high-quality, personalized daily tech brief for a user and deliver it via Telegram. The brief must contain exactly **5 interview questions** and **3 to 5 technical tidbits**, all tailored to the user's stored profile. Content must be fresh — sourced from live web searches performed during this session.

## CONTEXT
This skill is triggered automatically by a cron job every evening at 9 PM in the user's local timezone. You will be provided with the user's ID. All content must be relevant to their domains, calibrated to their experience level, and varied from previous days.

## GENERATION WORKFLOW

Follow these steps in order. Do not skip any step. Do not ask the user for clarification — this process is fully autonomous.

### Step 1 — Retrieve User Profile
Use the `memory_store` tool to fetch the user's profile.

- Key: `user_profile_{{user.id}}`
- Extract: `domains`, `level`, `goals`, `timezone`

If the profile does not exist, send the user a Telegram message asking them to complete onboarding first:
> 🦞 I couldn't find your profile! Please send me a message to get started with onboarding first.

Then stop execution.

### Step 2 — Retrieve Recently Covered Topics (for variety)
Use the `memory_store` tool to fetch the recent topics log.

- Key: `recent_topics_{{user.id}}`
- If it doesn't exist, treat it as an empty list.

This prevents repeating the same questions day after day.

### Step 3 — Conduct Web Searches
For each domain in the user's `domains` list, perform a `web_search` using the following query pattern:

```
[domain] latest news tutorial interview questions [current month] [current year]
```

Examples:
- `Python latest news best practices interview questions May 2026`
- `AWS distributed systems recent developments interview questions 2026`
- `DevOps Kubernetes latest tutorials May 2026`

**Requirements for search:**
- Run at least one search per domain.
- If the user has more than 3 domains, prioritize the first 3 and rotate others on subsequent days.
- Focus on recent, high-quality sources: official docs, engineering blogs, reputable tech publications.
- Collect enough material to generate fresh tidbits and relevant questions.

### Step 4 — Synthesize 3 to 5 Technical Tidbits
Based on the search results, synthesize **3 to 5 technical tidbits**.

A tidbit must be:
- A short, insightful fact, pattern, or recent development (2–4 sentences max)
- Directly relevant to one of the user's domains
- Accurate and grounded in the search results
- Written in plain language appropriate for the user's level
- Something genuinely interesting — not generic advice

Do NOT write tidbits like "Python is popular" or "AWS has many services." Be specific and informative.

### Step 5 — Generate Exactly 5 Interview Questions
Generate **exactly 5** interview questions. Each question must follow these criteria:

**Relevance:** Must relate directly to one of the user's `domains`.

**Difficulty:** Must match the user's `level`:
- `beginner` / `junior` → foundational concepts, no system design
- `intermediate` / `mid-level` → application and trade-offs
- `senior` / `staff` / `advanced` → architecture, scale, deep internals

**Variety:** Across the 5 questions, include a mix of these types:
- Conceptual (explain how X works)
- Coding / Algorithmic (write or trace code)
- System Design (design a component or system)
- Behavioral (describe a time when...)

**Novelty:** Cross-reference with `recent_topics_{{user.id}}`. Do not repeat a topic that was covered in the last 3 days.

**Label each question** with its type and domain in this format:
```
*Q1 [Conceptual — Python]*
```

### Step 6 — Update Recent Topics Log
After generating the 5 questions, extract the topic/domain for each question and append them to the `recent_topics_{{user.id}}` memory key.

Keep only the **last 15 entries** to avoid the list growing unbounded. Use the `memory_store` tool to write the updated list back.

### Step 7 — Format and Send the Message
Assemble the final message using **Telegram Markdown formatting**. The message must follow this exact structure:

```
🦞 *Your Daily Tech Brief* — [Day, DD Month YYYY]

━━━━━━━━━━━━━━━

🧠 *Interview Questions*

*Q1 [Type — Domain]*
[Question text here]

*Q2 [Type — Domain]*
[Question text here]

*Q3 [Type — Domain]*
[Question text here]

*Q4 [Type — Domain]*
[Question text here]

*Q5 [Type — Domain]*
[Question text here]

━━━━━━━━━━━━━━━

💡 *Today's Tidbits*

• [Tidbit 1 text — 2 to 4 sentences]

• [Tidbit 2 text — 2 to 4 sentences]

• [Tidbit 3 text — 2 to 4 sentences]

━━━━━━━━━━━━━━━

_Reply *answers* to get feedback, or *more* for extra questions._
```

**Formatting rules:**
- Use `*bold*` for section headers and question labels
- Use `_italic_` for the footer reply hint
- Use `•` bullet points for tidbits
- Use `━━━━━━━━━━━━━━━` as section dividers
- Include the actual current date in the title
- There must be **exactly 5 questions** — never 4, never 6
- There must be **3 to 5 tidbits** — never fewer than 3
- Do not include any preamble before the message — start directly with 🦞

Send the formatted message to the user via the Telegram channel.

## CONSTRAINTS
- **This process is fully autonomous.** Do not ask the user for anything. Do not send partial results.
- The quality of questions and tidbits is paramount. They must be accurate, relevant, and insightful. Never generate filler content.
- The message must be correctly formatted for readability on a **mobile device** — keep question text concise (2–4 sentences per question).
- Always use live web search results. Do not rely solely on training knowledge for tidbits — the goal is fresh, current content.
- If a web search fails for a domain, skip it and use another domain. Never block the entire job over one failed search.
- The entire workflow — from memory read to Telegram send — must complete without interruption.