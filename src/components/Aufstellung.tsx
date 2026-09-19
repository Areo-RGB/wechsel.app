import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { cn, formatTime } from '../lib/utils';
import { FORMATION_PRESETS } from '../lib/positions';
import { Player, PositionSlot } from '../types';
import { getPlayerAvatar } from '../lib/avatars';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from './ui/button';
import { 
  Sparkles, 
  Trash2, 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  ArrowLeftRight, 
  UserMinus, 
  Plus, 
  Minus,
  Pencil,
  ChevronDown,
  Layers,
  Play,
  Pause
} from 'lucide-react';

export function Aufstellung() {
  const { 
    players, 
    positions, 
    formationId, 
    selectedFieldPlayerId, 
    selectFieldPlayer, 
    movePlayerToSlot, 
    planWechsel, 
    setFormation, 
    updatePositionSlot, 
    resetPositionsToFormation, 
    clearField, 
    autoFillField,
    removePlayerFromField,
    dragPlayer,
    match,
    setMatchStatus,
    updateScore,
    resetMatch
  } = useStore();

  // State management
  const [formationSheetOpen, setFormationSheetOpen] = useState(false);
  const [sheetTargetSlot, setSheetTargetSlot] = useState<string | null>(null);
  const [managePlayer, setManagePlayer] = useState<Player | null>(null);
  const [substituteSheetOpen, setSubstituteSheetOpen] = useState(false);
  const [isEditTacticsMode, setIsEditTacticsMode] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editLabelInput, setEditLabelInput] = useState('');
  const [timeDisplayMode, setTimeDisplayMode] = useState<'BOTH' | 'TIME' | 'PERCENT'>('BOTH');

  const pitchRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<Record<string, number>>({});

  const toggleTimeMode = () => {
    setTimeDisplayMode(prev => {
      let next: 'BOTH' | 'TIME' | 'PERCENT';
      if (prev === 'BOTH') next = 'TIME';
      else if (prev === 'TIME') next = 'PERCENT';
      else next = 'BOTH';

      const label = 
        next === 'BOTH' 
          ? 'Spielzeit: Beide Anzeigen (Min:Sek & %)' 
          : next === 'TIME' 
            ? 'Spielzeit: Minuten & Sekunden (m:s)' 
            : 'Spielzeit: Prozentanteil (%)';
      toast(label, { duration: 1500 });
      return next;
    });
  };

  const getPlayerPercent = (player: Player) => {
    if (match.elapsed > 0) {
      return Math.min(100, Math.round((player.feldzeit / match.elapsed) * 100));
    }
    const total = player.feldzeit + player.bankzeit;
    if (total > 0) {
      return Math.min(100, Math.round((player.feldzeit / total) * 100));
    }
    return 0;
  };

  const currentPreset = FORMATION_PRESETS.find(f => f.id === formationId) || FORMATION_PRESETS[0];
  const benchPlayers = players.filter(p => p.status === 'BENCH').sort((a, b) => a.name.localeCompare(b.name));
  const squadPlayers = players.filter(p => p.status === 'OUT').sort((a, b) => a.name.localeCompare(b.name));
  const allAvailablePlayers = [...benchPlayers, ...squadPlayers];

  const fieldPlayersCount = players.filter(p => p.status === 'FIELD').length;

  // Handle slot tap in normal play mode
  const handleSlotTap = (posId: string) => {
    if (isEditTacticsMode) {
      const slot = positions.find(p => p.id === posId);
      if (slot) {
        setEditingSlotId(posId);
        setEditLabelInput(slot.label || slot.id);
      }
      return;
    }

    const occupant = players.find(p => p.positionId === posId && p.status === 'FIELD');
    
    if (occupant) {
      if (selectedFieldPlayerId) {
        if (selectedFieldPlayerId === occupant.id) {
          // Tapped currently selected occupant -> open manage menu
          setManagePlayer(occupant);
          selectFieldPlayer(null);
        } else {
          // Swap positions of the two field players!
          const selectedPlayer = players.find(p => p.id === selectedFieldPlayerId);
          if (selectedPlayer && selectedPlayer.positionId) {
            const oldPos = selectedPlayer.positionId;
            dragPlayer(selectedFieldPlayerId, 'FIELD', posId);
            dragPlayer(occupant.id, 'FIELD', oldPos);
          } else {
            movePlayerToSlot(selectedFieldPlayerId, posId);
          }
          selectFieldPlayer(null);
        }
      } else {
        // First tap selects the player (with option to manage or swap)
        selectFieldPlayer(occupant.id);
      }
    } else {
      // Tapped empty slot
      if (selectedFieldPlayerId) {
        // Move selected player here
        movePlayerToSlot(selectedFieldPlayerId, posId);
        selectFieldPlayer(null);
      } else {
        // Assign from bench or squad
        setSheetTargetSlot(posId);
      }
    }
  };

  // Assign player to empty slot
  const handleAssignPlayer = (playerId: string) => {
    if (!sheetTargetSlot) return;
    dragPlayer(playerId, 'FIELD', sheetTargetSlot);
    setSheetTargetSlot(null);
  };

  // Substitute active managePlayer with bench player
  const handleExecuteSubstitute = (benchPlayerId: string) => {
    if (!managePlayer) return;
    planWechsel(managePlayer.id, benchPlayerId);
    setSubstituteSheetOpen(false);
    setManagePlayer(null);
  };

  // Dragging positions directly on pitch in tactics edit mode
  const handlePitchPointerDown = (e: React.PointerEvent<HTMLDivElement>, slotId: string) => {
    if (!isEditTacticsMode) return;
    e.stopPropagation();
    
    const pitch = pitchRef.current;
    if (!pitch) return;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const rect = pitch.getBoundingClientRect();
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      updatePositionSlot(slotId, x, y);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleSaveSlotLabel = () => {
    if (editingSlotId && editLabelInput.trim()) {
      updatePositionSlot(editingSlotId, 0, 0, editLabelInput.trim().toUpperCase());
      const slot = positions.find(p => p.id === editingSlotId);
      if (slot) {
        updatePositionSlot(editingSlotId, slot.x, slot.y, editLabelInput.trim().toUpperCase());
      }
      setEditingSlotId(null);
    }
  };

  // Slot click with double-tap detection to switch time format
  const handleSlotClick = (posId: string) => {
    if (isEditTacticsMode) {
      handleSlotTap(posId);
      return;
    }

    const now = Date.now();
    const lastTap = lastTapRef.current[posId] || 0;
    if (now - lastTap < 350) {
      // Double tap detected!
      toggleTimeMode();
      lastTapRef.current[posId] = 0;
      return;
    }
    lastTapRef.current[posId] = now;

    handleSlotTap(posId);
  };

  return (
    <div className="relative w-full h-full bg-stone-950 flex flex-col overflow-hidden pb-16 select-none">
      
      {/* Top Action & Formation Toolbar */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between shrink-0 z-20">
        
        {/* Formation Picker Button */}
        <button
          onClick={() => setFormationSheetOpen(true)}
          className="flex items-center space-x-2 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-100 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-700 transition-all"
        >
          <Layers size={14} className="text-emerald-400" />
          <span>{currentPreset.name}</span>
          <ChevronDown size={14} className="text-stone-400" />
        </button>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          
          {/* Toggle Tactics Edit Mode */}
          <Button
            size="sm"
            variant={isEditTacticsMode ? "default" : "outline"}
            onClick={() => setIsEditTacticsMode(!isEditTacticsMode)}
            className={cn(
              "h-8 px-2.5 text-xs font-medium border-stone-700",
              isEditTacticsMode 
                ? "bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold border-amber-400" 
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            )}
          >
            {isEditTacticsMode ? (
              <>
                <Check size={14} className="mr-1" />
                Fertig
              </>
            ) : (
              <>
                <SlidersHorizontal size={14} className="mr-1 text-stone-400" />
                Taktik
              </>
            )}
          </Button>

          {!isEditTacticsMode && (
            <>
              {/* Auto-Fill Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={autoFillField}
                disabled={fieldPlayersCount >= positions.length}
                title="Automatisch freie Positionen besetzen"
                className="h-8 px-2.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700 disabled:opacity-40"
              >
                <Sparkles size={14} className="text-emerald-400 mr-1" />
                Auto
              </Button>

              {/* Clear Field Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={clearField}
                disabled={fieldPlayersCount === 0}
                title="Alle Spieler auf die Bank"
                className="h-8 px-2 text-xs bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-red-400 border-stone-700 disabled:opacity-40"
              >
                <Trash2 size={14} />
              </Button>
            </>
          )}

          {isEditTacticsMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={resetPositionsToFormation}
              title="Auf Standard zurücksetzen"
              className="h-8 px-2 text-xs bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-amber-400 border-stone-700"
            >
              <RotateCcw size={14} />
            </Button>
          )}

        </div>
      </div>

      {/* Edit Mode Instruction Banner */}
      {isEditTacticsMode && (
        <div className="bg-amber-950/80 border-b border-amber-700/50 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-200">
          <span>Positionen auf dem Feld verschieben oder antippen zum Umbenennen.</span>
          <span className="font-mono text-amber-400 font-bold ml-2">EDIT-MODUS</span>
        </div>
      )}

      {/* Selected Player Instruction Banner */}
      {selectedFieldPlayerId && !isEditTacticsMode && (
        <div className="bg-stone-900/90 border-b border-stone-800 px-4 py-1.5 flex items-center justify-between text-xs text-amber-400">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {players.find(p => p.id === selectedFieldPlayerId)?.name} ausgewählt:
            </span>
            <span className="text-stone-300 text-[11px]">Tippe Position zum Tauschen</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const p = players.find(p => p.id === selectedFieldPlayerId);
                if (p) setManagePlayer(p);
                selectFieldPlayer(null);
              }}
              className="text-[11px] underline text-stone-300 hover:text-stone-100"
            >
              Optionen
            </button>
            <button
              onClick={() => selectFieldPlayer(null)}
              className="text-[11px] text-stone-500 hover:text-stone-300 ml-1"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Main Pitch Area */}
      <div className="flex-1 relative p-2 sm:p-3 overflow-hidden">
        <div 
          ref={pitchRef}
          className="w-full h-full relative bg-emerald-900 rounded-2xl border-4 border-emerald-600/40 shadow-2xl overflow-hidden touch-none"
        >
          {/* Pitch Markings */}
          <div className="absolute inset-2 border border-emerald-600/30 rounded-xl pointer-events-none">
            {/* Center line */}
            <div className="absolute top-1/2 left-0 w-full h-0 border-t-2 border-emerald-600/40" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-28 h-28 -mt-14 -ml-14 rounded-full border-2 border-emerald-600/40" />
            {/* Penalty box top */}
            <div className="absolute top-0 left-1/2 w-44 h-20 -ml-22 border-2 border-t-0 border-emerald-600/40 rounded-b-xl" />
            {/* Goal area top */}
            <div className="absolute top-0 left-1/2 w-24 h-8 -ml-12 border border-t-0 border-emerald-600/30 rounded-b-lg" />
            {/* Penalty box bottom */}
            <div className="absolute bottom-0 left-1/2 w-44 h-20 -ml-22 border-2 border-b-0 border-emerald-600/40 rounded-t-xl" />
            {/* Goal area bottom */}
            <div className="absolute bottom-0 left-1/2 w-24 h-8 -ml-12 border border-b-0 border-emerald-600/30 rounded-t-lg" />
          </div>

          {/* Prominent Match Timer & HUD in Upper Third Center (Without clipping pitch) */}
          <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto max-w-[94%]">
            <div className="bg-stone-950/90 backdrop-blur-md border border-stone-700/80 shadow-2xl rounded-2xl px-3.5 py-1.5 flex flex-col items-center">
              
              {/* Scoreboard (Heim vs Gast) */}
              <div className="flex items-center space-x-2 text-stone-300 text-xs font-mono font-bold mb-0.5">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Heim</span>
                  <button 
                    onClick={() => updateScore(-1, 0)} 
                    className="w-4 h-4 rounded bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-[10px] active:scale-90 transition-colors"
                    title="Heim -1"
                  >
                    -
                  </button>
                  <span className="text-white font-bold text-sm min-w-[14px] text-center">{match.scoreHome}</span>
                  <button 
                    onClick={() => updateScore(1, 0)} 
                    className="w-4 h-4 rounded bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-[10px] active:scale-90 transition-colors"
                    title="Heim +1"
                  >
                    +
                  </button>
                </div>

                <span className="text-stone-600 font-bold">:</span>

                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => updateScore(0, -1)} 
                    className="w-4 h-4 rounded bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-[10px] active:scale-90 transition-colors"
                    title="Gast -1"
                  >
                    -
                  </button>
                  <span className="text-white font-bold text-sm min-w-[14px] text-center">{match.scoreAway}</span>
                  <button 
                    onClick={() => updateScore(0, 1)} 
                    className="w-4 h-4 rounded bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-[10px] active:scale-90 transition-colors"
                    title="Gast +1"
                  >
                    +
                  </button>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Gast</span>
                </div>
              </div>

              {/* Prominent Match Timer & Subtle Start/Pause */}
              <div className="flex items-center space-x-2.5">
                {/* Prominent Match Timer */}
                <div className="flex items-center space-x-1.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    match.status === 'RUNNING' ? "bg-emerald-400 animate-pulse" : match.status === 'PAUSED' ? "bg-amber-400" : "bg-stone-500"
                  )} />
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-md">
                    {formatTime(match.elapsed)}
                  </span>
                </div>

                {/* Subtle Start/Pause Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMatchStatus(match.status === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
                  className={cn(
                    "h-7 px-2.5 rounded-full text-xs font-semibold transition-all active:scale-95 border",
                    match.status === 'RUNNING'
                      ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/40 hover:text-amber-200"
                      : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/40 hover:text-emerald-200"
                  )}
                >
                  {match.status === 'RUNNING' ? (
                    <>
                      <Pause size={12} className="mr-1" fill="currentColor" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} className="mr-1" fill="currentColor" />
                      <span>Start</span>
                    </>
                  )}
                </Button>

                {/* Format Toggle Button (Both, m:s, or %) */}
                <button
                  onClick={toggleTimeMode}
                  title="Umschalten: Beide Anzeigen (m:s & %), nur Spielzeit (m:s) oder nur Prozentanteil (%)"
                  className={cn(
                    "h-7 px-2 rounded-md text-[10px] font-mono font-bold border transition-colors flex items-center space-x-0.5",
                    timeDisplayMode === 'BOTH'
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/80 hover:bg-emerald-900"
                      : timeDisplayMode === 'TIME'
                        ? "bg-stone-900 text-emerald-400 border-emerald-800/70 hover:bg-stone-800"
                        : "bg-stone-900 text-amber-300 border-amber-800/70 hover:bg-stone-800"
                  )}
                >
                  <span>{timeDisplayMode === 'BOTH' ? 'm:s & %' : timeDisplayMode === 'TIME' ? 'm:s' : '%'}</span>
                </button>

                {/* Reset Button (visible when match has elapsed time) */}
                {match.elapsed > 0 && (
                  <button
                    onClick={resetMatch}
                    title="Spielzeit & Spielstand zurücksetzen"
                    className="h-7 w-7 rounded-md bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800 flex items-center justify-center transition-colors active:scale-90"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Position Slots on the Pitch */}
          {positions.map(pos => {
            const occupant = players.find(p => p.positionId === pos.id && p.status === 'FIELD');
            const isSelected = occupant && selectedFieldPlayerId === occupant.id;
            
            return (
              <div
                key={pos.id}
                onPointerDown={(e) => isEditTacticsMode ? handlePitchPointerDown(e, pos.id) : undefined}
                onClick={() => handleSlotClick(pos.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  toggleTimeMode();
                }}
                className={cn(
                  "absolute w-14 h-14 -ml-7 -mt-7 flex flex-col items-center justify-center transition-transform",
                  isEditTacticsMode 
                    ? "cursor-move hover:scale-110 active:scale-95 z-30" 
                    : "cursor-pointer active:scale-90 z-10"
                )}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {isEditTacticsMode ? (
                  /* Edit Mode Pin */
                  <div className="w-11 h-11 rounded-full bg-amber-500/90 border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-stone-950 font-bold text-xs backdrop-blur-sm animate-pulse">
                    <span className="leading-tight text-[11px] font-black">{pos.label || pos.id}</span>
                    <Pencil size={10} className="text-stone-900 mt-0.5 opacity-80" />
                  </div>
                ) : occupant ? (
                  /* Occupied Slot with Player & Live Playtime Timer */
                  <div className="flex flex-col items-center relative">
                    
                    {/* Playtime Timer Badge (Displays both minutes:seconds and percentage) */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTimeMode();
                      }}
                      className={cn(
                        "absolute -top-3.5 inset-x-auto z-20 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border shadow-lg flex items-center justify-center whitespace-nowrap cursor-pointer transition-transform hover:scale-105 active:scale-95",
                        timeDisplayMode === 'BOTH'
                          ? "bg-stone-950/95 text-emerald-400 border-emerald-500/70"
                          : timeDisplayMode === 'TIME'
                            ? "bg-stone-950/95 text-emerald-400 border-emerald-500/70"
                            : "bg-emerald-950/95 text-emerald-300 border-emerald-400/80"
                      )}
                      title="Spielzeit: Beide Anzeigen (Min:Sek & %). Tippen oder Doppeltippen zum Umschalten"
                    >
                      {timeDisplayMode === 'BOTH' && (
                        <div className="flex items-center space-x-1">
                          <span className="text-emerald-300 font-semibold">{formatTime(occupant.feldzeit)}</span>
                          <span className="text-stone-500 text-[8px] font-normal leading-none">·</span>
                          <span className="text-emerald-400 font-bold">{getPlayerPercent(occupant)}%</span>
                        </div>
                      )}
                      {timeDisplayMode === 'TIME' && (
                        <span className="text-emerald-300 font-semibold">{formatTime(occupant.feldzeit)}</span>
                      )}
                      {timeDisplayMode === 'PERCENT' && (
                        <span className="text-emerald-300 font-bold">{getPlayerPercent(occupant)}%</span>
                      )}
                    </div>

                    <div className={cn(
                      "w-12 h-12 rounded-full bg-stone-900 border-2 shadow-2xl flex flex-col items-center justify-center text-stone-100 font-bold transition-all relative overflow-hidden",
                      isSelected 
                        ? "border-amber-400 bg-amber-950 text-amber-300 ring-4 ring-amber-400/40 scale-110 shadow-[0_0_25px_rgba(251,191,36,0.6)]" 
                        : "border-stone-700 hover:border-emerald-400"
                    )}>
                      {getPlayerAvatar(occupant.name, occupant.avatar) ? (
                        <img 
                          src={getPlayerAvatar(occupant.name, occupant.avatar)!} 
                          alt={occupant.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs font-black tracking-tight">{occupant.name.substring(0, 3).toUpperCase()}</span>
                      )}
                      <span className="absolute bottom-0 inset-x-0 text-[8px] font-black text-emerald-400 uppercase bg-black/80 py-0.2 text-center">
                        {pos.label || pos.id}
                      </span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium mt-0.5 px-1.5 py-0.2 rounded-full bg-black/70 truncate max-w-[68px] text-center drop-shadow-md",
                      isSelected ? "text-amber-300 font-bold bg-amber-950/90" : "text-stone-100 font-semibold"
                    )}>
                      {occupant.name}
                    </span>
                  </div>
                ) : (
                  /* Empty Slot with + */
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-black/40 border-2 border-emerald-400/40 hover:border-emerald-400 hover:bg-black/60 flex flex-col items-center justify-center text-emerald-400 backdrop-blur-sm transition-all shadow-md">
                      <Plus size={16} className="stroke-[2.5]" />
                      <span className="text-[7px] font-bold uppercase -mt-0.5">{pos.label || pos.id}</span>
                    </div>
                    <span className="text-[9px] font-medium text-emerald-400/70 mt-0.5">Frei</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Information Counter */}
      <div className="bg-stone-900 border-t border-stone-800 px-4 py-1.5 flex items-center justify-between text-xs text-stone-400 shrink-0">
        <div>
          Aufgestellt: <span className={cn("font-bold", fieldPlayersCount === positions.length ? "text-emerald-400" : "text-amber-400")}>{fieldPlayersCount} / {positions.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Bank: <strong className="text-stone-200">{benchPlayers.length}</strong></span>
          <span className="text-stone-600">|</span>
          <span>Kader: <strong className="text-stone-200">{squadPlayers.length}</strong></span>
        </div>
      </div>

      {/* 1. Formation Presets Selection Sheet */}
      <Sheet open={formationSheetOpen} onOpenChange={setFormationSheetOpen}>
        <SheetContent side="bottom" className="bg-stone-900 border-stone-800 text-stone-100 max-h-[80vh] rounded-t-3xl p-0">
          <SheetHeader className="p-5 border-b border-stone-800">
            <SheetTitle className="text-xl font-bold text-stone-100 flex items-center space-x-2">
              <Layers className="text-emerald-400" size={22} />
              <span>Formation wählen (8er-Feld)</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-4 overflow-y-auto space-y-2.5 max-h-[calc(80vh-80px)] pb-safe">
            {FORMATION_PRESETS.map(preset => {
              const isActive = preset.id === formationId;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setFormation(preset.id);
                    setFormationSheetOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between",
                    isActive 
                      ? "bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/50" 
                      : "bg-stone-800/80 border-stone-700 hover:bg-stone-700/80"
                  )}
                >
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-base text-stone-100 font-mono">{preset.name}</span>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold bg-emerald-500 text-stone-950 px-2 py-0.5 rounded-full">
                          Aktiv
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{preset.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {preset.slots.map(s => (
                        <span key={s.id} className="text-[9px] font-mono bg-stone-900 px-1.5 py-0.5 rounded text-stone-300 border border-stone-800">
                          {s.label || s.id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isActive && <Check className="text-emerald-400 shrink-0 ml-3" size={20} />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* 2. Empty Slot Assignment Sheet */}
      <Sheet open={!!sheetTargetSlot} onOpenChange={(open) => !open && setSheetTargetSlot(null)}>
        <SheetContent side="bottom" className="bg-stone-900 border-stone-800 text-stone-100 max-h-[75vh] rounded-t-3xl p-0">
          <SheetHeader className="p-5 border-b border-stone-800 flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-xl font-bold text-stone-100">
              Spieler für Position <span className="text-emerald-400 font-mono">[{positions.find(p => p.id === sheetTargetSlot)?.label || sheetTargetSlot}]</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2.5 pb-safe max-h-[calc(75vh-75px)]">
            {allAvailablePlayers.map(p => {
              const total = p.feldzeit + p.bankzeit;
              const bankPercent = total > 0 ? Math.round((p.bankzeit / total) * 100) : 100;
              const isBench = p.status === 'BENCH';
              const avatar = getPlayerAvatar(p.name, p.avatar);

              return (
                <Button
                  key={p.id}
                  variant="outline"
                  onClick={() => handleAssignPlayer(p.id)}
                  className="h-auto p-3 bg-stone-800 border-stone-700 hover:bg-stone-700 hover:text-stone-100 justify-between items-center active:scale-95 transition-transform"
                >
                  <div className="flex items-center space-x-2.5 text-left min-w-0">
                    <div className="w-9 h-9 rounded-full bg-stone-700 border border-stone-600 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-stone-200">
                      {avatar ? (
                        <img src={avatar} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        p.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{p.name}</div>
                      <span className={cn(
                        "text-[9px] uppercase font-bold px-1.5 py-0.2 rounded inline-block",
                        isBench ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50" : "bg-stone-900 text-stone-400"
                      )}>
                        {isBench ? 'Bank' : 'Kader'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 text-emerald-400 rounded-md">
                      {bankPercent}%
                    </span>
                  </div>
                </Button>
              );
            })}

            {allAvailablePlayers.length === 0 && (
              <div className="col-span-2 p-8 text-center text-stone-500 font-medium">
                Keine weiteren Spieler verfügbar
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 3. Manage Occupied Field Player Sheet */}
      <Sheet open={!!managePlayer} onOpenChange={(open) => !open && setManagePlayer(null)}>
        <SheetContent side="bottom" className="bg-stone-900 border-stone-800 text-stone-100 rounded-t-3xl p-0">
          <SheetHeader className="p-5 border-b border-stone-800">
            <SheetTitle className="text-xl font-bold text-stone-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 overflow-hidden flex items-center justify-center text-sm font-bold text-stone-200">
                  {managePlayer && getPlayerAvatar(managePlayer.name, managePlayer.avatar) ? (
                    <img src={getPlayerAvatar(managePlayer.name, managePlayer.avatar)!} alt={managePlayer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    managePlayer?.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span>{managePlayer?.name}</span>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-md">
                Pos: {positions.find(p => p.id === managePlayer?.positionId)?.label || managePlayer?.positionId}
              </span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-5 space-y-3 pb-safe">
            
            {/* Quick Action: Substitute */}
            <Button
              variant="outline"
              onClick={() => {
                setSubstituteSheetOpen(true);
              }}
              className="w-full h-12 bg-stone-800 hover:bg-stone-700 text-stone-100 border-stone-700 justify-start px-4 text-sm font-semibold"
            >
              <ArrowLeftRight size={18} className="text-emerald-400 mr-3 shrink-0" />
              <span>Auswechseln mit Bankspieler...</span>
            </Button>

            {/* Quick Action: Move to Bench */}
            <Button
              variant="outline"
              onClick={() => {
                if (managePlayer) {
                  removePlayerFromField(managePlayer.id);
                  setManagePlayer(null);
                }
              }}
              className="w-full h-12 bg-stone-800 hover:bg-stone-700 text-stone-100 border-stone-700 justify-start px-4 text-sm font-semibold"
            >
              <UserMinus size={18} className="text-amber-400 mr-3 shrink-0" />
              <span>Auf die Bank setzen</span>
            </Button>

            {/* Quick Action: Swap Position */}
            <Button
              variant="outline"
              onClick={() => {
                if (managePlayer) {
                  selectFieldPlayer(managePlayer.id);
                  setManagePlayer(null);
                }
              }}
              className="w-full h-12 bg-stone-800 hover:bg-stone-700 text-stone-100 border-stone-700 justify-start px-4 text-sm font-semibold"
            >
              <SlidersHorizontal size={18} className="text-cyan-400 mr-3 shrink-0" />
              <span>Position tauschen (Position auf Feld wählen)</span>
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={() => setManagePlayer(null)}
              className="w-full h-10 text-stone-400 hover:text-stone-200 mt-2"
            >
              Abbrechen
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 4. Substitute Player Picker Sheet */}
      <Sheet open={substituteSheetOpen} onOpenChange={setSubstituteSheetOpen}>
        <SheetContent side="bottom" className="bg-stone-900 border-stone-800 text-stone-100 max-h-[75vh] rounded-t-3xl p-0">
          <SheetHeader className="p-5 border-b border-stone-800">
            <SheetTitle className="text-xl font-bold text-stone-100">
              Auswechseln für <span className="text-emerald-400">{managePlayer?.name}</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2.5 pb-safe max-h-[calc(75vh-75px)]">
            {benchPlayers.map(p => {
              const total = p.feldzeit + p.bankzeit;
              const bankPercent = total > 0 ? Math.round((p.bankzeit / total) * 100) : 100;
              return (
                <Button
                  key={p.id}
                  variant="outline"
                  onClick={() => handleExecuteSubstitute(p.id)}
                  className="h-auto p-3.5 bg-stone-800 border-stone-700 hover:bg-stone-700 hover:text-stone-100 justify-between active:scale-95 transition-transform"
                >
                  <span className="font-semibold text-sm truncate max-w-[85px]">{p.name}</span>
                  <span className="text-[10px] font-mono px-2 py-1 bg-black/40 text-emerald-400 rounded-md">
                    {bankPercent}%
                  </span>
                </Button>
              );
            })}

            {benchPlayers.length === 0 && (
              <div className="col-span-2 p-8 text-center text-stone-500 font-medium">
                Keine Spieler auf der Bank
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 5. Rename Position Slot Dialog/Sheet */}
      <Sheet open={!!editingSlotId} onOpenChange={(open) => !open && setEditingSlotId(null)}>
        <SheetContent side="bottom" className="bg-stone-900 border-stone-800 text-stone-100 rounded-t-3xl p-0">
          <SheetHeader className="p-5 border-b border-stone-800">
            <SheetTitle className="text-lg font-bold text-stone-100">
              Positionsbezeichnung anpassen
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-5 space-y-4 pb-safe">
            <div>
              <label className="text-xs text-stone-400 mb-1.5 block">Kürzel / Name (z.B. TW, LV, 6er, 10er, ST)</label>
              <input
                type="text"
                value={editLabelInput}
                onChange={(e) => setEditLabelInput(e.target.value)}
                maxLength={5}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 text-lg font-mono font-bold focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                onClick={handleSaveSlotLabel}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold h-12 rounded-xl"
              >
                Speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingSlotId(null)}
                className="flex-1 bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 h-12 rounded-xl"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
