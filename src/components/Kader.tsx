import { POSITIONS } from "../lib/positions";
import { useState } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  MouseSensor, 
  TouchSensor, 
  DragEndEvent, 
  DragOverlay,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { Player } from '../types';


function PlayerAvatar({ player, isOverlay = false }: { player: Player, isOverlay?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center space-y-1 w-14 shrink-0", 
      isOverlay && "scale-110 opacity-90 cursor-grabbing drop-shadow-2xl"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-md overflow-hidden bg-stone-200 text-stone-800",
        player.status === 'FIELD' && "bg-stone-900 border-2 border-stone-700 text-stone-100",
        player.status === 'BENCH' && "bg-stone-700 border border-stone-600 text-stone-100",
        player.status === 'OUT' && "bg-stone-800 border border-stone-700 text-stone-400 opacity-60"
      )}>
        {/* We use a generic image placeholder or just name text */}
        {player.name.substring(0, 3).toUpperCase()}
      </div>
      <span className={cn(
        "text-[10px] font-medium truncate w-full text-center px-1",
        player.status === 'OUT' ? 'text-stone-500' : 'text-stone-300'
      )}>{player.name}</span>
    </div>
  );
}

function DraggablePlayer({ player }: { player: Player; key?: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `player-${player.id}`,
    data: player
  });
  
  const style = transform ? { 
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing touch-none">
      <PlayerAvatar player={player} />
    </div>
  );
}

function DroppableZone({ id, title, players }: { id: string, title: string, players: Player[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className={cn(
      "p-3 border-b border-stone-800 bg-stone-900 transition-colors flex flex-col h-full", 
      isOver && "bg-stone-800/80 ring-2 ring-inset ring-emerald-500/50"
    )}>
      <h3 className="text-sm font-medium text-stone-400 mb-2">{title}</h3>
      <div className="flex space-x-3 overflow-x-auto pb-2 px-1 flex-1 items-center">
         {players.map(p => <DraggablePlayer key={p.id} player={p} />)}
         {players.length === 0 && <div className="text-xs text-stone-600 my-auto italic w-full text-center">Leer</div>}
      </div>
    </div>
  );
}

function DroppableSlot({ position, occupant }: { position: typeof POSITIONS[0], occupant?: Player; key?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${position.id}` });
  
  return (
    <div
      ref={setNodeRef}
      className="absolute w-14 h-14 -ml-7 -mt-7 flex flex-col items-center justify-center z-10"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <div className={cn(
        "absolute inset-0 rounded-full transition-all duration-200", 
        isOver ? "bg-emerald-400/40 scale-125" : "bg-black/10"
      )} />
      {occupant ? (
         <DraggablePlayer player={occupant} />
      ) : (
         <div className="w-8 h-8 rounded-full border-2 border-emerald-400/30 bg-black/20 flex flex-col items-center justify-center text-emerald-400/50">
           <span className="text-[9px] font-bold mt-0.5">{position.id}</span>
         </div>
      )}
    </div>
  );
}

export function Kader() {
  const { players, dragPlayer } = useStore();
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const squadPlayers = players.filter(p => p.status === 'OUT').sort((a, b) => a.name.localeCompare(b.name));
  const benchPlayers = players.filter(p => p.status === 'BENCH').sort((a, b) => a.name.localeCompare(b.name));

  const handleDragStart = (e: any) => {
    const p = players.find(p => p.id === e.active.id.replace('player-', ''));
    if (p) setActivePlayer(p);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActivePlayer(null);
    const { active, over } = e;
    if (!over) return;

    const playerId = (active.id as string).replace('player-', '');
    const overId = over.id as string;

    if (overId === 'squad') {
      dragPlayer(playerId, 'OUT', null);
    } else if (overId === 'bench') {
      dragPlayer(playerId, 'BENCH', null);
    } else if (overId.startsWith('slot-')) {
      const posId = overId.replace('slot-', '');
      dragPlayer(playerId, 'FIELD', posId);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full bg-stone-950 pb-16">
        
        {/* PITCH AREA */}
        <div className="flex-1 relative bg-emerald-900 border-b border-stone-800 overflow-hidden">
          {/* Pitch Lines */}
          <div className="absolute inset-4 top-6 bottom-6 border-2 border-emerald-600/40 rounded-sm">
            <div className="absolute top-1/2 left-0 w-full h-0 border-t-2 border-emerald-600/40" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 -mt-12 -ml-12 rounded-full border-2 border-emerald-600/40" />
            <div className="absolute top-0 left-1/2 w-40 h-16 -ml-20 border-2 border-t-0 border-emerald-600/40" />
            <div className="absolute bottom-0 left-1/2 w-40 h-16 -ml-20 border-2 border-b-0 border-emerald-600/40" />
            
            {/* Slots inside the pitch boundaries */}
            {POSITIONS.map(pos => {
              const occupant = players.find(p => p.positionId === pos.id && p.status === 'FIELD');
              return (
                <DroppableSlot key={pos.id} position={pos} occupant={occupant} />
              );
            })}
          </div>
        </div>

        {/* BENCH AREA */}
        <div className="h-[100px] shrink-0">
          <DroppableZone id="bench" title="Substitutes' bench" players={benchPlayers} />
        </div>

        {/* SQUAD AREA */}
        <div className="h-[100px] shrink-0">
          <DroppableZone id="squad" title="Squad" players={squadPlayers} />
        </div>

      </div>
      
      <DragOverlay dropAnimation={null}>
        {activePlayer ? <PlayerAvatar player={activePlayer} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
