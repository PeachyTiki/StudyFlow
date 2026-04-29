# StudyFlow — AI Setup Instructions

Set up your entire study schedule in under 5 minutes using ChatGPT or Claude.

---

## How It Works

StudyFlow uses a simple AI-assisted setup process. You paste a ready-made prompt into any AI chat assistant, answer a few questions about your courses and schedule, and the AI generates a JSON file you import directly into the app.

---

## Step-by-Step

### Step 1 — Get the prompt
Open the app → go to **Settings** → tap **📋 Get AI Prompt**

This downloads a text file called `studyflow-ai-setup-prompt.txt`.

### Step 2 — Paste into ChatGPT or Claude
Open [chatgpt.com](https://chatgpt.com) or [claude.ai](https://claude.ai)

Copy the entire contents of the prompt file and paste it as your first message.

### Step 3 — Answer the questions
The AI will ask you about:
- Your **university** and **semester** dates
- Your **subjects** (name, lectures, exercises, exam date, past papers)
- Your **study schedule** (start date, tasks per day, deadline, 3× weekend split, etc.)
- Your **preferences** (language, session durations, dark/light theme)

Answer each question. The AI will keep asking until it has everything it needs.

### Step 4 — Get the JSON
Once the AI has all the information, it will output a block of JSON text.

Copy it and save it as a file named `my-schedule.json` (or any name ending in `.json`).

### Step 5 — Import into StudyFlow
Open the app → **Settings** → tap **📂 Import JSON** → select your `.json` file.

Your complete schedule, subjects, and settings load instantly. Done.

---

## What the AI Will Ask You

| Section | Questions |
|---|---|
| University & Semester | Name, type (summer/winter), start/end dates |
| Subjects | Name, group, lecture count, exercise count, exam date, past papers |
| Schedule | Start date, tasks per weekday/weekend, deadline, buffer weeks, what to include |
| Preferences | Language, session durations, theme |

---

## Tips

- **Weekend multiplier**: A popular split is 2 tasks per weekday and 6 per weekend (3× more on weekends). Good for lighter weekdays and intensive weekend study blocks.
- **Buffer weeks**: Setting 2 buffer weeks means the AI schedules everything to finish 2 weeks before your hard deadline — giving you revision time.
- **Past exams**: If you don't have past exam papers yet, set the count to 0. You can always add them later in the Subjects tab.
- **Multiple subjects**: Just keep saying "yes" when the AI asks for more subjects. Add them all in one session.

---

## Importing Again

You can re-import at any time. Each import **replaces all existing data** (subjects, schedule, progress). Use the **Backup** button in Settings first if you want to save your current progress.

---

## Troubleshooting

**"Import failed" error**
Make sure you copy *only* the JSON block the AI outputs — no explanation text around it, no code fences (` ``` `). Just the raw `{ ... }` object.

**The AI added extra text around the JSON**
Ask it: *"Please output only the raw JSON, no explanation or code fences."*

**Missing subjects or wrong schedule**
You can re-run the AI setup at any time with corrected information and re-import.

---

*StudyFlow — all data stored locally on your device. No account required.*
