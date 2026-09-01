/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useStore } from './store';
import { BottomNav } from './components/BottomNav';
import { Kader } from './components/Kader';
import { Aufstellung } from './components/Aufstellung';
import { Match } from './components/Match';
import { Wechsel } from './components/Wechsel';
import { Daten } from './components/Daten';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const { activeTab, tick } = useStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const renderTab = () => {
    switch (activeTab) {
      case 'KADER': return <Kader />;
      case 'AUFSTELLUNG': return <Aufstellung />;
      case 'MATCH': return <Match />;
      case 'WECHSEL': return <Wechsel />;
      case 'DATEN': return <Daten />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-stone-950 text-stone-100 overflow-hidden font-sans select-none">
      <header className="h-14 shrink-0 flex items-center justify-center border-b border-stone-800 bg-stone-950 z-10">
        <h1 className="text-lg font-bold tracking-widest uppercase text-stone-200">Wexel</h1>
      </header>
      
      <main className="flex-1 relative overflow-hidden">
        {renderTab()}
      </main>
      
      <Toaster />
      <BottomNav />
    </div>
  );
}
