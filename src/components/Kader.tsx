import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { getPlayerAvatar } from '../lib/avatars';
import { 
  Users, 
  UserPlus, 
  Check, 
  CheckCheck, 
  X, 
  Search, 
  ArrowRight, 
  Trash2,
  CheckCircle2,
  CircleDot,
  MinusCircle,
  Shirt,
  Armchair,
  CircleSlash,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

export function Kader() {
  const { 
    players, 
    cyclePlayerStatus,
    selectAllPlayers, 
    addPlayer, 
    deletePlayer, 
    setTab,
    positions 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'SELECTED' | 'OUT'>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; name: string } | null>(null);

  // Stats calculation
  const totalCount = players.length;
  const selectedPlayers = players.filter(p => p.status !== 'OUT');
  const fieldPlayers = players.filter(p => p.status === 'FIELD');
  const benchPlayers = players.filter(p => p.status === 'BENCH');
  const outPlayers = players.filter(p => p.status === 'OUT');
  const selectedCount = selectedPlayers.length;

  // Filter and search
  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => {
        if (filter === 'SELECTED') return p.status !== 'OUT';
        if (filter === 'OUT') return p.status === 'OUT';
        return true;
      })
      .filter(p => {
        if (!searchQuery.trim()) return true;
        return p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      })
      .sort((a, b) => {
        // Selected players first, then alphabetically
        const aSelected = a.status !== 'OUT';
        const bSelected = b.status !== 'OUT';
        if (aSelected !== bSelected) return aSelected ? -1 : 1;
        return a.name.localeCompare(b.name, 'de');
      });
  }, [players, filter, searchQuery]);

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setIsAddDialogOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (playerToDelete) {
      deletePlayer(playerToDelete.id);
      setPlayerToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-950 text-stone-100 pb-20 overflow-y-auto">
      {/* Top Section: Tab Bar (Kader, Nummern, Taktik style) */}
      <div className="bg-stone-900/50 border-b border-stone-800">
        <div className="flex items-center px-4 h-12">
          <div className="flex items-center space-x-6">
            <button className="relative py-3 px-1 text-sm font-bold text-stone-100 flex items-center space-x-1">
              <span>Kader</span>
              <div className="w-4 h-4 rounded-full bg-rose-600 text-[10px] flex items-center justify-center font-bold">!</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-100 rounded-full" />
            </button>
            <button className="py-3 px-1 text-sm font-bold text-stone-500 flex items-center space-x-1">
              <span>Nummern</span>
              <div className="w-4 h-4 rounded-full bg-rose-600 text-[10px] flex items-center justify-center font-bold">!</div>
            </button>
            <button className="py-3 px-1 text-sm font-bold text-stone-500 flex items-center space-x-1 group">
              <span>Taktik</span>
              <ChevronRight size={14} className="text-stone-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row from video */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800/50 bg-stone-950 sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <Shirt size={18} className="text-stone-400" />
            <span className="text-sm font-bold text-stone-200">{fieldPlayers.length} / {positions.length}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Armchair size={18} className="text-stone-400" />
            <span className="text-sm font-bold text-stone-200">{benchPlayers.length} / 7</span>
          </div>
        </div>
        
        <button className="flex items-center space-x-1.5 text-stone-400 hover:text-stone-200 transition-colors">
          <ArrowUpDown size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">sortieren</span>
        </button>
      </div>

      {/* Players List */}
      <div className="flex-1">
        {filteredPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500 space-y-2">
            <Users size={36} className="opacity-40" />
            <p className="font-medium text-sm">Keine Spieler gefunden</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-800/40">
            {filteredPlayers.map(player => {
              const isSelected = player.status !== 'OUT';
              const isField = player.status === 'FIELD';
              const avatarUrl = getPlayerAvatar(player.name, player.avatar);

              return (
                <div
                  key={player.id}
                  onClick={() => cyclePlayerStatus(player.id)}
                  className={cn(
                    "flex items-center py-2 px-4 transition-colors cursor-pointer select-none active:bg-stone-900/50",
                    player.status === 'OUT' && "bg-stone-900/10"
                  )}
                >
                  {/* Left Column: Avatar + Name */}
                  <div className="flex items-center flex-1 min-w-0 mr-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-stone-800 transition-opacity",
                      player.status === 'OUT' && "opacity-40 grayscale"
                    )}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-400">
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className={cn(
                        "text-sm font-bold truncate transition-colors",
                        player.status !== 'OUT' ? "text-stone-100" : "text-stone-600"
                      )}>
                        {player.name}
                      </p>
                      {player.status === 'OUT' && (
                        <p className="text-[10px] font-bold text-stone-600 uppercase">n.n.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: 3-State Toggle Button */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div
                      className={cn(
                        "w-20 h-12 flex flex-col items-center justify-center rounded-xl transition-all border",
                        player.status === 'FIELD' && "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
                        player.status === 'BENCH' && "bg-amber-500/10 border-amber-500/30 text-amber-400",
                        player.status === 'OUT' && "bg-stone-900/50 border-stone-800 text-stone-600"
                      )}
                    >
                      {player.status === 'FIELD' ? (
                        <>
                          <Shirt size={22} strokeWidth={2.5} className="mb-0.5" />
                          <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Aufgestellt</span>
                        </>
                      ) : player.status === 'BENCH' ? (
                        <>
                          <Armchair size={22} strokeWidth={2.5} className="mb-0.5" />
                          <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Bank</span>
                        </>
                      ) : (
                        <>
                          <CircleSlash size={22} strokeWidth={2.5} className="mb-0.5" />
                          <span className="text-[9px] font-black uppercase tracking-tighter leading-none">n.n.</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky CTA: Proceed to Lineup */}
      <div className="fixed bottom-16 inset-x-0 p-3 bg-stone-950/95 border-t border-stone-800 backdrop-blur-lg flex items-center justify-between z-30">
        <div className="text-xs text-stone-400">
          <span className="font-bold text-emerald-400 text-sm">{selectedCount}</span> Spieler ausgewählt
        </div>
        <Button
          onClick={() => setTab('AUFSTELLUNG')}
          className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl px-4 h-10 flex items-center space-x-2 shadow-lg shadow-emerald-950/50 active:scale-95 transition-all"
        >
          <span>Zur Aufstellung</span>
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* Add Player Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 rounded-3xl p-5 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-100 flex items-center space-x-2">
              <UserPlus size={20} className="text-emerald-400" />
              <span>Neuen Spieler anlegen</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddPlayerSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Name des Spielers
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="z.B. Lukas oder Max Schmidt"
                autoFocus
                className="w-full h-11 px-3.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <DialogFooter className="flex space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-300"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={!newPlayerName.trim()}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold disabled:opacity-40"
              >
                Speichern
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 rounded-3xl p-5 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-100 flex items-center space-x-2">
              <Trash2 size={20} className="text-rose-400" />
              <span>Spieler entfernen?</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-stone-400 pt-1">
            Möchtest du <strong className="text-stone-200 font-semibold">{playerToDelete?.name}</strong> wirklich aus dem Kader entfernen?
          </p>

          <DialogFooter className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPlayerToDelete(null)}
              className="flex-1 bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-300"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-stone-100 font-bold"
            >
              Entfernen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
