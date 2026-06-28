# 🏎️ BrainrotGP

A real-time F1 race leaderboard and event tracker — built as a premium second-screen experience for watching Formula 1 live.

## What it does

- **Live leaderboard** — position-by-position driver grid updated in real time during a race
- **Event toasts** — instant alerts for leader changes, multi-position overtakes, fastest laps, and the race winner
- **Brainrot audio** — each driver has a unique audio clip that plays on key events (overtakes, podium, win)
- **Race-finished state** — UI automatically transitions to a "RACE FINISHED" mode when the session ends; the LIVE dot stops pulsing, polling slows down, and the winner event fires
- **Multi-tab sync** — events broadcast across open tabs via `BroadcastChannel` so audio/toasts stay in sync
- **Favorite driver** — pick a driver and get heightened alerts (any overtake triggers audio, not just 3+)

## Architecture

```
┌─────────────────────────────────┐     ┌──────────────────────────────┐
│   Next.js Frontend (Vercel)     │────▶│  Python Proxy Server         │
│                                 │◀────│  (Railway / Docker)          │
│  • /dashboard — live leaderboard│     │                              │
│  • useF1Data   — polling hook   │     │  • FastF1 SignalR client      │
│  • useEventQueue — event logic  │     │  • Subscribes to F1 live feed │
│  • useAudioEngine — Web Audio   │     │  • Exposes GET /live (JSON)   │
│  • BroadcastChannel — tab sync  │     │  • Auto-reconnects on drop    │
└─────────────────────────────────┘     └──────────────────────────────┘
         │ fallback
         ▼
   OpenF1 public API
   (api.openf1.org)
```

The frontend first tries the local/Railway proxy (`NEXT_PUBLIC_FASTF1_URL`). If unreachable it falls back to the public [OpenF1 API](https://openf1.org/).

## Local development

### 1 — Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2 — Python proxy server (optional, recommended for live races)

The proxy connects to the official F1 SignalR live-timing feed via [FastF1](https://theoehrly.github.io/Fast-F1/) and streams data to the frontend with no rate limits.

```bash
pip install -r server/requirements.txt
python server/main.py
```

The server runs on `http://localhost:8080`. Set `NEXT_PUBLIC_FASTF1_URL=http://localhost:8080` in `.env.local` to point the frontend at it.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_FASTF1_URL` | `http://localhost:8080` | URL of the Python proxy server |

## Deployment

### Frontend → Vercel

Push to GitHub and import the repo in [Vercel](https://vercel.com). Set `NEXT_PUBLIC_FASTF1_URL` to your Railway server URL.

### Python proxy → Railway (Docker)

The `Dockerfile` at the repo root builds the proxy server. Import the repo on [Railway](https://railway.app), select **Deploy from Dockerfile**, and Railway will pick it up automatically.

The `server/Procfile` is used if Railway auto-detects Python instead of Docker:

```
web: python server/main.py
```

## How race-end is detected

The proxy listens for the F1 `SessionStatus` SignalR topic. When the feed sends `"Status": "Finished"` the server sets `raceFinished: true` and `isLive: false`. The frontend also applies a client-side fallback: if `session.dateEnd` is more than 60 seconds in the past the race is treated as finished regardless.

Once finished:
- The LIVE dot becomes static grey and reads **RACE FINISHED**
- The session bar center shows **🏁 RACE FINISHED**
- Polling slows from 2 s to 10 s
- The winner event fires exactly once

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 / React 19 |
| Styling | Vanilla CSS (CSS custom properties) |
| Animations | Framer Motion, GSAP, Lenis |
| Audio | Web Audio API |
| Live data | FastF1 SignalR + OpenF1 REST |
| Proxy server | Python 3.11, FastF1, signalrcore |
| Deployment | Vercel (frontend) · Railway (proxy) |

## Credits

Built by [Piyush Garg](https://github.com/piyushgarg-dev).
