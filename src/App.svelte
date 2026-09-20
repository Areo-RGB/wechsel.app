<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { store } from './store.svelte';
  import Kader from './components/Kader.svelte';
  import Aufstellung from './components/Aufstellung.svelte';
  import Daten from './components/Daten.svelte';
  import BottomNav from './components/BottomNav.svelte';

  let timer: any;

  onMount(() => {
    timer = setInterval(() => {
      store.tick();
    }, 1000);
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
</script>

<div class="h-full flex flex-col bg-white overflow-hidden select-none">
  <main class="flex-1 overflow-hidden relative">
    {#if store.activeTab === 'KADER'}
      <Kader />
    {:else if store.activeTab === 'AUFSTELLUNG' || store.activeTab === 'MATCH'}
      <Aufstellung />
    {:else if store.activeTab === 'DATEN'}
      <Daten />
    {/if}
  </main>
  
  <BottomNav />
</div>
