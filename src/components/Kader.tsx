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
    <div className="flex flex-col h-full bg-white text-[#161616] pb-20 overflow-y-auto select-none">
      {/* Top Section: Tab Bar (Kader, Nummern) - 36px condensed */}
      <div className="bg-[#f4f4f4] border-b border-[#e0e0e0] shrink-0">
        <div className="flex items-center px-3 h-9">
          <div className="flex items-center space-x-4">
            <button className="relative py-2 px-1 text-xs font-semibold text-[#161616] flex items-center space-x-1">
              <span>Kader</span>
              <div className="w-3.5 h-3.5 bg-[#da1e28] text-white text-[9px] flex items-center justify-center font-bold">!</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f62fe]" />
            </button>
            <button className="py-2 px-1 text-xs font-normal text-[#525252] hover:text-[#161616] flex items-center space-x-1">
              <span>Nummern</span>
              <div className="w-3.5 h-3.5 bg-[#da1e28] text-white text-[9px] flex items-center justify-center font-bold">!</div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats row - 28px condensed */}
      <div className="flex items-center justify-between px-3 h-7 border-b border-[#e0e0e0] bg-white sticky top-0 z-20 shrink-0">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 text-[#525252]">
            <Shirt size={13} className="text-[#0f62fe]" />
            <span className="font-mono text-xs font-semibold text-[#161616]">{fieldPlayers.length}/{positions.length}</span>
          </div>
          <span className="text-[#e0e0e0]">|</span>
          <div className="flex items-center space-x-1 text-[#525252]">
            <Armchair size={13} className="text-[#525252]" />
            <span className="font-mono text-xs font-semibold text-[#161616]">{benchPlayers.length} Bank</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAddDialogOpen(true)}
          className="text-xs text-[#0f62fe] hover:underline font-semibold flex items-center space-x-1"
        >
          <UserPlus size={12} />
          <span>+ Spieler</span>
        </button>
      </div>

      {/* Players List */}
      <div className="flex-1">
        {filteredPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#8c8c8c] space-y-1">
            <Users size={28} className="opacity-40" />
            <p className="text-xs">Keine Spieler vorhanden</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e0e0e0]">
            {filteredPlayers.map(player => {
              const avatarUrl = getPlayerAvatar(player.name, player.avatar);

              return (
                <div
                  key={player.id}
                  onClick={() => cyclePlayerStatus(player.id)}
                  className={cn(
                    "flex items-center h-10 px-3 transition-colors cursor-pointer select-none",
                    player.status === 'OUT' ? "bg-[#f4f4f4]/40 hover:bg-[#f4f4f4]" : "hover:bg-[#f4f4f4] active:bg-[#e0e0e0]"
                  )}
                >
                  {/* Left Column: Avatar + Name */}
                  <div className="flex items-center flex-1 min-w-0 mr-3">
                    <div className={cn(
                      "w-6 h-6 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-medium transition-opacity",
                      player.status === 'OUT' ? "opacity-30 grayscale" : "text-[#161616]"
                    )}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        player.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="ml-2.5 min-w-0 flex items-center space-x-2">
                      <p className={cn(
                        "text-xs font-semibold truncate transition-colors",
                        player.status !== 'OUT' ? "text-[#161616]" : "text-[#8c8c8c]"
                      )}>
                        {player.name}
                      </p>
                      {player.status === 'OUT' && (
                        <span className="text-[9px] font-mono text-[#8c8c8c] uppercase">n.n.</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: 3-State Toggle Button */}
                  <div className="shrink-0 flex items-center space-x-1.5">
                    <div
                      className={cn(
                        "w-24 h-7 flex items-center justify-center space-x-1 border text-xs font-mono transition-colors",
                        player.status === 'FIELD' && "bg-[#0f62fe] border-[#0f62fe] text-white font-bold",
                        player.status === 'BENCH' && "bg-[#f4f4f4] border-[#e0e0e0] text-[#161616] font-semibold",
                        player.status === 'OUT' && "bg-white border-[#e0e0e0] text-[#8c8c8c]"
                      )}
                    >
                      {player.status === 'FIELD' ? (
                        <>
                          <Shirt size={12} strokeWidth={2} />
                          <span className="text-[10px] uppercase font-bold tracking-tight">Aufgestellt</span>
                        </>
                      ) : player.status === 'BENCH' ? (
                        <>
                          <Armchair size={12} strokeWidth={2} className="text-[#525252]" />
                          <span className="text-[10px] uppercase font-bold tracking-tight">Bank</span>
                        </>
                      ) : (
                        <>
                          <CircleSlash size={11} strokeWidth={2} />
                          <span className="text-[10px] uppercase font-medium tracking-tight">n.n.</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayerToDelete({ id: player.id, name: player.name });
                      }}
                      title="Spieler löschen"
                      className="w-6 h-6 flex items-center justify-center text-[#8c8c8c] hover:text-[#da1e28] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky CTA: Proceed to Lineup - 36px bar right above bottom nav */}
      <div className="fixed bottom-11 inset-x-0 h-9 px-3 bg-[#f4f4f4] border-t border-[#e0e0e0] flex items-center justify-between z-30">
        <div className="text-xs text-[#525252]">
          <strong className="text-[#161616] font-mono">{selectedCount}</strong> Spieler nominiert
        </div>
        <Button
          size="xs"
          onClick={() => setTab('AUFSTELLUNG')}
          className="bg-[#0f62fe] hover:bg-[#0043ce] text-white font-medium rounded-none px-3 h-7 text-xs flex items-center space-x-1.5 transition-colors"
        >
          <span>Zur Aufstellung</span>
          <ArrowRight size={13} />
        </Button>
      </div>

      {/* Add Player Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white border border-[#e0e0e0] text-[#161616] rounded-none p-4 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-[#161616] flex items-center space-x-2">
              <UserPlus size={16} className="text-[#0f62fe]" />
              <span>Neuen Spieler anlegen</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddPlayerSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-normal text-[#525252] mb-1">
                Name des Spielers
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="z.B. Lukas oder Max Schmidt"
                autoFocus
                className="w-full h-9 px-3 bg-[#f4f4f4] border border-[#e0e0e0] rounded-none text-[#161616] text-xs placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#0f62fe]"
              />
            </div>

            <DialogFooter className="flex space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 bg-white border-[#e0e0e0] text-[#161616] hover:bg-[#f4f4f4] h-8 rounded-none text-xs"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                size="xs"
                disabled={!newPlayerName.trim()}
                className="flex-1 bg-[#0f62fe] hover:bg-[#0043ce] text-white font-medium h-8 rounded-none text-xs disabled:opacity-40"
              >
                Speichern
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <DialogContent className="bg-white border border-[#e0e0e0] text-[#161616] rounded-none p-4 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-[#da1e28] flex items-center space-x-2">
              <Trash2 size={16} />
              <span>Spieler entfernen?</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-[#525252] pt-1">
            Möchtest du <strong className="text-[#161616] font-semibold">{playerToDelete?.name}</strong> wirklich aus dem Kader entfernen?
          </p>

          <DialogFooter className="flex space-x-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setPlayerToDelete(null)}
              className="flex-1 bg-white border-[#e0e0e0] text-[#161616] hover:bg-[#f4f4f4] h-8 rounded-none text-xs"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              size="xs"
              onClick={handleConfirmDelete}
              className="flex-1 bg-[#da1e28] hover:bg-[#ba1b23] text-white font-medium h-8 rounded-none text-xs"
            >
              Entfernen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
