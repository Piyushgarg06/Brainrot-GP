// OpenF1 API client — typed fetch functions, no `any`.
// Base URL: https://api.openf1.org/v1
// No API key required.

import type {
  F1Session,
  F1Position,
  F1Lap,
  F1Driver,
  RawF1Session,
  RawF1Position,
  RawF1Lap,
  RawF1Driver,
} from '@/types/f1';

const BASE_URL = 'https://api.openf1.org/v1';

// ── Type guards ──────────────────────────────────────────────────

function isRawSession(v: unknown): v is RawF1Session {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['session_key'] === 'number' &&
    typeof obj['session_name'] === 'string' &&
    typeof obj['session_type'] === 'string' &&
    typeof obj['date_start'] === 'string' &&
    typeof obj['circuit_short_name'] === 'string'
  );
}

function isRawPosition(v: unknown): v is RawF1Position {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['driver_number'] === 'number' &&
    typeof obj['position'] === 'number' &&
    typeof obj['date'] === 'string'
  );
}

function isRawLap(v: unknown): v is RawF1Lap {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['driver_number'] === 'number' &&
    typeof obj['lap_number'] === 'number' &&
    typeof obj['date_start'] === 'string'
  );
}

function isRawDriver(v: unknown): v is RawF1Driver {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['driver_number'] === 'number' &&
    typeof obj['name_acronym'] === 'string'
  );
}

// ── Mappers (snake_case → camelCase) ────────────────────────────

function mapSession(raw: RawF1Session): F1Session {
  return {
    sessionKey:  raw.session_key,
    sessionName: raw.session_name,
    sessionType: raw.session_type,
    dateStart:   raw.date_start,
    dateEnd:     raw.date_end,
    circuitName: raw.circuit_short_name,
  };
}

function mapPosition(raw: RawF1Position): F1Position {
  return {
    driverNumber: raw.driver_number,
    position:     raw.position,
    date:         raw.date,
  };
}

function mapLap(raw: RawF1Lap): F1Lap {
  return {
    driverNumber:    raw.driver_number,
    lapNumber:       raw.lap_number,
    lapDuration:     typeof raw.lap_duration === 'number' ? raw.lap_duration : null,
    durationSector1: typeof raw.duration_sector_1 === 'number' ? raw.duration_sector_1 : null,
    durationSector2: typeof raw.duration_sector_2 === 'number' ? raw.duration_sector_2 : null,
    durationSector3: typeof raw.duration_sector_3 === 'number' ? raw.duration_sector_3 : null,
    date:            raw.date_start,
  };
}

function mapDriver(raw: RawF1Driver): F1Driver {
  return {
    driverNumber:  raw.driver_number,
    broadcastName: raw.broadcast_name ?? '',
    nameAcronym:   raw.name_acronym,
    teamName:      raw.team_name ?? '',
    teamColour:    raw.team_colour ?? '',
  };
}

// ── Fetch helpers ────────────────────────────────────────────────

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`OpenF1 fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json();
}

// ── Public API functions ─────────────────────────────────────────

export async function getLatestSession(): Promise<F1Session | null> {
  const data = await fetchJSON(`${BASE_URL}/sessions?session_key=latest`);
  if (!Array.isArray(data) || data.length === 0) return null;
  const raw = data[data.length - 1];
  if (!isRawSession(raw)) return null;
  return mapSession(raw);
}

export async function getPositions(
  sessionKey: number,
  since: string | null
): Promise<F1Position[]> {
  const url = since
    ? `${BASE_URL}/position?session_key=${sessionKey}&date>${since}`
    : `${BASE_URL}/position?session_key=${sessionKey}`;
  const data = await fetchJSON(url);
  if (!Array.isArray(data)) return [];
  return data.filter(isRawPosition).map(mapPosition);
}

export async function getLaps(
  sessionKey: number,
  since: string | null
): Promise<F1Lap[]> {
  const url = since
    ? `${BASE_URL}/laps?session_key=${sessionKey}&date_start>${since}`
    : `${BASE_URL}/laps?session_key=${sessionKey}`;
  const data = await fetchJSON(url);
  if (!Array.isArray(data)) return [];
  return data.filter(isRawLap).map(mapLap);
}

export async function getDrivers(sessionKey: number): Promise<F1Driver[]> {
  const data = await fetchJSON(`${BASE_URL}/drivers?session_key=${sessionKey}`);
  if (!Array.isArray(data)) return [];
  return data.filter(isRawDriver).map(mapDriver);
}
