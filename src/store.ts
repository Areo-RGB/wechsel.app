import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, MatchState, PlannedWechsel, TabId, PlayerStatus, PositionSlot } from './types';
import { FORMATION_PRESETS } from './lib/positions';
import { getPlayerAvatar } from './lib/avatars';
import { toast } from 'sonner';

const DEFAULT_NAMES = [
  'Silas', 'Finley', 'Arvid', 'Lion', 'Jakob', 'Paul', 'Lennox', 'Levi',
  'Lasse', 'Milan', 'Lionel', 'Arturo', 'Peter', 'Tommy', 'Alex', 'Tayo'
];

const INITIAL_PLAYERS: Player[] = DEFAULT_NAMES.map((name, i) => {
  const defaultSlots = FORMATION_PRESETS[0].slots;
  const isStarter = i < defaultSlots.length;
  return {
    id: `p${i + 1}`,
    name,
    status: (isStarter ? 'FIELD' : 'BENCH') as PlayerStatus,
    positionId: isStarter ? defaultSlots[i].id : null,
    feldzeit: 0,
    bankzeit: 0,
    avatar: getPlayerAvatar(name) || undefined,
  };
});

interface StoreState {
  players: Player[];
  match: MatchState;
  wechselQueue: PlannedWechsel[];
  selectedFieldPlayerId: string | null;
  activeTab: TabId;
  formationId: string;
  positions: PositionSlot[];
  
  cyclePlayerStatus: (playerId: string) => void;
  toggleFieldBench: (playerId: string) => void;
  togglePlayerSelected: (playerId: string) => void;
  setPlayerSelected: (playerId: string, selected: boolean) => void;
  selectAllPlayers: (selected: boolean) => void;
  addPlayer: (name: string) => void;
  deletePlayer: (playerId: string) => void;
  movePlayerToSlot: (playerId: string, positionId: string) => void;
  selectFieldPlayer: (playerId: string | null) => void;
  setMatchStatus: (status: MatchState['status']) => void;
  resetMatch: () => void;
  updateScore: (homeDelta: number, awayDelta: number) => void;
  planWechsel: (outPlayerId: string, inPlayerId: string) => void;
  removeWechsel: (wechselId: string) => void;
  executeWechsel: () => void;
  tick: () => void;
  setTab: (tab: TabId) => void;
  dragPlayer: (playerId: string, status: PlayerStatus, positionId: string | null) => void;
  setFormation: (formationId: string) => void;
  updatePositionSlot: (slotId: string, x: number, y: number, label?: string) => void;
  resetPositionsToFormation: () => void;
  clearField: () => void;
  autoFillField: () => void;
  removePlayerFromField: (playerId: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      players: INITIAL_PLAYERS,
      match: { status: 'IDLE', elapsed: 0, scoreHome: 0, scoreAway: 0 },
      wechselQueue: [],
      selectedFieldPlayerId: null,
      activeTab: 'KADER',
      formationId: '2-3-2',
      positions: FORMATION_PRESETS[0].slots,

      cyclePlayerStatus: (playerId) => set((state) => {
        const target = state.players.find(p => p.id === playerId);
        if (!target) return state;

        const isCurrentlyField = target.status === 'FIELD';
        const nextStatus: PlayerStatus = isCurrentlyField ? 'BENCH' : 'FIELD';

        const players: Player[] = state.players.map(p => {
          if (p.id !== playerId) return p;
          return { 
            ...p, 
            status: nextStatus, 
            positionId: null 
          };
        });

        const selectedFieldPlayerId = state.selectedFieldPlayerId === playerId && nextStatus !== 'FIELD'
          ? null 
          : state.selectedFieldPlayerId;

        return { players, selectedFieldPlayerId };
      }),

      togglePlayerStatus: (playerId) => {
        get().cyclePlayerStatus(playerId);
      },

      toggleFieldBench: (playerId) => {
        get().cyclePlayerStatus(playerId);
      },

      togglePlayerSelected: (playerId) => set((state) => {
        const target = state.players.find(p => p.id === playerId);
        if (!target) return state;
        const isCurrentlySelected = target.status !== 'OUT';
        const newStatus: PlayerStatus = isCurrentlySelected ? 'OUT' : 'BENCH';

        const players = state.players.map(p => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            status: newStatus,
            positionId: newStatus === 'OUT' ? null : p.positionId
          };
        });

        const wechselQueue = isCurrentlySelected
          ? state.wechselQueue.filter(w => w.outPlayerId !== playerId && w.inPlayerId !== playerId)
          : state.wechselQueue;
        const selectedFieldPlayerId = state.selectedFieldPlayerId === playerId ? null : state.selectedFieldPlayerId;

        return { players, wechselQueue, selectedFieldPlayerId };
      }),

      setPlayerSelected: (playerId, selected) => set((state) => {
        const players = state.players.map(p => {
          if (p.id !== playerId) return p;
          if (selected) {
            return p.status === 'OUT' ? { ...p, status: 'BENCH' as PlayerStatus } : p;
          } else {
            return { ...p, status: 'OUT' as PlayerStatus, positionId: null };
          }
        });

        const wechselQueue = selected
          ? state.wechselQueue
          : state.wechselQueue.filter(w => w.outPlayerId !== playerId && w.inPlayerId !== playerId);
        const selectedFieldPlayerId = state.selectedFieldPlayerId === playerId ? null : state.selectedFieldPlayerId;

        return { players, wechselQueue, selectedFieldPlayerId };
      }),

      selectAllPlayers: (selected) => set((state) => {
        const players = state.players.map(p => {
          if (selected) {
            return p.status === 'OUT' ? { ...p, status: 'BENCH' as PlayerStatus } : p;
          } else {
            return { ...p, status: 'OUT' as PlayerStatus, positionId: null };
          }
        });
        toast(selected ? 'Alle Spieler im Kader ausgewählt' : 'Alle Spieler abgewählt');
        return {
          players,
          wechselQueue: selected ? state.wechselQueue : [],
          selectedFieldPlayerId: selected ? state.selectedFieldPlayerId : null
        };
      }),

      addPlayer: (name) => set((state) => {
        const trimmed = name.trim();
        if (!trimmed) return state;
        const newPlayer: Player = {
          id: Date.now().toString(),
          name: trimmed,
          status: 'BENCH',
          positionId: null,
          feldzeit: 0,
          bankzeit: 0,
          avatar: getPlayerAvatar(trimmed) || undefined,
        };
        toast(`Spieler "${trimmed}" hinzugefügt`);
        return { players: [...state.players, newPlayer] };
      }),

      deletePlayer: (playerId) => set((state) => {
        const target = state.players.find(p => p.id === playerId);
        const players = state.players.filter(p => p.id !== playerId);
        const wechselQueue = state.wechselQueue.filter(w => w.outPlayerId !== playerId && w.inPlayerId !== playerId);
        toast(`Spieler "${target?.name || ''}" entfernt`);
        return { players, wechselQueue, selectedFieldPlayerId: null };
      }),

      movePlayerToSlot: (playerId, positionId) => set((state) => {
        const players: Player[] = state.players.map(p => {
          if (p.id !== playerId && p.positionId === positionId) {
            return { ...p, status: 'BENCH' as PlayerStatus, positionId: null };
          }
          if (p.id === playerId) {
            return { ...p, status: 'FIELD' as PlayerStatus, positionId };
          }
          return p;
        });
        return { players, selectedFieldPlayerId: null };
      }),

      selectFieldPlayer: (playerId) => set({ selectedFieldPlayerId: playerId }),

      setMatchStatus: (status) => set((state) => ({ match: { ...state.match, status } })),

      resetMatch: () => set((state) => {
        toast('Spielzeit & Spielstand zurückgesetzt');
        return {
          match: { status: 'IDLE', elapsed: 0, scoreHome: 0, scoreAway: 0 },
          players: state.players.map(p => ({ ...p, feldzeit: 0, bankzeit: 0 })),
          wechselQueue: []
        };
      }),

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

      setFormation: (formationId) => set((state) => {
        const preset = FORMATION_PRESETS.find(f => f.id === formationId);
        if (!preset) return state;

        // Keep field players if their positionId exists in new formation, otherwise assign them to new slots
        const newSlots = preset.slots;
        const currentFieldPlayers = state.players.filter(p => p.status === 'FIELD');
        
        // Re-map players into new slots as gracefully as possible
        const updatedPlayers = state.players.map(p => {
          if (p.status !== 'FIELD') return p;
          const slotExists = newSlots.some(s => s.id === p.positionId);
          if (slotExists) return p;
          return { ...p, positionId: null };
        });

        // Assign unassigned field players to empty slots in new formation
        const occupiedSlotIds = new Set(updatedPlayers.filter(p => p.status === 'FIELD' && p.positionId).map(p => p.positionId));
        const availableSlots = newSlots.filter(s => !occupiedSlotIds.has(s.id));
        let slotIdx = 0;

        const finalPlayers = updatedPlayers.map(p => {
          if (p.status === 'FIELD' && !p.positionId) {
            if (slotIdx < availableSlots.length) {
              const assignedSlot = availableSlots[slotIdx++];
              return { ...p, positionId: assignedSlot.id };
            } else {
              return { ...p, status: 'BENCH' as PlayerStatus, positionId: null };
            }
          }
          return p;
        });

        toast(`Formation: ${preset.name}`);
        return {
          formationId,
          positions: newSlots,
          players: finalPlayers,
          selectedFieldPlayerId: null
        };
      }),

      updatePositionSlot: (slotId, x, y, label) => set((state) => ({
        positions: state.positions.map(p => {
          if (p.id === slotId) {
            return {
              ...p,
              x: Math.max(5, Math.min(95, Math.round(x))),
              y: Math.max(5, Math.min(95, Math.round(y))),
              ...(label ? { label } : {})
            };
          }
          return p;
        })
      })),

      resetPositionsToFormation: () => set((state) => {
        const preset = FORMATION_PRESETS.find(f => f.id === state.formationId) || FORMATION_PRESETS[0];
        toast('Positionen zurückgesetzt');
        return { positions: preset.slots };
      }),

      clearField: () => set((state) => {
        const players = state.players.map(p => {
          if (p.status === 'FIELD') {
            return { ...p, status: 'BENCH' as PlayerStatus, positionId: null };
          }
          return p;
        });
        toast('Aufstellung geleert (alle auf Bank)');
        return { players, selectedFieldPlayerId: null, wechselQueue: [] };
      }),

      autoFillField: () => set((state) => {
        const maxFieldCount = state.positions?.length || 8;
        const currentFieldCount = state.players.filter(p => p.status === 'FIELD').length;
        const needed = maxFieldCount - currentFieldCount;

        if (needed <= 0) {
          toast('Aufstellung ist bereits voll');
          return state;
        }

        // Pick players from BENCH first, then OUT, sorted by highest bankzeit
        const candidates = state.players
          .filter(p => p.status === 'BENCH' || p.status === 'OUT')
          .sort((a, b) => {
            if (a.status === 'BENCH' && b.status === 'OUT') return -1;
            if (a.status === 'OUT' && b.status === 'BENCH') return 1;
            return b.bankzeit - a.bankzeit;
          });

        if (candidates.length === 0) {
          toast('Keine weiteren Spieler verfügbar');
          return state;
        }

        const toAdd = candidates.slice(0, needed);
        const toAddIds = new Set(toAdd.map(p => p.id));
        const newPlayers = state.players.map(p => {
          if (toAddIds.has(p.id)) {
            return {
              ...p,
              status: 'FIELD' as PlayerStatus,
              positionId: null
            };
          }
          return p;
        });

        toast(`${toAdd.length} Spieler automatisch aufgestellt`);
        return { players: newPlayers, selectedFieldPlayerId: null };
      }),

      removePlayerFromField: (playerId) => set((state) => {
        const players = state.players.map(p => {
          if (p.id === playerId) {
            return { ...p, status: 'BENCH' as PlayerStatus, positionId: null };
          }
          return p;
        });
        return { players, selectedFieldPlayerId: null };
      }),
    }),
    {
      name: 'wexel-storage',
      version: 4, // Bump version to force migration to all selected by default
      migrate: (persistedState: any, version: number) => {
        let state = persistedState;
        if (version < 3) {
          state = {
            ...state,
            formationId: '2-3-2',
            positions: FORMATION_PRESETS[0].slots,
          };
        }
        if (version < 4) {
          // If players were all OUT or missing, set default so all are selected
          const existingPlayers: Player[] = state?.players || [];
          const allOut = existingPlayers.length === 0 || existingPlayers.every(p => p.status === 'OUT');
          if (allOut && existingPlayers.length > 0) {
            const slots = FORMATION_PRESETS[0].slots;
            state = {
              ...state,
              players: existingPlayers.map((p, i) => {
                const isStarter = i < slots.length;
                return {
                  ...p,
                  status: (isStarter ? 'FIELD' : 'BENCH') as PlayerStatus,
                  positionId: isStarter ? slots[i].id : null,
                };
              }),
            };
          }
        }
        return state;
      },
      onRehydrateStorage: () => (state, error) => {
        if (state && state.match.status === 'RUNNING') {
          state.setMatchStatus('PAUSED');
        }
      }
    }
  )
);

