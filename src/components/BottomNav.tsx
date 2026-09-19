import React from 'react';
import { Users, LayoutDashboard, Timer, Replace, BarChart2 } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { TabId } from '../types';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'KADER', label: 'Kader', icon: Users },
  { id: 'AUFSTELLUNG', label: 'Aufstellung', icon: LayoutDashboard },
  { id: 'WECHSEL', label: 'Wechsel', icon: Replace },
  { id: 'DATEN', label: 'Daten', icon: BarChart2 },
];

export function BottomNav() {
  const { activeTab, setTab } = useStore();

  return (
    <nav className="fixed bottom-0 w-full bg-stone-900 border-t border-stone-800 text-stone-400 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'AUFSTELLUNG' && activeTab === 'MATCH');
          
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-emerald-500" : "hover:text-stone-200"
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
