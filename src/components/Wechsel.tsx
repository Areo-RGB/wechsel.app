import { useStore } from '../store';
import { getPlayerAvatar } from '../lib/avatars';
import { X, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export function Wechsel() {
  const { wechselQueue, players, removeWechsel, executeWechsel } = useStore();

  return (
    <div className="p-4 overflow-y-auto pb-24 h-full bg-stone-950 flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-stone-100">Geplante Wechsel</h2>
      
      <div className="flex-1 overflow-hidden">
        {wechselQueue.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-stone-500 font-medium">
            Noch keine geplanten Wechsel
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {wechselQueue.map(w => {
                const outPlayer = players.find(p => p.id === w.outPlayerId);
                const inPlayer = players.find(p => p.id === w.inPlayerId);
                const outAvatar = outPlayer ? getPlayerAvatar(outPlayer.name, outPlayer.avatar) : null;
                const inAvatar = inPlayer ? getPlayerAvatar(inPlayer.name, inPlayer.avatar) : null;
                
                return (
                  <Card key={w.id} className="bg-stone-900 border-stone-800">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-stone-300">
                        {/* Out Player */}
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-stone-800 border border-rose-500/50 overflow-hidden flex items-center justify-center text-xs font-bold text-stone-300">
                            {outAvatar ? (
                              <img src={outAvatar} alt={outPlayer?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              outPlayer?.name.substring(0, 2)
                            )}
                          </div>
                          <span className="font-semibold text-rose-400 text-sm">{outPlayer?.name || 'OUT'}</span>
                        </div>

                        <ArrowRight size={16} className="text-stone-500 shrink-0" />

                        {/* In Player */}
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-stone-800 border border-emerald-500/50 overflow-hidden flex items-center justify-center text-xs font-bold text-stone-300">
                            {inAvatar ? (
                              <img src={inAvatar} alt={inPlayer?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              inPlayer?.name.substring(0, 2)
                            )}
                          </div>
                          <span className="font-semibold text-emerald-400 text-sm">{inPlayer?.name || 'IN'}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeWechsel(w.id)} className="text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors">
                        <X size={20} />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="mt-6 pt-2">
        <Button
          size="lg"
          onClick={executeWechsel}
          disabled={wechselQueue.length === 0}
          className="w-full py-6 rounded-2xl font-bold text-lg transition-all active:scale-95 bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]"
        >
          Ausführen
        </Button>
      </div>
    </div>
  );
}
