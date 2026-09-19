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
  MinusCircle
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
    togglePlayerSelected, 
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
      {/* Top Header Summary Card */}
      <div className="p-4 bg-stone-900 border-b border-stone-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 tracking-tight">Kader & Anwesenheit</h2>
              <p className="text-xs text-stone-400">
                Wähle die für das Spiel verfügbaren Spieler aus
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="h-9 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl flex items-center space-x-1.5"
          >
            <UserPlus size={15} />
            <span className="text-xs font-semibold">Neu</span>
          </Button>
        </div>

        {/* Counter Badge & Progress */}
        <div className="bg-stone-950/80 rounded-2xl p-3 border border-stone-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-stone-300 font-medium">
              Verfügbar im Kader:
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {selectedCount} <span className="text-stone-500 text-xs font-normal">/ {totalCount}</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                {fieldPlayers.length} Feld · {benchPlayers.length} Bank
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (selectedCount / totalCount) * 100 : 0}%` }}
            />
          </div>

          {/* Quick select / deselect actions */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-800/60 text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => selectAllPlayers(true)}
                disabled={selectedCount === totalCount}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-800/90 hover:bg-stone-700/80 text-stone-300 hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCheck size={14} className="text-emerald-400" />
                <span className="font-medium text-[11px]">Alle auswählen</span>
              </button>

              <button
                onClick={() => selectAllPlayers(false)}
                disabled={selectedCount === 0}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-800/90 hover:bg-stone-700/80 text-stone-300 hover:text-rose-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X size={14} className="text-rose-400" />
                <span className="font-medium text-[11px]">Alle abwählen</span>
              </button>
            </div>

            <button
              onClick={() => setTab('AUFSTELLUNG')}
              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] group"
            >
              <span>Zur Aufstellung</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 bg-stone-950 sticky top-0 z-20 border-b border-stone-800/80 space-y-2.5 backdrop-blur-md bg-stone-950/90">
        {/* Search input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Spieler suchen..."
            className="w-full h-10 pl-9 pr-9 bg-stone-900 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5",
              filter === 'ALL' 
                ? "bg-stone-200 text-stone-950" 
                : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
            )}
          >
            <span>Alle</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full",
              filter === 'ALL' ? "bg-stone-400/40 text-stone-900" : "bg-stone-800 text-stone-400"
            )}>
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('SELECTED')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5",
              filter === 'SELECTED' 
                ? "bg-emerald-500 text-stone-950" 
                : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
            )}
          >
            <span>Im Kader</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full",
              filter === 'SELECTED' ? "bg-emerald-700/50 text-emerald-950 font-bold" : "bg-stone-800 text-stone-400"
            )}>
              {selectedCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('OUT')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5",
              filter === 'OUT' 
                ? "bg-stone-700 text-stone-100" 
                : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
            )}
          >
            <span>Abwesend</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full",
              filter === 'OUT' ? "bg-stone-600 text-stone-200" : "bg-stone-800 text-stone-400"
            )}>
              {outPlayers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="p-3 space-y-2 flex-1">
        {filteredPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500 space-y-2">
            <Users size={36} className="opacity-40" />
            <p className="font-medium text-sm">Keine Spieler gefunden</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-emerald-400 underline"
              >
                Suche zurücksetzen
              </button>
            )}
          </div>
        ) : (
          filteredPlayers.map(player => {
            const isSelected = player.status !== 'OUT';
            const isField = player.status === 'FIELD';
            const isBench = player.status === 'BENCH';
            const avatarUrl = getPlayerAvatar(player.name, player.avatar);
            const currentPosition = positions.find(pos => pos.id === player.positionId);

            return (
              <div
                key={player.id}
                onClick={() => togglePlayerSelected(player.id)}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none",
                  isSelected
                    ? "bg-stone-900/90 border-stone-800 hover:border-emerald-500/50"
                    : "bg-stone-950/60 border-stone-900/80 opacity-60 hover:opacity-85 hover:border-stone-800"
                )}
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className={cn(
                    "w-12 h-12 rounded-full overflow-hidden relative shrink-0 flex items-center justify-center font-bold text-sm transition-all",
                    isField && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-stone-950 bg-stone-900 text-emerald-400",
                    isBench && "ring-2 ring-amber-500/80 ring-offset-2 ring-offset-stone-950 bg-stone-800 text-stone-200",
                    !isSelected && "bg-stone-900 text-stone-500 border border-stone-800 grayscale"
                  )}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      player.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  {/* Name + Status Badges */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "font-semibold text-sm truncate",
                        isSelected ? "text-stone-100" : "text-stone-400"
                      )}>
                        {player.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 mt-1">
                      {isField && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Feld {currentPosition?.label ? `(${currentPosition.label})` : ''}</span>
                        </span>
                      )}

                      {isBench && (
                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/40">
                          Bank · Bereit
                        </span>
                      )}

                      {!isSelected && (
                        <span className="inline-flex items-center text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-md bg-stone-900 text-stone-500 border border-stone-800">
                          Abwesend
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Toggle Button & Delete */}
                <div className="flex items-center space-x-2 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  {/* Select / Deselect Pill Button */}
                  <button
                    onClick={() => togglePlayerSelected(player.id)}
                    className={cn(
                      "h-9 px-3 rounded-xl flex items-center space-x-1.5 font-medium text-xs transition-all active:scale-95 border",
                      isSelected
                        ? "bg-emerald-500 text-stone-950 border-emerald-400 font-bold shadow-md shadow-emerald-950/40"
                        : "bg-stone-900 hover:bg-stone-800 text-stone-400 border-stone-800 hover:text-stone-200"
                    )}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} strokeWidth={3} />
                        <span>Dabei</span>
                      </>
                    ) : (
                      <>
                        <MinusCircle size={14} />
                        <span>Fehlt</span>
                      </>
                    )}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => setPlayerToDelete({ id: player.id, name: player.name })}
                    className="p-2 text-stone-600 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                    title="Spieler löschen"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
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
