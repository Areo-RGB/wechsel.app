/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useStore } from './store';
import { BottomNav } from './components/BottomNav';
import { Kader } from './components/Kader';
import { Aufstellung } from './components/Aufstellung';
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
      case 'AUFSTELLUNG':
      case 'MATCH': return <Aufstellung />;
      case 'DATEN': return <Daten />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white text-[#161616] overflow-hidden font-sans select-none antialiased">
      <main className="flex-1 relative overflow-hidden">
        {renderTab()}
      </main>
      
      <Toaster />
      <BottomNav />
    </div>
  );
}
