import { POSITIONS } from "../lib/positions";
import { useState } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from './ui/button';


export function Aufstellung() {
  const { players, selectedFieldPlayerId, selectFieldPlayer, movePlayerToSlot, planWechsel } = useStore();
  const [sheetTargetSlot, setSheetTargetSlot] = useState<string | null>(null);
  
  const benchPlayers = players.filter(p => p.status === 'BENCH').sort((a, b) => a.name.localeCompare(b.name));

  const handleSlotTap = (posId: string) => {
    const occupant = players.find(p => p.positionId === posId && p.status === 'FIELD');
    
    if (occupant) {
      if (selectedFieldPlayerId === occupant.id) {
        // Tap same occupant again -> open Wechsel sheet
        setSheetTargetSlot(posId);
      } else {
        if (selectedFieldPlayerId) {
          // A different player was selected, move selected player to this slot
          movePlayerToSlot(selectedFieldPlayerId, posId);
        } else {
          // Select this player
          selectFieldPlayer(occupant.id);
        }
      }
    } else {
      // Tapped empty slot
      if (selectedFieldPlayerId) {
        // Move selected player here
        movePlayerToSlot(selectedFieldPlayerId, posId);
      } else {
        // Assign from bench
        setSheetTargetSlot(posId);
      }
    }
  };

  const handleBenchPlayerSelect = (benchPlayerId: string) => {
    if (!sheetTargetSlot) return;
    
    const occupant = players.find(p => p.positionId === sheetTargetSlot && p.status === 'FIELD');
    if (occupant) {
      // It's a wechsel
      planWechsel(occupant.id, benchPlayerId);
    } else {
      // It's an initial assignment
      movePlayerToSlot(benchPlayerId, sheetTargetSlot);
    }
    setSheetTargetSlot(null);
  };

  return (
    <div className="relative w-full h-full bg-stone-950 overflow-hidden pb-24">
      {/* Pitch Background */}
      <div className="absolute inset-4 top-8 bottom-28 bg-emerald-800 rounded-xl border-4 border-emerald-600/50 shadow-inner overflow-hidden">
        {/* Pitch Lines */}
        <div className="absolute top-1/2 left-0 w-full h-0 border-t-2 border-emerald-600/50" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 -mt-16 -ml-16 rounded-full border-2 border-emerald-600/50" />
        <div className="absolute top-0 left-1/2 w-48 h-24 -ml-24 border-2 border-t-0 border-emerald-600/50 rounded-b-xl" />
        <div className="absolute bottom-0 left-1/2 w-48 h-24 -ml-24 border-2 border-b-0 border-emerald-600/50 rounded-t-xl" />
        
        {/* Slots */}
        {POSITIONS.map(pos => {
          const occupant = players.find(p => p.positionId === pos.id && p.status === 'FIELD');
          const isSelected = occupant && selectedFieldPlayerId === occupant.id;
          
          return (
            <button
              key={pos.id}
              onClick={() => handleSlotTap(pos.id)}
              className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full flex flex-col items-center justify-center transition-transform active:scale-90"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {occupant ? (
                <div className={cn(
                  "w-12 h-12 rounded-full bg-stone-900 border-2 shadow-xl flex items-center justify-center text-stone-100 font-bold text-sm uppercase overflow-hidden",
                  isSelected ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] text-amber-400" : "border-stone-700"
                )}>
                  {occupant.name.substring(0, 3)}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-black/20 border-2 border-emerald-400/30 flex items-center justify-center text-emerald-400/50 backdrop-blur-sm">
                  <span className="text-lg font-bold leading-none mb-0.5">+</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Sheet open={!!sheetTargetSlot} onOpenChange={(open) => !open && setSheetTargetSlot(null)}>
        <SheetContent side="bottom" className="bg-stone-900 border-stone-800 text-stone-100 max-h-[70vh] rounded-t-3xl p-0">
          <SheetHeader className="p-5 border-b border-stone-800 flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-xl font-bold text-stone-100">
              {players.find(p => p.positionId === sheetTargetSlot && p.status === 'FIELD') 
                ? 'Auswechseln mit...' 
                : 'Spieler wählen'}
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-5 overflow-y-auto grid grid-cols-2 gap-3 pb-safe max-h-[calc(70vh-70px)]">
            {benchPlayers.map(p => {
              const total = p.feldzeit + p.bankzeit;
              const bankPercent = total > 0 ? Math.round((p.bankzeit / total) * 100) : 100;
              return (
                <Button
                  key={p.id}
                  variant="outline"
                  onClick={() => handleBenchPlayerSelect(p.id)}
                  className="h-auto p-4 bg-stone-800 border-stone-700 hover:bg-stone-700 hover:text-stone-100 justify-between active:scale-95 transition-transform"
                >
                  <span className="font-semibold text-sm truncate max-w-[80px]">{p.name}</span>
                  <span className="text-[10px] font-mono px-2 py-1 bg-black/40 text-emerald-400 rounded-md">{bankPercent}%</span>
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
    </div>
  );
}
