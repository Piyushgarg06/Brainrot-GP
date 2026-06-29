# 🏎️ BrainrotGP

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Python Proxy](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Railway-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Status](https://img.shields.io/badge/Vibe%20Check-Passed%20(Barely)-brightgreen?style=for-the-badge)]()

> *"Bro just held the outside line through Eau Rouge and gained 3 positions while crying to his driver's audio clip."*

**BrainrotGP** is a professional-grade, highly unnecessary, and dangerously copium-fueled second-screen companion for Formula 1 races. Built specifically for fans who watch Grand Prix at 3:00 AM, desperately refreshing timing screens like it will somehow help their favorite driver catch Max Verstappen.

It hooks into live F1 telemetry data to dynamically play **brainrot audio clips** every time a driver makes a move, crashes, or takes the lead. Yes, you will hear it. Yes, it will ruin your sleep schedule.

---

## 🏁 Key Features

### 📊 Real-Time Leaderboard
Get live standings, interval gaps, DNF alerts, and fastest laps. It’s like the official F1 timing screen, but designed by someone who has had four Energy Drinks and hasn't closed TikTok in 48 hours.

### 🔔 Context-Aware Event Toasts
Stay informed with real-time HUD alerts:
* **Leader Changes:** Play celebratory/panic soundscapes depending on who takes P1.
* **Aggressive Overtakes:** Instantly triggers toasts when a driver gains 3+ positions.
* **Fastest Laps & DNFs:** Visual and auditory notifications when a driver finds the barrier or purple sectors.
* **The Winner Announcement:** Flashes the checkered flag UI when the race is called.

### 🔊 Dynamic Driver Audio Engine
Every driver is wired up with their own iconic voice clips and memes:
* **Max Verstappen:** Whining about wind gusts or saying *"haha yes, lovely race guys"*.
* **Carlos Sainz:** Belting out *"Smooth Operator"* into your speakers.
* **Charles Leclerc:** High-fidelity screaming and despair (mostly despair).
* **Favorite Driver Mode (Copium Engine):** Pin your favorite driver to the top of your dashboard. Any time they gain a position, the app injects a hit of pure auditory dopamine. If they DNF, we hope you like sad violin.

### 🏁 Smart Race-End State
Most timing apps sit there displaying a pulsing green `LIVE 🟢` badge for six hours after the podium ceremony. BrainrotGP reads the official F1 session status. When `SessionStatus` is marked finished, the UI locks down, the polling slows to a gentle walk, and the winner’s audio plays exactly once. 

### 📡 Multi-Tab Broadcast Syncing
Uses the browser's `BroadcastChannel` API to synchronize event states and audio triggers across multiple screens. If you have three monitors and two laptops open like a race engineer, they will play the audio in unified, deafening harmony.

---

## 🛠️ The Architecture

```
┌──────────────────────────────────────┐        ┌──────────────────────────────┐
│      Next.js Frontend (Vercel)       │◄──────▶│     Python Proxy Server      │
│                                      │        │     (Railway / Docker)       │
│  • /dashboard — The Chaos Hub        │        │                              │
│  • useF1Data   — Intelligent Polling │        │  • FastF1 SignalR Client     │
│  • useAudio    — Web Audio API       │        │  • Raw Live Timing Feed      │
│  • BroadcastChannel — Multi-tab Sync  │        │  • GET /live API Endpoint    │
└──────────────────────────────────────┘        └──────────────────────────────┘
                    │ (Fallback Option)
                    ▼
          ┌───────────────────┐
          │ OpenF1 Public API │ (api.openf1.org)
          └───────────────────┘
```

The frontend operates on a hybrid data retrieval strategy:
1. **Primary Route:** Attempts to stream high-frequency data from the **Python Proxy Server**.
2. **Fallback Route:** If the proxy goes offline (or Railway cuts the free tier), it seamlessly degrades to the public **OpenF1 REST API**. 

---

## 🚀 Getting Started

### 1. Frontend Setup

Make sure you have Node.js installed, then run:

```bash
# Clone the repository
git clone https://github.com/Piyushgarg06/Brainrot-GP-The-unnecessary-second-screen-companion-for-Formula-1.git
cd brainrot-gp

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and prepare your ears.

### 2. Python Proxy Setup (Optional but based)

By default, the frontend falls back to the public OpenF1 API. However, OpenF1 has a slight delay and strict rate limits. To get raw, zero-delay data straight from F1's official SignalR feed:

```bash
# Install Python packages
pip install -r requirements.txt

# Start the proxy server
python f1_live_leaderboard.py
```

The proxy will run on `http://localhost:8080`. Add the following environment variable to your `.env.local` file:

```env
NEXT_PUBLIC_FASTF1_URL=http://localhost:8080
```

---

## 🔮 Roadmap & Future Features

We are planning to make this even more unhinged with the following additions:

* 🧠 **Driver Trivia Games:** An interactive trivia module where you can play quiz games during boring safety car periods. Guess who said the unhinged radio quote, match the driver to their career DNFs, or test your F1 brainrot knowledge to win virtual "copium points".
* 🎙️ **Custom Soundboard Uploader:** Upload your own audio files and map them to specific live events (e.g., play your own screams when your driver gets a 5-second penalty).
* 📊 **Telemetry HUD Canvas:** A live-rendered canvas HUD showing throttle/brake application, RPM, and gear selection in real-time.
* 📱 **PWA Installation:** Install BrainrotGP on your phone to keep it running next to your TV screen.

---

## ⚙️ Tech Stack

| Component | Technology | Why? |
|---|---|---|
| **Framework** | Next.js 16 / React 19 | Cutting edge. Server components & React 19 hydration. |
| **Styling** | Vanilla CSS | Tailored design tokens. No Tailwind utility bloat. We are not cowards. |
| **Animations** | Framer Motion + GSAP | Premium micro-interactions and smooth orbit components. |
| **Audio** | Web Audio API | Low-latency audio manipulation and tab synchronization. |
| **Live Timing** | FastF1 SignalR + OpenF1 | Data straight from the timing transponders. |
| **Backend** | Python 3.11 + Docker | Robust asynchronous websocket timing client. |

---

## 🤝 Credits

Created and maintained by **[Piyush Garg](https://github.com/piyushgarg-dev)**.

*Disclaimer: BrainrotGP is an unofficial fan project and is not affiliated with, endorsed by, or associated with Formula 1, the FIA, or any driver/team. We just really like F1 and brainrot memes.*

---
*“It’s not a skill issue if your favorite driver is P1 in our hearts.”*
