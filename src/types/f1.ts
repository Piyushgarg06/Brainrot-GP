// F1 API response types — strictly typed, no `any`
// All fields match OpenF1 API v1 response shapes.

export interface F1Session {
  sessionKey:  number;
  sessionName: string;
  sessionType: string;
  dateStart:   string;
  dateEnd:     string | null;
  circuitName: string;
}

export interface F1Position {
  driverNumber: number;
  position:     number;
  date:         string;
}

export interface F1Lap {
  driverNumber:    number;
  lapNumber:       number;
  lapDuration:     number | null;
  durationSector1: number | null;
  durationSector2: number | null;
  durationSector3: number | null;
  date:            string;
}

export interface F1Driver {
  driverNumber:   number;
  broadcastName:  string;
  nameAcronym:    string;
  teamName:       string;
  teamColour:     string;
}

// Raw OpenF1 API response shapes (snake_case from API)
export interface RawF1Session {
  session_key:   number;
  session_name:  string;
  session_type:  string;
  date_start:    string;
  date_end:      string | null;
  circuit_short_name: string;
}

export interface RawF1Position {
  driver_number: number;
  position:      number;
  date:          string;
}

export interface RawF1Lap {
  driver_number:      number;
  lap_number:         number;
  lap_duration:       number | null;
  duration_sector_1:  number | null;
  duration_sector_2:  number | null;
  duration_sector_3:  number | null;
  date_start:         string;
}

export interface RawF1Driver {
  driver_number:   number;
  broadcast_name:  string;
  name_acronym:    string;
  team_name:       string;
  team_colour:     string;
}

// State shape for useF1Data hook
export interface F1DataState {
  session:          F1Session | null;
  positions:        F1Position[];
  drivers:          Record<string, F1Driver>;   // keyed by driverNumber string
  driverNumberMap:  Record<number, string>;      // driverNumber → nameAcronym (e.g. 1 → "VER")
  fastestLap:       { driverCode: string; time: string } | null;
  isLive:           boolean;
  raceFinished:     boolean;   // true once F1 feed sends SessionStatus=Finished or dateEnd passed
  lastUpdated:      number;
  error:            string | null;
}
