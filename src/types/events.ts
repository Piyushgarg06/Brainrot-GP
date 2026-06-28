// Event types for the F1 event queue system

export type EventType = 'LEADER' | 'FASTEST' | 'POSITION' | 'WINNER';

export interface F1Event {
  id:          string;       // unique ID for React keys and dedup
  type:        EventType;
  driverCode:  string;
  priority:    number;
  label:       string;       // human-readable description e.g. "Verstappen takes P1"
  timestamp:   number;       // ms since epoch
}
