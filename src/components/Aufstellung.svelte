<script lang="ts">
  import { store } from '../store.svelte';
  import { formatTime } from '../lib/utils';
  import { getPlayerAvatar } from '../lib/avatars';
  import { Player } from '../types';
  import { 
    RotateCcw, 
    Play, 
    Pause, 
    Shirt, 
    Armchair
  } from 'lucide-svelte';
  import FullscreenButton from './FullscreenButton.svelte';

  const maxFieldCount = $derived(store.positions?.length || 8);

  let timeDisplayMode = $state<'BOTH' | 'TIME' | 'PERCENT'>('BOTH');

  function toggleTimeMode() {
    if (timeDisplayMode === 'BOTH') timeDisplayMode = 'TIME';
    else if (timeDisplayMode === 'TIME') timeDisplayMode = 'PERCENT';
    else timeDisplayMode = 'BOTH';
  }

  function getPlayerPercent(player: Player): number {
    if (store.match.elapsed > 0) {
      return Math.min(100, Math.round((player.feldzeit / store.match.elapsed) * 100));
    }
    const total = player.feldzeit + player.bankzeit;
    if (total > 0) {
      return Math.min(100, Math.round((player.feldzeit / total) * 100));
    }
    return 0;
  }

  const fieldPlayers = $derived(store.players.filter(p => p.status === 'FIELD'));
  const benchPlayers = $derived(
    store.players.filter(p => p.status !== 'FIELD').sort((a, b) => a.name.localeCompare(b.name))
  );

  function handleBringToField(playerId: string) {
    const player = store.players.find(p => p.id === playerId);
    if (!player) return;
    if (fieldPlayers.length >= maxFieldCount) return;
    store.dragPlayer(playerId, 'FIELD', null);
  }

  function handleMoveToBench(playerId: string) {
    store.removePlayerFromField(playerId);
  }
</script>

<div class="relative w-full h-full bg-white text-[#161616] flex flex-col overflow-hidden pb-11 select-none">
  
  <!-- Match Control Ribbon with Timer, Play/Pause, Reset & Fullscreen -->
  <div class="bg-white border-b border-[#e0e0e0] px-3 h-10 flex items-center justify-between shrink-0 z-20">
    <!-- Timer & Play/Pause -->
    <div class="flex items-center space-x-2.5">
      <div class="flex items-center space-x-1.5">
        <div class="w-2 h-2 {store.match.status === 'RUNNING' ? 'bg-[#24a148] animate-pulse' : store.match.status === 'PAUSED' ? 'bg-[#f1c21b]' : 'bg-[#8c8c8c]'}"></div>
        <span class="text-lg font-light font-mono text-[#161616] tabular-nums tracking-tight">
          {formatTime(store.match.elapsed)}
        </span>
      </div>

      <button
        type="button"
        onclick={() => store.setMatchStatus(store.match.status === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
        class="h-6 px-2.5 text-xs font-medium rounded-none transition-colors flex items-center {store.match.status === 'RUNNING' ? 'bg-[#161616] text-white hover:bg-[#262626]' : 'bg-[#0f62fe] text-white hover:bg-[#0043ce]'}"
      >
        {#if store.match.status === 'RUNNING'}
          <Pause size={11} class="mr-1 fill-current" />
          <span>Pause</span>
        {:else}
          <Play size={11} class="mr-1 fill-current" />
          <span>Start</span>
        {/if}
      </button>
    </div>

    <!-- Right: Reset Button & Fullscreen Button -->
    <div class="flex items-center space-x-2">
      {#if store.match.elapsed > 0}
        <button 
          type="button"
          onclick={store.resetMatch} 
          title="Spielzeit zurücksetzen"
          class="h-6 px-2 border border-[#e0e0e0] bg-[#f4f4f4] hover:bg-[#e0e0e0] text-[#525252] hover:text-[#da1e28] flex items-center space-x-1 text-xs transition-colors"
        >
          <RotateCcw size={11} />
          <span class="text-[10px] font-medium">Reset</span>
        </button>
      {/if}
      <FullscreenButton class="h-6 px-2" />
    </div>
  </div>

  <!-- Main Condensed List Area -->
  <div class="flex-1 overflow-y-auto">
    <!-- Aufstellung Category Header -->
    <div class="h-6 bg-[#f4f4f4] border-b border-[#e0e0e0] px-3 flex items-center justify-between text-[11px] font-semibold text-[#525252] uppercase tracking-[0.32px] sticky top-0 z-10">
      <div class="flex items-center space-x-1.5">
        <Shirt size={12} class="text-[#0f62fe]" />
        <span>Aufstellung</span>
        <span class="font-mono text-[10px] text-[#161616] font-bold">
          ({fieldPlayers.length}/{maxFieldCount})
        </span>
      </div>
      <span class="text-[10px] font-normal text-[#8c8c8c]">Auf dem Platz</span>
    </div>

    <!-- Field Players Rows -->
    <div class="divide-y divide-[#e0e0e0] bg-white">
      {#each fieldPlayers as player (player.id)}
        {@const avatar = getPlayerAvatar(player.name, player.avatar)}
        
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          onclick={toggleTimeMode}
          class="h-10 px-3 flex items-center justify-between transition-colors cursor-pointer select-none hover:bg-[#f4f4f4] active:bg-[#e0e0e0]"
        >
          <!-- Left: Avatar + Name -->
          <div class="flex items-center min-w-0 mr-2 flex-1">
            <div class="w-6 h-6 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-medium text-[#161616]">
              {#if avatar}
                <img src={avatar} alt={player.name} class="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {:else}
                {player.name.substring(0, 2).toUpperCase()}
              {/if}
            </div>

            <span class="text-xs font-semibold text-[#161616] truncate ml-2.5">
              {player.name}
            </span>
          </div>

          <!-- Right: Live Playtime / Percent + Direct + Bank button -->
          <div class="flex items-center space-x-2 shrink-0">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
              onclick={(e) => {
                e.stopPropagation();
                toggleTimeMode();
              }}
              title="Klicken zum Umschalten: m:s / % / beides"
              class="flex items-center space-x-2 font-mono text-xs cursor-pointer hover:opacity-75 transition-opacity"
            >
              {#if timeDisplayMode !== 'PERCENT'}
                <span class="text-[#161616] font-medium">
                  {formatTime(player.feldzeit)}
                </span>
              {/if}
              {#if timeDisplayMode !== 'TIME'}
                <span class="text-[#0f62fe] font-bold">
                  {getPlayerPercent(player)}%
                </span>
              {/if}
            </div>

            <button 
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                handleMoveToBench(player.id);
              }}
              title="Auf die Bank setzen"
              class="px-2 py-0.5 text-[11px] font-medium text-[#525252] hover:text-[#161616] hover:bg-[#e0e0e0] border border-[#c6c6c6] transition-colors"
            >
              + Bank
            </button>
          </div>
        </div>
      {/each}

      {#if fieldPlayers.length === 0}
        <div class="py-4 text-center text-xs text-[#8c8c8c] italic">
          Keine Spieler auf dem Platz. Klicke bei einem Bankspieler auf "+ Feld".
        </div>
      {/if}
    </div>

    <!-- Ersatzbank Category Header -->
    <div class="h-6 bg-[#f4f4f4] border-y border-[#e0e0e0] px-3 flex items-center justify-between text-[11px] font-semibold text-[#525252] uppercase tracking-[0.32px] sticky top-0 z-10 mt-1">
      <div class="flex items-center space-x-1.5">
        <Armchair size={12} class="text-[#525252]" />
        <span>Ersatzbank</span>
        <span class="font-mono text-[10px] text-[#161616] font-bold">
          ({benchPlayers.length})
        </span>
      </div>
      <span class="text-[10px] font-normal text-[#8c8c8c]">Verfügbar</span>
    </div>

    <!-- Bench Players Rows -->
    <div class="divide-y divide-[#e0e0e0] bg-white">
      {#each benchPlayers as player (player.id)}
        {@const avatar = getPlayerAvatar(player.name, player.avatar)}

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          onclick={() => handleBringToField(player.id)}
          class="h-9 px-3 flex items-center justify-between bg-white hover:bg-[#f4f4f4] transition-colors cursor-pointer select-none"
        >
          <div class="flex items-center min-w-0 mr-2 flex-1">
            <div class="w-5 h-5 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 flex items-center justify-center text-[9px] font-medium text-[#525252]">
              {#if avatar}
                <img src={avatar} alt={player.name} class="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {:else}
                {player.name.substring(0, 2).toUpperCase()}
              {/if}
            </div>

            <span class="text-xs text-[#161616] font-medium truncate ml-2.5">
              {player.name}
            </span>
          </div>

          <div class="flex items-center space-x-2 shrink-0">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
              onclick={(e) => {
                e.stopPropagation();
                toggleTimeMode();
              }}
              title="Klicken zum Umschalten: m:s / % / beides"
              class="flex items-center space-x-2 font-mono text-xs cursor-pointer hover:opacity-75 transition-opacity"
            >
              {#if timeDisplayMode !== 'PERCENT'}
                <span class="text-[#8c8c8c]">
                  {formatTime(player.feldzeit)}
                </span>
              {/if}
              {#if timeDisplayMode !== 'TIME'}
                <span class="text-[#525252] font-semibold">
                  {getPlayerPercent(player)}%
                </span>
              {/if}
            </div>

            <button 
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                handleBringToField(player.id);
              }}
              title="Aufs Feld bringen"
              class="px-2 py-0.5 text-[11px] font-medium text-[#0f62fe] hover:bg-[#0f62fe]/10 border border-[#0f62fe]/40 transition-colors"
            >
              + Feld
            </button>
          </div>
        </div>
      {/each}
      
      {#if benchPlayers.length === 0}
        <div class="py-3 text-center text-xs text-[#8c8c8c] italic">
          Keine Spieler auf der Bank
        </div>
      {/if}
    </div>
  </div>

  <!-- Bottom Summary Bar (Carbon condensed 24px) -->
  <div class="bg-[#f4f4f4] border-t border-[#e0e0e0] px-3 h-6 flex items-center justify-between text-[11px] text-[#525252] shrink-0">
    <div>
      Aufgestellt: <strong class="text-[#161616] font-mono">{fieldPlayers.length}/{maxFieldCount}</strong>
    </div>
    <div class="flex items-center space-x-3 text-[11px]">
      <span>Bank: <strong className="text-[#161616] font-mono">{benchPlayers.length}</strong></span>
    </div>
  </div>

</div>
