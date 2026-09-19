import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { cn, formatTime } from '../lib/utils';
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
  Play,
  Pause,
  Shirt,
  Armchair,
  Timer,
  BarChart2
} from 'lucide-react';

export function Aufstellung() {
  const { 
    players, 
    positions, 
    selectedFieldPlayerId, 
    selectFieldPlayer, 
    movePlayerToSlot, 
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
  const [sheetTargetSlot, setSheetTargetSlot] = useState<string | null>(null);
  const [managePlayer, setManagePlayer] = useState<Player | null>(null);
  const [substituteSheetOpen, setSubstituteSheetOpen] = useState(false);
  const [isEditTacticsMode, setIsEditTacticsMode] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editLabelInput, setEditLabelInput] = useState('');
  const [timeDisplayMode, setTimeDisplayMode] = useState<'BOTH' | 'TIME' | 'PERCENT'>('BOTH');

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

  // Substitute active managePlayer with bench player directly
  const handleExecuteSubstitute = (benchPlayerId: string) => {
    if (!managePlayer || !managePlayer.positionId) return;
    dragPlayer(benchPlayerId, 'FIELD', managePlayer.positionId);
    setSubstituteSheetOpen(false);
    setManagePlayer(null);
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
    <div className="relative w-full h-full bg-white text-[#161616] flex flex-col overflow-hidden pb-11 select-none">
      
      {/* 1. Top Action Toolbar (Carbon condensed 36px) */}
      <div className="bg-[#f4f4f4] border-b border-[#e0e0e0] px-3 h-9 flex items-center justify-between shrink-0 z-20">
        
        {/* Lineup Label & Counter */}
        <div className="flex items-center space-x-1.5 text-xs">
          <Shirt size={13} className="text-[#0f62fe]" />
          <span className="font-semibold text-xs text-[#161616]">
            Aufstellung
          </span>
          <span className="font-mono text-xs text-[#525252]">
            ({fieldPlayersCount}/{positions.length})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          {/* Toggle Labels Edit Mode */}
          <Button
            size="xs"
            variant={isEditTacticsMode ? "default" : "outline"}
            onClick={() => setIsEditTacticsMode(!isEditTacticsMode)}
            className={cn(
              "h-7 px-2 text-xs font-medium rounded-none border",
              isEditTacticsMode 
                ? "bg-[#0f62fe] text-white border-[#0f62fe] hover:bg-[#0043ce]" 
                : "bg-white text-[#161616] border-[#e0e0e0] hover:bg-[#f4f4f4]"
            )}
          >
            {isEditTacticsMode ? (
              <>
                <Check size={12} className="mr-1" />
                Fertig
              </>
            ) : (
              <>
                <Pencil size={12} className="mr-1 text-[#525252]" />
                Bearbeiten
              </>
            )}
          </Button>

          {!isEditTacticsMode && (
            <>
              {/* Auto-Fill Button */}
              <Button
                size="xs"
                variant="outline"
                onClick={autoFillField}
                disabled={fieldPlayersCount >= positions.length}
                title="Automatisch freie Positionen besetzen"
                className="h-7 px-2 text-xs bg-white hover:bg-[#f4f4f4] text-[#161616] border-[#e0e0e0] rounded-none disabled:opacity-40"
              >
                <Sparkles size={12} className="text-[#0f62fe] mr-1" />
                Auto
              </Button>

              {/* Clear Field Button */}
              <Button
                size="xs"
                variant="outline"
                onClick={clearField}
                disabled={fieldPlayersCount === 0}
                title="Alle Spieler auf die Bank"
                className="h-7 px-2 text-xs bg-white hover:bg-[#f4f4f4] text-[#da1e28] hover:text-[#ba1b23] border-[#e0e0e0] rounded-none disabled:opacity-40"
              >
                <Trash2 size={12} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Instruction Banner */}
      {isEditTacticsMode && (
        <div className="bg-[#f4f4f4] border-b border-[#0f62fe] px-3 py-1 flex items-center justify-between text-[11px] text-[#161616]">
          <span>Antippen zum Umbenennen der Positionen.</span>
          <span className="font-mono text-[#0f62fe] font-semibold text-[10px]">EDIT-MODUS</span>
        </div>
      )}

      {/* Selected Player Instruction Banner */}
      {selectedFieldPlayerId && !isEditTacticsMode && (
        <div className="bg-[#f4f4f4] border-b border-[#0f62fe] px-3 py-1 flex items-center justify-between text-xs text-[#161616]">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#0f62fe]">
              {players.find(p => p.id === selectedFieldPlayerId)?.name}:
            </span>
            <span className="text-[#525252] text-[11px]">Tippe Position zum Tauschen</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const p = players.find(p => p.id === selectedFieldPlayerId);
                if (p) setManagePlayer(p);
                selectFieldPlayer(null);
              }}
              className="text-[11px] underline text-[#0f62fe] hover:text-[#0043ce]"
            >
              Optionen
            </button>
            <button
              onClick={() => selectFieldPlayer(null)}
              className="text-[11px] text-[#525252] hover:text-[#161616] ml-1"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* 2. Compact Match Control Ribbon (Carbon condensed 38px) */}
      <div className="bg-white border-b border-[#e0e0e0] px-3 h-10 flex items-center justify-between shrink-0 z-20">
        {/* Score Section */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-[10px] font-semibold text-[#525252] mr-0.5">H</span>
          <button 
            onClick={() => updateScore(-1, 0)} 
            className="w-5 h-5 bg-[#f4f4f4] hover:bg-[#e0e0e0] border border-[#e0e0e0] text-[#161616] flex items-center justify-center font-bold text-xs"
          >
            -
          </button>
          <span className="font-mono font-semibold text-sm px-1 min-w-[16px] text-center text-[#161616]">{match.scoreHome}</span>
          <button 
            onClick={() => updateScore(1, 0)} 
            className="w-5 h-5 bg-[#f4f4f4] hover:bg-[#e0e0e0] border border-[#e0e0e0] text-[#161616] flex items-center justify-center font-bold text-xs"
          >
            +
          </button>

          <span className="text-[#8c8c8c] font-bold px-0.5">:</span>

          <button 
            onClick={() => updateScore(0, -1)} 
            className="w-5 h-5 bg-[#f4f4f4] hover:bg-[#e0e0e0] border border-[#e0e0e0] text-[#161616] flex items-center justify-center font-bold text-xs"
          >
            -
          </button>
          <span className="font-mono font-semibold text-sm px-1 min-w-[16px] text-center text-[#161616]">{match.scoreAway}</span>
          <button 
            onClick={() => updateScore(0, 1)} 
            className="w-5 h-5 bg-[#f4f4f4] hover:bg-[#e0e0e0] border border-[#e0e0e0] text-[#161616] flex items-center justify-center font-bold text-xs"
          >
            +
          </button>
          <span className="text-[10px] font-semibold text-[#525252] ml-0.5">G</span>
        </div>

        {/* Center: Timer & Play/Pause */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <div className={cn(
              "w-2 h-2",
              match.status === 'RUNNING' ? "bg-[#24a148] animate-pulse" : match.status === 'PAUSED' ? "bg-[#f1c21b]" : "bg-[#8c8c8c]"
            )} />
            <span className="text-lg font-light font-mono text-[#161616] tabular-nums tracking-tight">
              {formatTime(match.elapsed)}
            </span>
          </div>

          <Button
            size="xs"
            onClick={() => setMatchStatus(match.status === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
            className={cn(
              "h-6 px-2 text-xs font-medium rounded-none transition-colors",
              match.status === 'RUNNING'
                ? "bg-[#161616] text-white hover:bg-[#262626]"
                : "bg-[#0f62fe] text-white hover:bg-[#0043ce]"
            )}
          >
            {match.status === 'RUNNING' ? (
              <>
                <Pause size={11} className="mr-1" fill="currentColor" />
                Pause
              </>
            ) : (
              <>
                <Play size={11} className="mr-1" fill="currentColor" />
                Start
              </>
            )}
          </Button>
        </div>

        {/* Right: Modus & Reset */}
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleTimeMode}
            className="h-6 px-2 border border-[#e0e0e0] bg-[#f4f4f4] hover:bg-[#e0e0e0] text-[10px] font-mono text-[#161616] flex items-center justify-center transition-colors"
            title="Anzeige-Modus umschalten"
          >
            {timeDisplayMode === 'BOTH' ? 'm:s & %' : timeDisplayMode === 'TIME' ? 'm:s' : '%'}
          </button>

          {match.elapsed > 0 && (
            <button 
              onClick={resetMatch} 
              title="Spielzeit zurücksetzen"
              className="w-6 h-6 flex items-center justify-center text-[#525252] hover:text-[#da1e28] transition-colors"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Condensed List Area */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Aufstellung Category Header */}
        <div className="h-6 bg-[#f4f4f4] border-b border-[#e0e0e0] px-3 flex items-center justify-between text-[11px] font-semibold text-[#525252] uppercase tracking-[0.32px] sticky top-0 z-10">
          <div className="flex items-center space-x-1.5">
            <Shirt size={12} className="text-[#0f62fe]" />
            <span>Aufstellung</span>
            <span className="font-mono text-[10px] text-[#161616] font-bold">
              ({fieldPlayersCount}/{positions.length})
            </span>
          </div>
          <span className="text-[10px] font-normal text-[#8c8c8c]">Auf dem Platz</span>
        </div>

        {/* Field Players Rows */}
        <div className="divide-y divide-[#e0e0e0] bg-white">
          {players.filter(p => p.status === 'FIELD').map(player => {
            const pos = positions.find(s => s.id === player.positionId);
            const isSelected = selectedFieldPlayerId === player.id;
            const avatar = getPlayerAvatar(player.name, player.avatar);
            
            return (
              <div 
                key={player.id}
                onClick={() => handleSlotClick(player.positionId || '')}
                className={cn(
                  "h-10 px-3 flex items-center justify-between transition-colors cursor-pointer select-none",
                  isSelected 
                    ? "bg-[#0f62fe]/10 border-l-2 border-[#0f62fe]" 
                    : "hover:bg-[#f4f4f4] active:bg-[#e0e0e0]"
                )}
              >
                {/* Left: Position Badge + Avatar + Name */}
                <div className="flex items-center min-w-0 mr-2 flex-1">
                  <span className="w-8 h-6 flex items-center justify-center bg-[#0f62fe] text-white text-[10px] font-mono font-bold shrink-0">
                    {pos?.label || pos?.id || '???'}
                  </span>

                  <div className="w-6 h-6 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 ml-2 flex items-center justify-center text-[10px] font-medium text-[#161616]">
                    {avatar ? (
                      <img src={avatar} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      player.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <span className="text-xs font-semibold text-[#161616] truncate ml-2.5">
                    {player.name}
                  </span>
                </div>

                {/* Right: Live Playtime / Percent + Options */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    {timeDisplayMode !== 'PERCENT' && (
                      <span className="text-[#161616] font-medium">
                        {formatTime(player.feldzeit)}
                      </span>
                    )}
                    {timeDisplayMode !== 'TIME' && (
                      <span className="text-[#0f62fe] font-bold">
                        {getPlayerPercent(player)}%
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setManagePlayer(player);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-[#525252] hover:text-[#0f62fe] transition-colors"
                  >
                    <SlidersHorizontal size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty Slots */}
          {positions.filter(pos => !players.some(p => p.status === 'FIELD' && p.positionId === pos.id)).map(pos => (
            <div 
              key={pos.id}
              onClick={() => handleSlotClick(pos.id)}
              className="h-9 px-3 flex items-center justify-between bg-white hover:bg-[#f4f4f4] transition-colors cursor-pointer text-xs select-none"
            >
              <div className="flex items-center space-x-2">
                <span className="w-8 h-5 flex items-center justify-center border border-dashed border-[#8c8c8c] text-[#525252] text-[10px] font-mono font-medium">
                  {pos.label || pos.id}
                </span>
                <span className="text-[#8c8c8c] text-xs">Position unbesetzt</span>
              </div>
              <span className="text-[11px] font-semibold text-[#0f62fe] hover:underline">
                + Zuweisen
              </span>
            </div>
          ))}
        </div>

        {/* Ersatzbank Category Header */}
        <div className="h-6 bg-[#f4f4f4] border-y border-[#e0e0e0] px-3 flex items-center justify-between text-[11px] font-semibold text-[#525252] uppercase tracking-[0.32px] sticky top-0 z-10 mt-1">
          <div className="flex items-center space-x-1.5">
            <Armchair size={12} className="text-[#525252]" />
            <span>Ersatzbank</span>
            <span className="font-mono text-[10px] text-[#161616] font-bold">
              ({benchPlayers.length})
            </span>
          </div>
          <span className="text-[10px] font-normal text-[#8c8c8c]">Verfügbar</span>
        </div>

        {/* Bench Players Rows */}
        <div className="divide-y divide-[#e0e0e0] bg-white">
          {benchPlayers.map(player => {
            const avatar = getPlayerAvatar(player.name, player.avatar);

            return (
              <div 
                key={player.id}
                onClick={() => setManagePlayer(player)}
                className="h-9 px-3 flex items-center justify-between bg-white hover:bg-[#f4f4f4] transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center min-w-0 mr-2 flex-1">
                  <span className="w-8 h-5 flex items-center justify-center bg-[#f4f4f4] border border-[#e0e0e0] text-[#525252] text-[9px] font-mono font-semibold shrink-0">
                    BANK
                  </span>

                  <div className="w-5 h-5 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 ml-2 flex items-center justify-center text-[9px] font-medium text-[#525252]">
                    {avatar ? (
                      <img src={avatar} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      player.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <span className="text-xs text-[#161616] font-medium truncate ml-2.5">
                    {player.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    {timeDisplayMode !== 'PERCENT' && (
                      <span className="text-[#8c8c8c]">
                        {formatTime(player.feldzeit)}
                      </span>
                    )}
                    {timeDisplayMode !== 'TIME' && (
                      <span className="text-[#525252] font-semibold">
                        {getPlayerPercent(player)}%
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setManagePlayer(player);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-[#8c8c8c] hover:text-[#0f62fe] transition-colors"
                  >
                    <ArrowLeftRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {benchPlayers.length === 0 && (
            <div className="py-3 text-center text-xs text-[#8c8c8c] italic">
              Keine Spieler auf der Bank
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Summary Bar (Carbon condensed 24px) */}
      <div className="bg-[#f4f4f4] border-t border-[#e0e0e0] px-3 h-6 flex items-center justify-between text-[11px] text-[#525252] shrink-0">
        <div>
          Aufgestellt: <strong className="text-[#161616] font-mono">{fieldPlayersCount}/{positions.length}</strong>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span>Bank: <strong className="text-[#161616] font-mono">{benchPlayers.length}</strong></span>
          <span className="text-[#e0e0e0]">|</span>
          <span>Kader: <strong className="text-[#161616] font-mono">{squadPlayers.length}</strong></span>
        </div>
      </div>

      {/* 1. Empty Slot Assignment Sheet */}
      <Sheet open={!!sheetTargetSlot} onOpenChange={(open) => !open && setSheetTargetSlot(null)}>
        <SheetContent side="bottom" className="bg-white border-t border-[#e0e0e0] text-[#161616] max-h-[75vh] rounded-none p-0">
          <SheetHeader className="p-4 border-b border-[#e0e0e0] flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-sm font-semibold text-[#161616]">
              Spieler für Position <span className="text-[#0f62fe] font-mono">[{positions.find(p => p.id === sheetTargetSlot)?.label || sheetTargetSlot}]</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-3 overflow-y-auto grid grid-cols-2 gap-2 pb-6 max-h-[calc(75vh-65px)]">
            {allAvailablePlayers.map(p => {
              const total = p.feldzeit + p.bankzeit;
              const bankPercent = total > 0 ? Math.round((p.bankzeit / total) * 100) : 100;
              const isBench = p.status === 'BENCH';
              const avatar = getPlayerAvatar(p.name, p.avatar);

              return (
                <button
                  key={p.id}
                  onClick={() => handleAssignPlayer(p.id)}
                  className="h-11 px-2.5 bg-white border border-[#e0e0e0] hover:bg-[#f4f4f4] flex items-center justify-between text-left transition-colors rounded-none"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-6 h-6 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-medium text-[#161616]">
                      {avatar ? (
                        <img src={avatar} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        p.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-[#161616] truncate">{p.name}</div>
                      <span className="text-[9px] text-[#525252]">
                        {isBench ? 'Bank' : 'Kader'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#525252] ml-1 shrink-0">
                    {bankPercent}%
                  </span>
                </button>
              );
            })}

            {allAvailablePlayers.length === 0 && (
              <div className="col-span-2 p-6 text-center text-xs text-[#8c8c8c]">
                Keine weiteren Spieler verfügbar
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 3. Manage Occupied Field Player Sheet */}
      <Sheet open={!!managePlayer} onOpenChange={(open) => !open && setManagePlayer(null)}>
        <SheetContent side="bottom" className="bg-white border-t border-[#e0e0e0] text-[#161616] rounded-none p-0">
          <SheetHeader className="p-4 border-b border-[#e0e0e0]">
            <SheetTitle className="text-base font-semibold text-[#161616] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden flex items-center justify-center text-xs font-semibold text-[#161616]">
                  {managePlayer && getPlayerAvatar(managePlayer.name, managePlayer.avatar) ? (
                    <img src={getPlayerAvatar(managePlayer.name, managePlayer.avatar)!} alt={managePlayer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    managePlayer?.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span>{managePlayer?.name}</span>
              </div>
              <span className="text-xs font-mono font-bold bg-[#f4f4f4] text-[#0f62fe] border border-[#e0e0e0] px-2 py-0.5">
                Pos: {positions.find(p => p.id === managePlayer?.positionId)?.label || managePlayer?.positionId}
              </span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-4 space-y-2 pb-6">
            {/* Quick Action: Substitute */}
            <Button
              variant="outline"
              onClick={() => setSubstituteSheetOpen(true)}
              className="w-full h-10 bg-white hover:bg-[#f4f4f4] text-[#161616] border-[#e0e0e0] justify-start px-3 text-xs font-medium rounded-none"
            >
              <ArrowLeftRight size={15} className="text-[#0f62fe] mr-2.5 shrink-0" />
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
              className="w-full h-10 bg-white hover:bg-[#f4f4f4] text-[#161616] border-[#e0e0e0] justify-start px-3 text-xs font-medium rounded-none"
            >
              <UserMinus size={15} className="text-[#525252] mr-2.5 shrink-0" />
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
              className="w-full h-10 bg-white hover:bg-[#f4f4f4] text-[#161616] border-[#e0e0e0] justify-start px-3 text-xs font-medium rounded-none"
            >
              <SlidersHorizontal size={15} className="text-[#0f62fe] mr-2.5 shrink-0" />
              <span>Position tauschen</span>
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={() => setManagePlayer(null)}
              className="w-full h-8 text-[#525252] hover:text-[#161616] text-xs rounded-none mt-1"
            >
              Abbrechen
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 4. Substitute Player Picker Sheet */}
      <Sheet open={substituteSheetOpen} onOpenChange={setSubstituteSheetOpen}>
        <SheetContent side="bottom" className="bg-white border-t border-[#e0e0e0] text-[#161616] max-h-[75vh] rounded-none p-0">
          <SheetHeader className="p-4 border-b border-[#e0e0e0]">
            <SheetTitle className="text-sm font-semibold text-[#161616]">
              Auswechseln für <span className="text-[#0f62fe]">{managePlayer?.name}</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-3 overflow-y-auto grid grid-cols-2 gap-2 pb-6 max-h-[calc(75vh-65px)]">
            {benchPlayers.map(p => {
              const total = p.feldzeit + p.bankzeit;
              const bankPercent = total > 0 ? Math.round((p.bankzeit / total) * 100) : 100;
              return (
                <button
                  key={p.id}
                  onClick={() => handleExecuteSubstitute(p.id)}
                  className="h-10 px-2.5 bg-white border border-[#e0e0e0] hover:bg-[#f4f4f4] flex items-center justify-between text-left transition-colors rounded-none"
                >
                  <span className="font-semibold text-xs text-[#161616] truncate">{p.name}</span>
                  <span className="text-[10px] font-mono text-[#525252] ml-1">
                    {bankPercent}%
                  </span>
                </button>
              );
            })}

            {benchPlayers.length === 0 && (
              <div className="col-span-2 p-6 text-center text-xs text-[#8c8c8c]">
                Keine Spieler auf der Bank
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 5. Rename Position Slot Dialog/Sheet */}
      <Sheet open={!!editingSlotId} onOpenChange={(open) => !open && setEditingSlotId(null)}>
        <SheetContent side="bottom" className="bg-white border-t border-[#e0e0e0] text-[#161616] rounded-none p-0">
          <SheetHeader className="p-4 border-b border-[#e0e0e0]">
            <SheetTitle className="text-sm font-semibold text-[#161616]">
              Positionsbezeichnung anpassen
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-4 space-y-3 pb-6">
            <div>
              <label className="text-xs text-[#525252] mb-1 block">Kürzel / Name (z.B. TW, LV, 6er, 10er, ST)</label>
              <input
                type="text"
                value={editLabelInput}
                onChange={(e) => setEditLabelInput(e.target.value)}
                maxLength={5}
                className="w-full bg-[#f4f4f4] border border-[#e0e0e0] rounded-none px-3 py-2 text-[#161616] text-sm font-mono font-bold focus:outline-none focus:border-[#0f62fe]"
                autoFocus
              />
            </div>

            <div className="flex space-x-2 pt-1">
              <Button
                onClick={handleSaveSlotLabel}
                className="flex-1 bg-[#0f62fe] hover:bg-[#0043ce] text-white font-medium h-9 rounded-none text-xs"
              >
                Speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingSlotId(null)}
                className="flex-1 bg-white border-[#e0e0e0] text-[#161616] hover:bg-[#f4f4f4] h-9 rounded-none text-xs"
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
