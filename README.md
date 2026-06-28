# 🏎️ BrainrotGP

> *"bro just held the outside line through eau rouge and gained 3 positions while crying to his driver audio clip"*

a real-time F1 leaderboard that plays **brainrot audio** every time your driver does something. built for people who watch grand prix at 3am refreshing timing screens like it changes anything.

---

## what does it do

- 📊 **live leaderboard** — who's P1, who DNF'd into the barriers, the full picture
- 🔔 **event toasts** — leader changes, 3+ position overtakes, fastest laps, and THE WINNER
- 🔊 **brainrot audio** — each driver has a unique clip that plays on key moments. you WILL hear it
- 🏁 **race finished state** — UI actually knows when the race is done instead of sitting there going "LIVE 🟢" for the next 6 hours
- 📡 **multi-tab sync** — open it on 3 screens and every tab reacts simultaneously. unhinged behavior encouraged
- ⭐ **favorite driver** — pick your guy. any overtake = audio. copium-powered feature

---

## the architecture (for the nerds)

```
┌─────────────────────────────────┐     ┌──────────────────────────────┐
│   Next.js Frontend (Vercel)     │────▶│  Python Proxy Server         │
│                                 │◀────│  (Railway / Docker)          │
│  • /dashboard — chaos hub       │     │                              │
│  • useF1Data   — polling hook   │     │  • FastF1 SignalR client      │
│  • useEventQueue — event brain  │     │  • taps F1 live timing feed  │
│  • useAudioEngine — the noise   │     │  • Exposes GET /live (JSON)  │
│  • BroadcastChannel — tab sync  │     │  • auto-reconnects like a G  │
└─────────────────────────────────┘     └──────────────────────────────┘
         │ (if proxy is cooked)
         ▼
   OpenF1 public API
   (api.openf1.org — free, god bless)
```

frontend tries the Railway proxy first. if it's offline it falls back to [OpenF1](https://openf1.org/). if that's also down, that's an F1 problem not a us problem.

---

## running it locally

### 1 — the website

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) — open it, let it cook

### 2 — the python proxy (optional but based)

without this you're polling the public OpenF1 API which has rate limits and a delay. with it you're getting data straight from F1's SignalR feed like a real one.

```bash
pip install -r server/requirements.txt
python server/main.py
```

server runs on `http://localhost:8080`. add this to `.env.local`:

```
NEXT_PUBLIC_FASTF1_URL=http://localhost:8080
```

### env vars

| variable | default | vibe |
|---|---|---|
| `NEXT_PUBLIC_FASTF1_URL` | `http://localhost:8080` | point at your proxy or Railway URL |

---

## deploying (so your friends can also be unwell)

### frontend → Vercel

push to GitHub, import on [Vercel](https://vercel.com), set `NEXT_PUBLIC_FASTF1_URL` to your Railway URL. done in 2 minutes.

### python proxy → Railway

`Dockerfile` is in the root. import the repo on [Railway](https://railway.app), it picks it up automatically. Railway is free-ish. cope.

the `server/Procfile` exists as a backup for when Railway decides Docker is too hard:
```
web: python server/main.py
```

---

## how it knows the race is over

(this was broken. it would just sit there saying LIVE forever. fixed now.)

the Python proxy listens for the F1 `SessionStatus` feed message. when F1 sends `"Status": "Finished"` it flips `raceFinished: true`. the frontend also runs a client-side check — if `session.dateEnd` is more than 60 seconds in the past it calls it cooked regardless of what the server thinks.

when finished:
- 🟢 LIVE dot → ⚫ **RACE FINISHED** (static, no pulsing, the race is literally over)
- session bar shows **🏁 RACE FINISHED** instead of "P1 · NOR · LEADER"
- polling slows from every 2s to every 10s (relax)
- winner event fires exactly once and plays the audio. one time.

---

## tech stack

| thing | what |
|---|---|
| framework | Next.js 16 / React 19 |
| styling | vanilla CSS. no tailwind. we are not cowards |
| animations | Framer Motion + GSAP + Lenis |
| audio | Web Audio API |
| live data | FastF1 SignalR + OpenF1 REST |
| proxy | Python 3.11 |
| deployment | Vercel + Railway |

---

## credits

built by [Piyush Garg](https://github.com/piyushgarg-dev)

> *skill issue if your driver isn't P1*
