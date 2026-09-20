import { Player, MatchState, PlannedWechsel, TabId, PlayerStatus, PositionSlot } from './types';
import { FORMATION_PRESETS } from './lib/positions';
import { getPlayerAvatar } from './lib/avatars';

const DEFAULT_NAMES = [
  'Silas', 'Finley', 'Arvid', 'Lion', 'Jakob', 'Paul', 'Lennox', 'Levi',
  'Lasse', 'Milan', 'Lionel', 'Arturo', 'Peter', 'Tommy', 'Alex', 'Tayo'
];

function createInitialPlayers(): Player[] {
  const defaultSlots = FORMATION_PRESETS[0].slots;
  return DEFAULT_NAMES.map((name, i) => {
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
}

class AppStore {
  players = $state<Player[]>(createInitialPlayers());
  match = $state<MatchState>({ status: 'IDLE', elapsed: 0, scoreHome: 0, scoreAway: 0 });
  wechselQueue = $state<PlannedWechsel[]>([]);
  selectedFieldPlayerId = $state<string | null>(null);
  activeTab = $state<TabId>('KADER');
  formationId = $state<string>('2-3-2');
  positions = $state<PositionSlot[]>(FORMATION_PRESETS[0].slots);

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    try {
      if (typeof window === 'undefined') return;
      const data = {
        players: this.players,
        match: { ...this.match, status: this.match.status === 'RUNNING' ? 'PAUSED' : this.match.status },
        wechselQueue: this.wechselQueue,
        selectedFieldPlayerId: this.selectedFieldPlayerId,
        activeTab: this.activeTab,
        formationId: this.formationId,
        positions: this.positions,
      };
      localStorage.setItem('wexel-storage', JSON.stringify({ state: data, version: 4 }));
    } catch {
      // localStorage may be unavailable or restricted
    }
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem('wexel-storage');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const data = parsed?.state || parsed;
      if (data) {
        if (Array.isArray(data.players) && data.players.length > 0) {
          this.players = data.players;
        }
        if (data.match) {
          this.match = {
            status: data.match.status === 'RUNNING' ? 'PAUSED' : (data.match.status || 'IDLE'),
            elapsed: data.match.elapsed || 0,
            scoreHome: data.match.scoreHome || 0,
            scoreAway: data.match.scoreAway || 0,
          };
        }
        if (Array.isArray(data.wechselQueue)) this.wechselQueue = data.wechselQueue;
        if (data.activeTab) this.activeTab = data.activeTab;
        if (data.formationId) this.formationId = data.formationId;
        if (Array.isArray(data.positions) && data.positions.length > 0) this.positions = data.positions;
      }
    } catch {
      // ignore parsing error
    }
  }

  cyclePlayerStatus = (playerId: string) => {
    const target = this.players.find(p => p.id === playerId);
    if (!target) return;

    const isCurrentlyField = target.status === 'FIELD';
    const nextStatus: PlayerStatus = isCurrentlyField ? 'BENCH' : 'FIELD';

    this.players = this.players.map(p => {
      if (p.id !== playerId) return p;
      return { 
        ...p, 
        status: nextStatus, 
        positionId: null 
      };
    });

    if (this.selectedFieldPlayerId === playerId && nextStatus !== 'FIELD') {
      this.selectedFieldPlayerId = null;
    }
    this.saveToStorage();
  };

  toggleFieldBench = (playerId: string) => {
    this.cyclePlayerStatus(playerId);
  };

  togglePlayerSelected = (playerId: string) => {
    const target = this.players.find(p => p.id === playerId);
    if (!target) return;
    const isCurrentlySelected = target.status !== 'OUT';
    const newStatus: PlayerStatus = isCurrentlySelected ? 'OUT' : 'BENCH';

    this.players = this.players.map(p => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        status: newStatus,
        positionId: newStatus === 'OUT' ? null : p.positionId
      };
    });

    if (isCurrentlySelected) {
      this.wechselQueue = this.wechselQueue.filter(w => w.outPlayerId !== playerId && w.inPlayerId !== playerId);
    }
    if (this.selectedFieldPlayerId === playerId) {
      this.selectedFieldPlayerId = null;
    }
    this.saveToStorage();
  };

  setPlayerSelected = (playerId: string, selected: boolean) => {
    this.players = this.players.map(p => {
      if (p.id !== playerId) return p;
      if (selected) {
        return p.status === 'OUT' ? { ...p, status: 'BENCH' as PlayerStatus } : p;
      } else {
        return { ...p, status: 'OUT' as PlayerStatus, positionId: null };
      }
    });

    if (!selected) {
      this.wechselQueue = this.wechselQueue.filter(w => w.outPlayerId !== playerId && w.inPlayerId !== playerId);
    }
    if (this.selectedFieldPlayerId === playerId) {
      this.selectedFieldPlayerId = null;
    }
    this.saveToStorage();
  };

  selectAllPlayers = (selected: boolean) => {
    this.players = this.players.map(p => {
      if (selected) {
        return p.status === 'OUT' ? { ...p, status: 'BENCH' as PlayerStatus } : p;
      } else {
        return { ...p, status: 'OUT' as PlayerStatus, positionId: null };
      }
    });
    if (!selected) {
      this.wechselQueue = [];
      this.selectedFieldPlayerId = null;
    }
    this.saveToStorage();
  };

  addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: trimmed,
      status: 'BENCH',
      positionId: null,
      feldzeit: 0,
      bankzeit: 0,
      avatar: getPlayerAvatar(trimmed) || undefined,
    };
    this.players = [...this.players, newPlayer];
    this.saveToStorage();
  };

  deletePlayer = (playerId: string) => {
    this.players = this.players.filter(p => p.id !== playerId);
    this.wechselQueue = this.wechselQueue.filter(w => w.outPlayerId !== playerId && w.inPlayerId !== playerId);
    if (this.selectedFieldPlayerId === playerId) {
      this.selectedFieldPlayerId = null;
    }
    this.saveToStorage();
  };

  movePlayerToSlot = (playerId: string, positionId: string) => {
    this.players = this.players.map(p => {
      if (p.id !== playerId && p.positionId === positionId) {
        return { ...p, status: 'BENCH' as PlayerStatus, positionId: null };
      }
      if (p.id === playerId) {
        return { ...p, status: 'FIELD' as PlayerStatus, positionId };
      }
      return p;
    });
    this.selectedFieldPlayerId = null;
    this.saveToStorage();
  };

  selectFieldPlayer = (playerId: string | null) => {
    this.selectedFieldPlayerId = playerId;
  };

  setMatchStatus = (status: MatchState['status']) => {
    this.match.status = status;
    this.saveToStorage();
  };

  resetMatch = () => {
    this.match = { status: 'IDLE', elapsed: 0, scoreHome: 0, scoreAway: 0 };
    this.players = this.players.map(p => ({ ...p, feldzeit: 0, bankzeit: 0 }));
    this.wechselQueue = [];
    this.saveToStorage();
  };

  updateScore = (homeDelta: number, awayDelta: number) => {
    this.match.scoreHome = Math.max(0, this.match.scoreHome + homeDelta);
    this.match.scoreAway = Math.max(0, this.match.scoreAway + awayDelta);
    this.saveToStorage();
  };

  planWechsel = (outPlayerId: string, inPlayerId: string) => {
    const newWechsel: PlannedWechsel = {
      id: Date.now().toString(),
      outPlayerId,
      inPlayerId
    };
    this.wechselQueue = [...this.wechselQueue, newWechsel];
    this.selectedFieldPlayerId = null;
    this.saveToStorage();
  };

  removeWechsel = (wechselId: string) => {
    this.wechselQueue = this.wechselQueue.filter(w => w.id !== wechselId);
    this.saveToStorage();
  };

  executeWechsel = () => {
    if (this.wechselQueue.length === 0) return;
    
    const swaps = this.wechselQueue.map(w => {
       const outPlayer = this.players.find(p => p.id === w.outPlayerId);
       return { outId: w.outPlayerId, inId: w.inPlayerId, pos: outPlayer?.positionId || null };
    });

    this.players = this.players.map(p => {
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
    
    this.wechselQueue = [];
    this.saveToStorage();
  };

  tick = () => {
    if (this.match.status !== 'RUNNING') return;
    this.match.elapsed += 1;
    this.players = this.players.map(p => {
      if (p.status === 'FIELD') return { ...p, feldzeit: p.feldzeit + 1 };
      if (p.status === 'BENCH') return { ...p, bankzeit: p.bankzeit + 1 };
      return p;
    });
  };

  setTab = (tab: TabId) => {
    this.activeTab = tab;
    this.saveToStorage();
  };

  dragPlayer = (playerId: string, status: PlayerStatus, positionId: string | null) => {
    const players = [...this.players];
    const playerIndex = players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

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

    this.players = players;
    this.selectedFieldPlayerId = null;
    this.saveToStorage();
  };

  setFormation = (formationId: string) => {
    const preset = FORMATION_PRESETS.find(f => f.id === formationId);
    if (!preset) return;

    const newSlots = preset.slots;
    
    const updatedPlayers = this.players.map(p => {
      if (p.status !== 'FIELD') return p;
      const slotExists = newSlots.some(s => s.id === p.positionId);
      if (slotExists) return p;
      return { ...p, positionId: null };
    });

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

    this.formationId = formationId;
    this.positions = newSlots;
    this.players = finalPlayers;
    this.selectedFieldPlayerId = null;
    this.saveToStorage();
  };

  updatePositionSlot = (slotId: string, x: number, y: number, label?: string) => {
    this.positions = this.positions.map(p => {
      if (p.id === slotId) {
        return {
          ...p,
          x: Math.max(5, Math.min(95, Math.round(x))),
          y: Math.max(5, Math.min(95, Math.round(y))),
          ...(label ? { label } : {})
        };
      }
      return p;
    });
    this.saveToStorage();
  };

  resetPositionsToFormation = () => {
    const preset = FORMATION_PRESETS.find(f => f.id === this.formationId) || FORMATION_PRESETS[0];
    this.positions = preset.slots;
    this.saveToStorage();
  };

  clearField = () => {
    this.players = this.players.map(p => {
      if (p.status === 'FIELD') {
        return { ...p, status: 'BENCH' as PlayerStatus, positionId: null };
      }
      return p;
    });
    this.selectedFieldPlayerId = null;
    this.wechselQueue = [];
    this.saveToStorage();
  };

  autoFillField = () => {
    const maxFieldCount = this.positions?.length || 8;
    const currentFieldCount = this.players.filter(p => p.status === 'FIELD').length;
    const needed = maxFieldCount - currentFieldCount;

    if (needed <= 0) return;

    const candidates = this.players
      .filter(p => p.status === 'BENCH' || p.status === 'OUT')
      .sort((a, b) => {
        if (a.status === 'BENCH' && b.status === 'OUT') return -1;
        if (a.status === 'OUT' && b.status === 'BENCH') return 1;
        return b.bankzeit - a.bankzeit;
      });

    if (candidates.length === 0) return;

    const toAdd = candidates.slice(0, needed);
    const toAddIds = new Set(toAdd.map(p => p.id));
    this.players = this.players.map(p => {
      if (toAddIds.has(p.id)) {
        return {
          ...p,
          status: 'FIELD' as PlayerStatus,
          positionId: null
        };
      }
      return p;
    });
    this.selectedFieldPlayerId = null;
    this.saveToStorage();
  };

  removePlayerFromField = (playerId: string) => {
    this.players = this.players.map(p => {
      if (p.id === playerId) {
        return { ...p, status: 'BENCH' as PlayerStatus, positionId: null };
      }
      return p;
    });
    this.selectedFieldPlayerId = null;
    this.saveToStorage();
  };
}

export const store = new AppStore();
