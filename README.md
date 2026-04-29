# StudyFlow

A zero-dependency, single-file PWA study tracker for university students. Set up your entire semester schedule in minutes using AI, then track every lecture, exercise, and past exam — all stored locally on your device. No account, no server, no tracking.

---

## Features

- **Today tab** — Week calendar strip, daily task list, skip & study session buttons, exam countdown, semester progress bar
- **Subjects tab** — Semesters as tabs, subjects with lecture/exercise/past exam counts, deadlines and exam dates
- **Study mode** — Full-screen focus timer that logs session duration automatically
- **Analytics tab** — GitHub-style study heatmap, time per subject, daily and session averages
- **AI Setup** — Answer a few questions in ChatGPT or Claude, get a JSON file, import it — full schedule in under 5 minutes
- **Backup & Restore** — Full JSON export/import at any time
- **4 themes** — Dark, Light, Retro Dark, Retro Light
- **Offline-first** — Service worker caches everything; works with no connection

---

## Quick Start

### Run locally
Open `index.html` in any modern browser. That's it.

### Install as PWA (iPhone)
Open in **Safari** → Share → **Add to Home Screen**

### Install as PWA (Android Chrome)
Open in Chrome → menu → **Add to Home Screen / Install app**

### Build an APK
1. Go to [webintoapp.com](https://webintoapp.com)
2. Upload `apk/StudyFlow.zip`
3. Enable **localStorage** and disable **Pull to Refresh**
4. Build and download

### Host on GitHub Pages
Push to GitHub, enable Pages on the `main` branch root — the app is then live at:
```
https://YOUR_USERNAME.github.io/StudyFlow/
```

---

## AI Setup

The fastest way to get started. No manual data entry.

1. Open the app → **Settings** → tap **Get AI Prompt**
2. Paste the downloaded `.txt` file into [ChatGPT](https://chatgpt.com) or [Claude](https://claude.ai)
3. Answer a few questions about your subjects, schedule, and preferences
4. The AI outputs a JSON block — save it as `my-schedule.json`
5. Back in Settings → **Import JSON** → select the file

Your full semester schedule loads instantly. See `AI_SETUP_INSTRUCTIONS.md` for details.

---

## Custom App Icon

To replace the default icon:

1. Drop a PNG or JPG (512×512 recommended) into the `icon-source/` folder
2. Run: `node process-icon.js`
3. Rebuild the zip: copy the updated files into `apk/StudyFlow.zip`

---

## File Structure

```
StudyFlow/
├── index.html                  # Entire app — HTML, CSS, JS in one file
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker (offline caching)
├── icon.svg                    # Scalable icon
├── icon-192.png                # PWA icon 192×192
├── icon-512.png                # PWA icon 512×512
├── AI_SETUP_INSTRUCTIONS.md    # Guide for the AI setup flow
├── process-icon.js             # Utility: resize custom icon → icon-192/512.png
├── generate-icons.js           # Utility: regenerate default icons from scratch
├── package.json
├── LICENSE
├── README.md
├── .gitignore
├── icon-source/                # Drop your custom icon here (not tracked by git)
└── apk/
    └── StudyFlow.zip           # Ready-to-upload APK bundle
```

---

## Data & Privacy

All data is stored in your browser's `localStorage`. Nothing is sent anywhere. Clearing browser data or app storage will erase your schedule — use the **Backup** button in Settings first.

---

## License

MIT — see [LICENSE](LICENSE)
