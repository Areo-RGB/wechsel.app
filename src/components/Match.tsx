import { useStore } from '../store';
import { formatTime } from '../lib/utils';
import { Play, Pause, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export function Match() {
  const { match, setMatchStatus, updateScore } = useStore();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-stone-950 p-6 pb-24">
      
      {/* Score Board */}
      <Card className="w-full max-w-sm mb-16 bg-stone-900 border-stone-800 shadow-xl overflow-hidden rounded-3xl">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-1.5">
              <img src="/assets/logo.png" alt="Team Logo" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />
              <span className="text-stone-400 font-medium uppercase tracking-wider text-sm">Heim</span>
            </div>
            <div className="flex items-center space-x-3 bg-stone-950 rounded-2xl p-2 border border-stone-800">
              <Button size="icon" variant="secondary" onClick={() => updateScore(-1, 0)} className="h-12 w-12 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors"><Minus size={20}/></Button>
              <span className="text-4xl font-bold font-mono w-12 text-center text-stone-100">{match.scoreHome}</span>
              <Button size="icon" variant="secondary" onClick={() => updateScore(1, 0)} className="h-12 w-12 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors"><Plus size={20}/></Button>
            </div>
          </div>

          <div className="text-2xl font-bold text-stone-700">:</div>

          <div className="flex flex-col items-center space-y-4">
            <span className="text-stone-400 font-medium uppercase tracking-wider text-sm">Gast</span>
            <div className="flex items-center space-x-3 bg-stone-950 rounded-2xl p-2 border border-stone-800">
              <Button size="icon" variant="secondary" onClick={() => updateScore(0, -1)} className="h-12 w-12 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors"><Minus size={20}/></Button>
              <span className="text-4xl font-bold font-mono w-12 text-center text-stone-100">{match.scoreAway}</span>
              <Button size="icon" variant="secondary" onClick={() => updateScore(0, 1)} className="h-12 w-12 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors"><Plus size={20}/></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer */}
      <div className="text-[100px] sm:text-[120px] font-bold font-mono leading-none tracking-tighter text-stone-100 mb-12 tabular-nums">
        {formatTime(match.elapsed)}
      </div>

      <Button
        size="lg"
        onClick={() => setMatchStatus(match.status === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
        className={`flex items-center justify-center space-x-3 px-12 py-8 rounded-full text-xl font-bold transition-all active:scale-95 ${
          match.status === 'RUNNING' 
            ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/50' 
            : 'bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]'
        }`}
      >
        {match.status === 'RUNNING' ? (
          <>
            <Pause fill="currentColor" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play fill="currentColor" />
            <span>Start</span>
          </>
        )}
      </Button>

    </div>
  );
}
