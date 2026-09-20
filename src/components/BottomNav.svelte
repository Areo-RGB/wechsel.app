<script lang="ts">
  import { Users, LayoutDashboard, BarChart2 } from 'lucide-svelte';
  import { store } from '../store.svelte';
  import { TabId } from '../types';

  const TABS: { id: TabId; label: string; icon: any }[] = [
    { id: 'KADER', label: 'Kader', icon: Users },
    { id: 'AUFSTELLUNG', label: 'Aufstellung', icon: LayoutDashboard },
    { id: 'DATEN', label: 'Daten', icon: BarChart2 },
  ];
</script>

<nav class="fixed bottom-0 w-full bg-white border-t border-[#e0e0e0] text-[#525252] z-50 select-none pb-[env(safe-area-inset-bottom,0px)]">
  <div class="flex justify-around items-stretch h-11">
    {#each TABS as tab (tab.id)}
      {@const isActive = store.activeTab === tab.id || (tab.id === 'AUFSTELLUNG' && store.activeTab === 'MATCH')}
      {@const Icon = tab.icon}
      
      <button
        type="button"
        onclick={() => store.setTab(tab.id)}
        class="relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors rounded-none {isActive ? 'text-[#0f62fe] bg-white font-medium' : 'text-[#525252] hover:text-[#161616] hover:bg-[#f4f4f4]'}"
      >
        {#if isActive}
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-[#0f62fe]"></div>
        {/if}
        <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
        <span class="text-[11px] leading-tight mt-0.5 tracking-[0.16px]">{tab.label}</span>
      </button>
    {/each}
  </div>
</nav>
