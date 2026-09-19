import { useStore } from '../store';
import { getPlayerAvatar } from '../lib/avatars';
import { X, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export function Wechsel() {
  const { wechselQueue, players, removeWechsel, executeWechsel } = useStore();

  return (
    <div className="overflow-y-auto pb-16 h-full bg-white text-[#161616] flex flex-col select-none">
      {/* Condensed Header */}
      <div className="h-9 px-3 bg-[#f4f4f4] border-b border-[#e0e0e0] flex items-center justify-between shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-[0.32px] text-[#525252]">
          Geplante Wechsel
        </h2>
        <span className="font-mono text-xs text-[#161616] font-bold">
          {wechselQueue.length} aktiv
        </span>
      </div>
      
      <div className="flex-1 overflow-hidden p-3">
        {wechselQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-center text-[#8c8c8c] text-xs space-y-1">
            <p>Keine geplanten Wechsel</p>
            <p className="text-[11px] text-[#8c8c8c]">Wechsel können in der Aufstellung vorgemerkt werden.</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {wechselQueue.map(w => {
                const outPlayer = players.find(p => p.id === w.outPlayerId);
                const inPlayer = players.find(p => p.id === w.inPlayerId);
                const outAvatar = outPlayer ? getPlayerAvatar(outPlayer.name, outPlayer.avatar) : null;
                const inAvatar = inPlayer ? getPlayerAvatar(inPlayer.name, inPlayer.avatar) : null;
                
                return (
                  <div key={w.id} className="bg-white border border-[#e0e0e0] p-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 text-[#161616]">
                      {/* Out Player */}
                      <div className="flex items-center space-x-1.5">
                        <div className="w-6 h-6 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden flex items-center justify-center text-[10px] font-semibold text-[#161616]">
                          {outAvatar ? (
                            <img src={outAvatar} alt={outPlayer?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            outPlayer?.name.substring(0, 2)
                          )}
                        </div>
                        <span className="font-semibold text-[#da1e28] text-xs">{outPlayer?.name || 'OUT'}</span>
                      </div>

                      <ArrowRight size={13} className="text-[#8c8c8c] shrink-0" />

                      {/* In Player */}
                      <div className="flex items-center space-x-1.5">
                        <div className="w-6 h-6 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden flex items-center justify-center text-[10px] font-semibold text-[#161616]">
                          {inAvatar ? (
                            <img src={inAvatar} alt={inPlayer?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            inPlayer?.name.substring(0, 2)
                          )}
                        </div>
                        <span className="font-semibold text-[#24a148] text-xs">{inPlayer?.name || 'IN'}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeWechsel(w.id)} 
                      className="w-6 h-6 flex items-center justify-center text-[#8c8c8c] hover:text-[#da1e28] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="p-3 border-t border-[#e0e0e0] bg-[#f4f4f4] shrink-0">
        <Button
          size="sm"
          onClick={executeWechsel}
          disabled={wechselQueue.length === 0}
          className="w-full h-9 rounded-none font-medium text-xs bg-[#0f62fe] text-white hover:bg-[#0043ce] disabled:opacity-40 transition-colors"
        >
          Wechsel jetzt durchführen
        </Button>
      </div>
    </div>
  );
}
