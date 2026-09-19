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
    <nav className="fixed bottom-0 w-full bg-white border-t border-[#e0e0e0] text-[#525252] z-50 select-none">
      <div className="flex justify-around items-stretch h-11">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'AUFSTELLUNG' && activeTab === 'MATCH');
          
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors rounded-none",
                isActive 
                  ? "text-[#0f62fe] bg-white font-medium" 
                  : "text-[#525252] hover:text-[#161616] hover:bg-[#f4f4f4]"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0f62fe]" />
              )}
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[11px] leading-tight mt-0.5 tracking-[0.16px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
