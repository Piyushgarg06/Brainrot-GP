# BrainrotGP — Windows Desktop App

## Building a Windows Installer

The Electron wrapper lives in `electron/` and packages the Next.js app as a native Windows `.exe`.

### Prerequisites
- Node.js 18+ installed
- Run from inside the `brainrot-gp/` directory

### Steps

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Build the Next.js production bundle
npm run build

# 3. Package the Windows installer
npm run electron:dist
```

The installer will be created in `dist/BrainrotGP Setup x.x.x.exe`.

### How it works
- Electron spawns `next start` as a child process on port 3000
- An Electron window opens `http://localhost:3000` — identical to the browser experience
- Audio plays continuously even when the window is in the background (no browser tab throttling)
- OpenF1 API calls go directly from the user's machine — no server rate limits

