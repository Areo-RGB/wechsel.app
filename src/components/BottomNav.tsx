import { Users, LayoutDashboard, Timer, Replace, BarChart2 } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { TabId } from '../types';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'KADER', label: 'Kader', icon: Users },
  { id: 'AUFSTELLUNG', label: 'Aufstellung', icon: LayoutDashboard },
  { id: 'MATCH', label: 'Match', icon: Timer },
  { id: 'WECHSEL', label: 'Wechsel', icon: Replace },
  { id: 'DATEN', label: 'Daten', icon: BarChart2 },
];

export function BottomNav() {
  const { activeTab, setTab, players } = useStore();
  const hasFieldPlayers = players.some(p => p.status === 'FIELD');

  return (
    <nav className="fixed bottom-0 w-full bg-stone-900 border-t border-stone-800 text-stone-400 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.id === 'MATCH' && !hasFieldPlayers;
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setTab(tab.id)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-emerald-500" : "hover:text-stone-200",
                isDisabled && "opacity-30 cursor-not-allowed"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] uppercase font-medium tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
