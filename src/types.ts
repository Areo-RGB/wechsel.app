export type PlayerStatus = 'OUT' | 'BENCH' | 'FIELD';

export interface Player {
  id: string;
  name: string;
  status: PlayerStatus;
  positionId: string | null;
  feldzeit: number; // in seconds
  bankzeit: number; // in seconds
  avatar?: string;
}

export interface MatchState {
  status: 'IDLE' | 'RUNNING' | 'PAUSED';
  elapsed: number; // in seconds
  scoreHome: number;
  scoreAway: number;
}

export interface PlannedWechsel {
  id: string;
  outPlayerId: string;
  inPlayerId: string;
}

export interface PositionSlot {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export type TabId = 'KADER' | 'AUFSTELLUNG' | 'MATCH' | 'WECHSEL' | 'DATEN';

