import React, { useState } from 'react';
import { useStore } from '../store';
import { cn, formatTime } from '../lib/utils';
import { Player } from '../types';
import { getPlayerAvatar } from '../lib/avatars';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { FullscreenButton } from './FullscreenButton';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  Shirt, 
  Armchair
} from 'lucide-react';

export function Aufstellung() {
  const { 
    players, 
    positions,
    removePlayerFromField,
    dragPlayer,
    match,
    setMatchStatus,
    resetMatch
  } = useStore();

  const maxFieldCount = positions?.length || 8;

  // Display mode for playtimes
  const [timeDisplayMode, setTimeDisplayMode] = useState<'BOTH' | 'TIME' | 'PERCENT'>('BOTH');

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

  const fieldPlayers = players.filter(p => p.status === 'FIELD');
  const benchPlayers = players.filter(p => p.status !== 'FIELD').sort((a, b) => a.name.localeCompare(b.name));

  // Direct action: Bring bench player onto the field
  const handleBringToField = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    if (fieldPlayers.length >= maxFieldCount) {
      toast.error(`Feld ist voll (${maxFieldCount}/${maxFieldCount}) – zuerst einen Spieler auf die Bank (+ Bank)`);
      return;
    }

    dragPlayer(playerId, 'FIELD', null);
    toast.success(`${player.name} aufs Feld gestellt`);
  };

  // Direct action: Move field player to the bench
  const handleMoveToBench = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    removePlayerFromField(playerId);
    if (player) {
      toast.success(`${player.name} auf die Bank gesetzt`);
    }
  };

  return (
    <div className="relative w-full h-full bg-white text-[#161616] flex flex-col overflow-hidden pb-11 select-none">
      
      {/* Match Control Ribbon with Timer, Play/Pause, Reset & Fullscreen */}
      <div className="bg-white border-b border-[#e0e0e0] px-3 h-10 flex items-center justify-between shrink-0 z-20">
        {/* Timer & Play/Pause */}
        <div className="flex items-center space-x-2.5">
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
              "h-6 px-2.5 text-xs font-medium rounded-none transition-colors",
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

        {/* Right: Reset Button & Fullscreen Button */}
        <div className="flex items-center space-x-2">
          {match.elapsed > 0 && (
            <button 
              onClick={resetMatch} 
              title="Spielzeit zurücksetzen"
              className="h-6 px-2 border border-[#e0e0e0] bg-[#f4f4f4] hover:bg-[#e0e0e0] text-[#525252] hover:text-[#da1e28] flex items-center space-x-1 text-xs transition-colors"
            >
              <RotateCcw size={11} />
              <span className="text-[10px] font-medium">Reset</span>
            </button>
          )}
          <FullscreenButton className="h-6 px-2" />
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
              ({fieldPlayers.length}/{maxFieldCount})
            </span>
          </div>
          <span className="text-[10px] font-normal text-[#8c8c8c]">Auf dem Platz</span>
        </div>

        {/* Field Players Rows */}
        <div className="divide-y divide-[#e0e0e0] bg-white">
          {fieldPlayers.map(player => {
            const avatar = getPlayerAvatar(player.name, player.avatar);
            
            return (
              <div 
                key={player.id}
                onClick={toggleTimeMode}
                className="h-10 px-3 flex items-center justify-between transition-colors cursor-pointer select-none hover:bg-[#f4f4f4] active:bg-[#e0e0e0]"
              >
                {/* Left: Avatar + Name */}
                <div className="flex items-center min-w-0 mr-2 flex-1">
                  <div className="w-6 h-6 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-medium text-[#161616]">
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

                {/* Right: Live Playtime / Percent + Direct + Bank button */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTimeMode();
                    }}
                    title="Klicken zum Umschalten: m:s / % / beides"
                    className="flex items-center space-x-2 font-mono text-xs cursor-pointer hover:opacity-75 transition-opacity"
                  >
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
                      handleMoveToBench(player.id);
                    }}
                    title="Auf die Bank setzen"
                    className="px-2 py-0.5 text-[11px] font-medium text-[#525252] hover:text-[#161616] hover:bg-[#e0e0e0] border border-[#c6c6c6] transition-colors"
                  >
                    + Bank
                  </button>
                </div>
              </div>
            );
          })}

          {fieldPlayers.length === 0 && (
            <div className="py-4 text-center text-xs text-[#8c8c8c] italic">
              Keine Spieler auf dem Platz. Klicke bei einem Bankspieler auf "+ Feld" oder nutze "Auto".
            </div>
          )}
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
                onClick={() => handleBringToField(player.id)}
                className="h-9 px-3 flex items-center justify-between bg-white hover:bg-[#f4f4f4] transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center min-w-0 mr-2 flex-1">
                  <div className="w-5 h-5 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 flex items-center justify-center text-[9px] font-medium text-[#525252]">
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
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTimeMode();
                    }}
                    title="Klicken zum Umschalten: m:s / % / beides"
                    className="flex items-center space-x-2 font-mono text-xs cursor-pointer hover:opacity-75 transition-opacity"
                  >
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
                      handleBringToField(player.id);
                    }}
                    title="Aufs Feld bringen"
                    className="px-2 py-0.5 text-[11px] font-medium text-[#0f62fe] hover:bg-[#0f62fe]/10 border border-[#0f62fe]/40 transition-colors"
                  >
                    + Feld
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

      {/* Bottom Summary Bar (Carbon condensed 24px) */}
      <div className="bg-[#f4f4f4] border-t border-[#e0e0e0] px-3 h-6 flex items-center justify-between text-[11px] text-[#525252] shrink-0">
        <div>
          Aufgestellt: <strong className="text-[#161616] font-mono">{fieldPlayers.length}/{maxFieldCount}</strong>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span>Bank: <strong className="text-[#161616] font-mono">{benchPlayers.length}</strong></span>
        </div>
      </div>

    </div>
  );
}
