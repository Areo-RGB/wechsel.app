import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, MatchState, PlannedWechsel, TabId, PlayerStatus } from './types';
import { toast } from 'sonner';

const INITIAL_PLAYERS: Player[] = [
  'Silas', 'Finley', 'Arvid', 'Lion', 'Jakob', 'Paul', 'Lennox', 'Levi',
  'Lasse', 'Milan', 'Lionel', 'Arturo', 'Peter', 'Tommy', 'Alex', 'Tayo'
].map((name, i) => ({
  id: `p${i + 1}`,
  name,
  status: 'OUT',
  positionId: null,
  feldzeit: 0,
  bankzeit: 0,
}));

interface StoreState {
  players: Player[];
  match: MatchState;
  wechselQueue: PlannedWechsel[];
  selectedFieldPlayerId: string | null;
  activeTab: TabId;
  
  togglePlayerStatus: (playerId: string) => void;
  movePlayerToSlot: (playerId: string, positionId: string) => void;
  selectFieldPlayer: (playerId: string | null) => void;
  setMatchStatus: (status: MatchState['status']) => void;
  updateScore: (homeDelta: number, awayDelta: number) => void;
  planWechsel: (outPlayerId: string, inPlayerId: string) => void;
  removeWechsel: (wechselId: string) => void;
  executeWechsel: () => void;
  tick: () => void;
  setTab: (tab: TabId) => void;
  dragPlayer: (playerId: string, status: PlayerStatus, positionId: string | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      players: INITIAL_PLAYERS,
      match: { status: 'IDLE', elapsed: 0, scoreHome: 0, scoreAway: 0 },
      wechselQueue: [],
      selectedFieldPlayerId: null,
      activeTab: 'KADER',

      togglePlayerStatus: (playerId) => set((state) => {
        const players = state.players.map(p => {
          if (p.id !== playerId) return p;
          if (p.status === 'OUT') return { ...p, status: 'BENCH' };
          if (p.status === 'BENCH') return { ...p, status: 'OUT', positionId: null };
          if (p.status === 'FIELD') return { ...p, status: 'BENCH', positionId: null };
          return p;
        });
        return { players };
      }),

      movePlayerToSlot: (playerId, positionId) => set((state) => {
        const players = state.players.map(p => {
          if (p.id !== playerId && p.positionId === positionId) {
            return { ...p, status: 'BENCH', positionId: null };
          }
          if (p.id === playerId) {
            return { ...p, status: 'FIELD', positionId };
          }
          return p;
        });
        return { players, selectedFieldPlayerId: null };
      }),

      selectFieldPlayer: (playerId) => set({ selectedFieldPlayerId: playerId }),

      setMatchStatus: (status) => set((state) => ({ match: { ...state.match, status } })),

      updateScore: (homeDelta, awayDelta) => set((state) => ({
        match: {
          ...state.match,
          scoreHome: Math.max(0, state.match.scoreHome + homeDelta),
          scoreAway: Math.max(0, state.match.scoreAway + awayDelta)
        }
      })),

      planWechsel: (outPlayerId, inPlayerId) => {
        const state = get();
        const newWechsel: PlannedWechsel = {
          id: Date.now().toString(),
          outPlayerId,
          inPlayerId
        };
        const outName = state.players.find(p => p.id === outPlayerId)?.name || 'OUT';
        const inName = state.players.find(p => p.id === inPlayerId)?.name || 'IN';
        
        toast(`GEPLANT: ${outName.toUpperCase()} → ${inName.toUpperCase()}`);
        
        set({
          wechselQueue: [...state.wechselQueue, newWechsel],
          selectedFieldPlayerId: null
        });
      },

      removeWechsel: (wechselId) => set((state) => ({
        wechselQueue: state.wechselQueue.filter(w => w.id !== wechselId)
      })),

      executeWechsel: () => {
        const state = get();
        if (state.wechselQueue.length === 0) return;
        
        const swaps = state.wechselQueue.map(w => {
           const outPlayer = state.players.find(p => p.id === w.outPlayerId);
           return { outId: w.outPlayerId, inId: w.inPlayerId, pos: outPlayer?.positionId || null };
        });

        const newPlayers = state.players.map(p => {
          let np = { ...p };
          
          const goingOut = swaps.find(s => s.outId === np.id);
          if (goingOut) {
            np.status = 'BENCH';
            np.positionId = null;
          }
          
          const comingIn = [...swaps].reverse().find(s => s.inId === np.id);
          if (comingIn && comingIn.pos) {
            np.status = 'FIELD';
            np.positionId = comingIn.pos;
          }
          
          return np;
        });
        
        toast('WECHSEL DURCHGEFÜHRT');
        
        set({
          players: newPlayers,
          wechselQueue: []
        });
      },

      tick: () => set((state) => {
        if (state.match.status !== 'RUNNING') return state;
        
        return {
          match: { ...state.match, elapsed: state.match.elapsed + 1 },
          players: state.players.map(p => {
            if (p.status === 'FIELD') return { ...p, feldzeit: p.feldzeit + 1 };
            if (p.status === 'BENCH') return { ...p, bankzeit: p.bankzeit + 1 };
            return p;
          })
        };
      }),

      setTab: (tab) => set({ activeTab: tab }),

      dragPlayer: (playerId, status, positionId) => set((state) => {
        const players = [...state.players];
        const playerIndex = players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return state;

        const player = { ...players[playerIndex] };

        if (status === 'FIELD' && positionId) {
          const occupantIndex = players.findIndex(p => p.positionId === positionId && p.status === 'FIELD');
          if (occupantIndex !== -1 && players[occupantIndex].id !== playerId) {
            players[occupantIndex] = { ...players[occupantIndex], status: 'BENCH', positionId: null };
          }
        }

        player.status = status;
        player.positionId = positionId;
        players[playerIndex] = player;

        return { players, selectedFieldPlayerId: null };
      }),
    }),
    {
      name: 'wexel-storage',
      version: 2, // Bump version to force reset
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Force completely resetting state to pickup new INITIAL_PLAYERS
          return undefined as any; 
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (state && state.match.status === 'RUNNING') {
          state.setMatchStatus('PAUSED');
        }
      }
    }
  )
);
