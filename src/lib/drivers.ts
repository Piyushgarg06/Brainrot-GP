// ─────────────────────────────────────────────────────────────────
// BrainrotGP Driver Configuration
// All 22 driver entries with audio config fields.
//
// To tune audio:
//   1. Set audioOffset to seconds into the song where the good bit starts
//   2. Set audioDuration to how many seconds to play (default 5)
//   3. If a win theme exists, add firstName_lastName_win.mp3 and set
//      audioOffsetWin, audioDurationWin, hasWinTheme: true
//
// Audio file naming: matches actual files in /public/audio/
//   audioFile value is passed directly to audioEngine — must match filename.
// ─────────────────────────────────────────────────────────────────

export interface Driver {
  code:            string;
  name:            string;
  firstName:       string;
  lastName:        string;
  audioFile:       string;  // matches filename in /public/audio/ without extension
  team:            string;
  teamColor:       string;

  // ─── Audio config — edit per driver ───────────────────────────
  audioOffset:      number;   // seconds into regular song to start
  audioDuration:    number;   // how many seconds to play
  audioOffsetWin:   number;   // seconds into win song to start
  audioDurationWin: number;   // how many seconds to play for win
  hasWinTheme:      boolean;  // set true only if _win.mp3 exists in /public/audio/
}

export const DRIVERS: Record<string, Driver> = {
  // ── Red Bull ────────────────────────────────────────────────
  VER: {
    code: 'VER', firstName: 'max', lastName: 'verstappen',
    name: 'Max Verstappen', audioFile: 'Max_Verstappen',
    team: 'Red Bull', teamColor: '#3671C6',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  HAD: {
    code: 'HAD', firstName: 'isack', lastName: 'hadjar',
    name: 'Isack Hadjar', audioFile: 'Isack_Hadjar',
    team: 'Red Bull', teamColor: '#3671C6',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── McLaren ─────────────────────────────────────────────────
  NOR: {
    code: 'NOR', firstName: 'lando', lastName: 'norris',
    name: 'Lando Norris', audioFile: 'Lando_Norris',
    team: 'McLaren', teamColor: '#FF8000',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  PIA: {
    code: 'PIA', firstName: 'oscar', lastName: 'piastri',
    name: 'Oscar Piastri', audioFile: 'Oscar_Piastri',
    team: 'McLaren', teamColor: '#FF8000',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Ferrari ─────────────────────────────────────────────────
  LEC: {
    code: 'LEC', firstName: 'charles', lastName: 'leclerc',
    name: 'Charles Leclerc', audioFile: 'Charles_Leclerc',
    team: 'Ferrari', teamColor: '#E8002D',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  HAM: {
    code: 'HAM', firstName: 'lewis', lastName: 'hamilton',
    name: 'Lewis Hamilton', audioFile: 'Lewis_Hamilton',
    team: 'Ferrari', teamColor: '#E8002D',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Mercedes ─────────────────────────────────────────────────
  RUS: {
    code: 'RUS', firstName: 'george', lastName: 'russell',
    name: 'George Russell', audioFile: 'George_Russel',   // note: actual file is George_Russel.mp3
    team: 'Mercedes', teamColor: '#27F4D2',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  ANT: {
    code: 'ANT', firstName: 'kimi', lastName: 'antonelli',
    name: 'Kimi Antonelli', audioFile: 'Kimi_Antonelli',
    team: 'Mercedes', teamColor: '#27F4D2',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Aston Martin ─────────────────────────────────────────────
  ALO: {
    code: 'ALO', firstName: 'fernando', lastName: 'alonso',
    name: 'Fernando Alonso', audioFile: 'Fernando_Alonso',
    team: 'Aston Martin', teamColor: '#229971',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  STR: {
    code: 'STR', firstName: 'lance', lastName: 'stroll',
    name: 'Lance Stroll', audioFile: 'Lance_Stroll',
    team: 'Aston Martin', teamColor: '#229971',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Alpine ───────────────────────────────────────────────────
  GAS: {
    code: 'GAS', firstName: 'pierre', lastName: 'gasly',
    name: 'Pierre Gasly', audioFile: 'Pierre_Gassly',    // note: actual file is Pierre_Gassly.mp3
    team: 'Alpine', teamColor: '#FF87BC',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  COL: {
    code: 'COL', firstName: 'franco', lastName: 'colapinto',
    name: 'Franco Colapinto', audioFile: 'Franco_Colapinto',
    team: 'Alpine', teamColor: '#FF87BC',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Audi ─────────────────────────────────────────────────────
  HUL: {
    code: 'HUL', firstName: 'nico', lastName: 'hulkenberg',
    name: 'Nico Hulkenberg', audioFile: 'Nico_Hulkenberg',
    team: 'Audi', teamColor: '#52E252',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  BOR: {
    code: 'BOR', firstName: 'gabriel', lastName: 'bortoleto',
    name: 'Gabriel Bortoleto', audioFile: 'Gabriel_Bortoleto',
    team: 'Audi', teamColor: '#52E252',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Racing Bulls ─────────────────────────────────────────────
  LAW: {
    code: 'LAW', firstName: 'liam', lastName: 'lawson',
    name: 'Liam Lawson', audioFile: 'Liam_Lawson',
    team: 'Racing Bulls', teamColor: '#6692FF',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  LIN: {
    code: 'LIN', firstName: 'arvid', lastName: 'lindblad',
    name: 'Arvid Lindblad', audioFile: 'Arvid_Lindblad',
    team: 'Racing Bulls', teamColor: '#6692FF',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Haas ─────────────────────────────────────────────────────
  OCO: {
    code: 'OCO', firstName: 'esteban', lastName: 'ocon',
    name: 'Esteban Ocon', audioFile: 'Esteban_Ocon',
    team: 'Haas', teamColor: '#B6BABD',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  BEA: {
    code: 'BEA', firstName: 'oliver', lastName: 'bearman',
    name: 'Oliver Bearman', audioFile: 'Oliver_Bearman',
    team: 'Haas', teamColor: '#B6BABD',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Williams ─────────────────────────────────────────────────
  ALB: {
    code: 'ALB', firstName: 'alexander', lastName: 'albon',
    name: 'Alexander Albon', audioFile: 'Alex_Albon',
    team: 'Williams', teamColor: '#64C4FF',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  SAI: {
    code: 'SAI', firstName: 'carlos', lastName: 'sainz',
    name: 'Carlos Sainz', audioFile: 'Carlos_Sainz',
    team: 'Williams', teamColor: '#64C4FF',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },

  // ── Cadillac ─────────────────────────────────────────────────
  PER: {
    code: 'PER', firstName: 'sergio', lastName: 'perez',
    name: 'Sergio Perez', audioFile: 'Sergio_Perez',
    team: 'Cadillac', teamColor: '#003DA5',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
  BOT: {
    code: 'BOT', firstName: 'valtteri', lastName: 'bottas',
    name: 'Valtteri Bottas', audioFile: 'Valterri_Bottas',  // note: actual file is Valterri_Bottas.mp3
    team: 'Cadillac', teamColor: '#003DA5',
    audioOffset: 0, audioDuration: 5,
    audioOffsetWin: 0, audioDurationWin: 5, hasWinTheme: false,
  },
};

// Driver number → code mapping is built dynamically from the OpenF1 /drivers
// endpoint (nameAcronym field) and stored in F1DataState.driverNumberMap.
// Do not hardcode it here.
