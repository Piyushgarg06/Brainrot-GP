# 🏎️ BrainrotGP

[![Release](https://img.shields.io/github/v/release/Piyushgarg06/Brainrot-GP?style=for-the-badge&color=e10600&label=Release)](https://github.com/Piyushgarg06/Brainrot-GP/releases)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Electron](https://img.shields.io/badge/Electron-45.3-47848F?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows)](https://github.com/Piyushgarg06/Brainrot-GP/releases)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **BrainrotGP** is a dynamic, high-fidelity second-screen companion for Formula 1 races. Built for motorsport enthusiasts who track sector deltas and telemetry at 3 AM, BrainrotGP connects live race timing with driver-specific audio triggers, real-time leaderboard shifts, and race telemetry alerts.

---

## 🪟 Windows Desktop Application (Recommended)

[![Download for Windows](https://img.shields.io/badge/Download_for_Windows-v0.2.1-e10600?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Piyushgarg06/Brainrot-GP/releases/latest)

Running BrainrotGP natively as a Windows application delivers the optimal race-day experience:

1. **Zero Cloud Hosting Bottlenecks:** The desktop app runs locally on your machine and communicates directly with the OpenF1 live telemetry API, eliminating cloud proxy limits and server bandwidth caps.
2. **Persistent Background Audio:** Unlike standard browser tabs that throttle or pause Web Audio when minimized or in the background, the Windows desktop app continues processing telemetry and playing driver overtake clips while you watch the broadcast full-screen on another monitor.
3. **Automated Updates:** Equipped with native auto-updater integration. Every time you launch BrainrotGP, it checks GitHub Releases for new updates and can update seamlessly with a single click.

👉 **[Download the Latest Windows Installer (`BrainrotGP-Setup-*.exe`)](https://github.com/Piyushgarg06/Brainrot-GP/releases/latest)**

---

## ✨ Features

### 📊 Precision Live Leaderboard
- Real-time driver order, interval gaps to leader and interval ahead, pit stop indicators, and DNF tracking.
- Fast sector identification and purple lap indicators powered by OpenF1 and FastF1 live telemetry.
- Clean high-contrast typography engineered for readability across multiple displays.

### 🔊 Dynamic Audio & Event Engine
- **Driver Radio & Anthems:** Iconic driver clips and soundtrack moments triggered dynamically on overtakes, lead changes, fastest laps, and retirements.
- **Favorite Driver Focus:** Pin your favorite driver to the top of the pit wall to prioritize their position changes and team radio triggers.
- **Focus-Aware Playback:** The landing page theme audio halts when the application is unfocused or minimized, while the live race dashboard continues monitoring telemetry and playing audio alerts in the background.

### ⏱️ Broadcast Delay Synchronization
- Live television and streaming broadcasts (such as F1 TV, Sky Sports, or ESPN) often have a 10 to 60-second broadcast latency.
- Adjust the built-in stream delay slider on the dashboard to synchronize telemetry toasts and audio cues down to the second with your broadcast.

### 🏁 Verified Session State Transitions
- Automatically responds to official FIA session status changes (`Started`, `Finished`, `Finalised`).
- Prevents stale polling loops once the checkered flag waves, concluding the session cleanly with the race winner's anthem.

---

## 🛠️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│              BrainrotGP Desktop (Windows)              │
│                                                        │
│  ┌─────────────────────────┐  ┌──────────────────────┐ │
│  │   Electron 45 Runtime   │  │   Embedded Next 16   │ │
│  │  • Native Auto-Updater  │  │  • Telemetry Polling │ │
│  │  • Background Audio     │  │  • Web Audio Engine  │ │
│  │  • Windows Window Shell │  │  • GSAP / Motion UI  │ │
│  └─────────────────────────┘  └──────────────────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │
            Direct Telemetry Requests (HTTPS)
                            ▼
               ┌─────────────────────────┐
               │    OpenF1 Live API      │
               │    (api.openf1.org)     │
               └─────────────────────────┘
```

---

## 🚀 Getting Started (Development)

If you wish to contribute, inspect the codebase, or run BrainrotGP locally from source:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17+ or v20+)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Piyushgarg06/Brainrot-GP.git
cd Brainrot-GP
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
# Web development mode
npm run dev

# Electron desktop development mode
npm run electron:dev
```

### 4. Build Windows Executable
To package the standalone Windows installer locally:
```bash
npm run electron:build
```
The resulting installer will be located in the `dist/` directory.

---

## ⚙️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Desktop Shell** | Electron 45, electron-updater, electron-builder |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Animation & UI** | GSAP, Framer Motion, Lenis Smooth Scroll |
| **Audio Processing** | Web Audio API (Low-latency programmatic audio routing) |
| **Telemetry Provider** | OpenF1 REST API, FastF1 telemetry integration |

---

## 🤝 Contributing

Contributions, bug reports, and driver clip suggestions are welcome.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License & Disclaimer

Distributed under the MIT License.

*Disclaimer: BrainrotGP is an independent open-source fan project. It is not affiliated with, endorsed by, or associated with Formula 1, Formula One Licensing B.V., Formula One Management Ltd, or the FIA. All trademarks and driver names belong to their respective owners.*
