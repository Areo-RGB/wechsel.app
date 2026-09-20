<script lang="ts">
  import { store } from '../store.svelte';
  import { getPlayerAvatar } from '../lib/avatars';
  import { 
    Users, 
    UserPlus, 
    Trash2,
    Shirt,
    CircleSlash,
    ArrowRight,
    X
  } from 'lucide-svelte';
  import FullscreenButton from './FullscreenButton.svelte';

  let searchQuery = $state('');
  let isAddDialogOpen = $state(false);
  let newPlayerName = $state('');
  let playerToDelete = $state<{ id: string; name: string } | null>(null);

  const fieldPlayers = $derived(store.players.filter(p => p.status === 'FIELD'));
  const benchPlayers = $derived(store.players.filter(p => p.status !== 'FIELD'));
  const maxFieldCount = $derived(store.positions?.length || 8);

  const filteredPlayers = $derived.by(() => {
    return store.players
      .filter(p => {
        if (!searchQuery.trim()) return true;
        return p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      })
      .sort((a, b) => {
        const aField = a.status === 'FIELD';
        const bField = b.status === 'FIELD';
        if (aField !== bField) return aField ? -1 : 1;
        return a.name.localeCompare(b.name, 'de');
      });
  });

  function handleAddPlayerSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (newPlayerName.trim()) {
      store.addPlayer(newPlayerName.trim());
      newPlayerName = '';
      isAddDialogOpen = false;
    }
  }

  function handleConfirmDelete() {
    if (playerToDelete) {
      store.deletePlayer(playerToDelete.id);
      playerToDelete = null;
    }
  }
</script>

<div class="flex flex-col h-full bg-white text-[#161616] pb-20 overflow-y-auto select-none">
  <!-- Top Section: Tab Bar (Kader, Nummern) - 36px condensed -->
  <div class="bg-[#f4f4f4] border-b border-[#e0e0e0] shrink-0">
    <div class="flex items-center justify-between px-3 h-9">
      <div class="flex items-center space-x-4">
        <button type="button" class="relative py-2 px-1 text-xs font-semibold text-[#161616] flex items-center space-x-1">
          <span>Kader</span>
          <div class="w-3.5 h-3.5 bg-[#da1e28] text-white text-[9px] flex items-center justify-center font-bold">!</div>
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f62fe]"></div>
        </button>
        <button type="button" class="py-2 px-1 text-xs font-normal text-[#525252] hover:text-[#161616] flex items-center space-x-1">
          <span>Nummern</span>
          <div class="w-3.5 h-3.5 bg-[#da1e28] text-white text-[9px] flex items-center justify-center font-bold">!</div>
        </button>
      </div>
      <FullscreenButton />
    </div>
  </div>

  <!-- Stats row - 28px condensed -->
  <div class="flex items-center justify-between px-3 h-7 border-b border-[#e0e0e0] bg-white sticky top-0 z-20 shrink-0">
    <div class="flex items-center space-x-3 text-xs">
      <div class="flex items-center space-x-1.5 text-[#525252]">
        <Shirt size={13} class="text-[#0f62fe]" />
        <span class="text-[11px] text-[#525252]">Aufgestellt:</span>
        <span class="font-mono text-xs font-semibold text-[#161616]">{fieldPlayers.length}/{maxFieldCount}</span>
      </div>
      <span class="text-[#e0e0e0]">|</span>
      <div class="flex items-center space-x-1.5 text-[#525252]">
        <span class="text-[11px] text-[#525252]">Nicht aufgestellt:</span>
        <span class="font-mono text-xs font-semibold text-[#161616]">{benchPlayers.length}</span>
      </div>
    </div>
    
    <button 
      type="button"
      onclick={() => isAddDialogOpen = true}
      class="text-xs text-[#0f62fe] hover:underline font-semibold flex items-center space-x-1"
    >
      <UserPlus size={12} />
      <span>+ Spieler</span>
    </button>
  </div>

  <!-- Players List -->
  <div class="flex-1">
    {#if filteredPlayers.length === 0}
      <div class="flex flex-col items-center justify-center py-12 text-center text-[#8c8c8c] space-y-1">
        <Users size={28} class="opacity-40" />
        <p class="text-xs">Keine Spieler vorhanden</p>
      </div>
    {:else}
      <div class="divide-y divide-[#e0e0e0]">
        {#each filteredPlayers as player (player.id)}
          {@const avatarUrl = getPlayerAvatar(player.name, player.avatar)}
          {@const isAufgestellt = player.status === 'FIELD'}

          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            onclick={() => store.cyclePlayerStatus(player.id)}
            class="flex items-center h-10 px-3 transition-colors cursor-pointer select-none hover:bg-[#f4f4f4] active:bg-[#e0e0e0]"
          >
            <!-- Left Column: Avatar + Name -->
            <div class="flex items-center flex-1 min-w-0 mr-3">
              <div class="w-6 h-6 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-medium transition-opacity {!isAufgestellt ? 'opacity-60' : 'text-[#161616]'}">
                {#if avatarUrl}
                  <img
                    src={avatarUrl}
                    alt={player.name}
                    class="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                {:else}
                  {player.name.substring(0, 2).toUpperCase()}
                {/if}
              </div>
              <div class="ml-2.5 min-w-0 flex items-center space-x-2">
                <p class="text-xs font-semibold truncate transition-colors {isAufgestellt ? 'text-[#161616]' : 'text-[#525252]'}">
                  {player.name}
                </p>
              </div>
            </div>

            <!-- Right Column: 2-State Toggle Option -->
            <div class="shrink-0 flex items-center space-x-1.5">
              <div
                class="w-36 h-7 flex items-center justify-center space-x-1.5 border text-xs font-mono transition-colors {isAufgestellt ? 'bg-[#0f62fe] border-[#0f62fe] text-white font-bold' : 'bg-[#f4f4f4] border-[#e0e0e0] text-[#525252] hover:border-[#8c8c8c]'}"
              >
                {#if isAufgestellt}
                  <Shirt size={12} strokeWidth={2} />
                  <span class="text-[10px] uppercase font-bold tracking-tight">Aufgestellt</span>
                {:else}
                  <CircleSlash size={11} strokeWidth={1.5} class="text-[#8c8c8c]" />
                  <span class="text-[10px] uppercase font-medium tracking-tight">Nicht aufgestellt</span>
                {/if}
              </div>

              <button
                type="button"
                onclick={(e) => {
                  e.stopPropagation();
                  playerToDelete = { id: player.id, name: player.name };
                }}
                title="Spieler löschen"
                class="w-6 h-6 flex items-center justify-center text-[#8c8c8c] hover:text-[#da1e28] transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Bottom Sticky CTA: Proceed to Lineup - 36px bar right above bottom nav -->
  <div class="fixed bottom-11 inset-x-0 h-9 px-3 bg-[#f4f4f4] border-t border-[#e0e0e0] flex items-center justify-between z-30">
    <div class="text-xs text-[#525252]">
      <strong class="text-[#161616] font-mono">{fieldPlayers.length}</strong> Spieler aufgestellt
    </div>
    <button
      type="button"
      onclick={() => store.setTab('AUFSTELLUNG')}
      class="bg-[#0f62fe] hover:bg-[#0043ce] text-white font-medium rounded-none px-3 h-7 text-xs flex items-center space-x-1.5 transition-colors"
    >
      <span>Zur Aufstellung</span>
      <ArrowRight size={13} />
    </button>
  </div>

  <!-- Add Player Dialog -->
  {#if isAddDialogOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white border border-[#e0e0e0] text-[#161616] rounded-none p-4 max-w-sm w-full shadow-2xl">
        <div class="flex items-center justify-between pb-2 border-b border-[#e0e0e0]">
          <h3 class="text-sm font-semibold text-[#161616] flex items-center space-x-2">
            <UserPlus size={16} class="text-[#0f62fe]" />
            <span>Neuen Spieler anlegen</span>
          </h3>
          <button 
            type="button"
            onclick={() => isAddDialogOpen = false}
            class="text-[#8c8c8c] hover:text-[#161616]"
          >
            <X size={16} />
          </button>
        </div>

        <form onsubmit={handleAddPlayerSubmit} class="space-y-3 pt-3">
          <div>
            <label for="player-name-input" class="block text-xs font-normal text-[#525252] mb-1">
              Name des Spielers
            </label>
            <input
              id="player-name-input"
              type="text"
              bind:value={newPlayerName}
              placeholder="z.B. Lukas oder Max Schmidt"
              class="w-full h-9 px-3 bg-[#f4f4f4] border border-[#e0e0e0] rounded-none text-[#161616] text-xs placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#0f62fe]"
            />
          </div>

          <div class="flex space-x-2 pt-2">
            <button
              type="button"
              onclick={() => isAddDialogOpen = false}
              class="flex-1 bg-white border border-[#e0e0e0] text-[#161616] hover:bg-[#f4f4f4] h-8 rounded-none text-xs font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!newPlayerName.trim()}
              class="flex-1 bg-[#0f62fe] hover:bg-[#0043ce] text-white font-medium h-8 rounded-none text-xs disabled:opacity-40"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Dialog -->
  {#if playerToDelete}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white border border-[#e0e0e0] text-[#161616] rounded-none p-4 max-w-sm w-full shadow-2xl">
        <div class="flex items-center justify-between pb-2 border-b border-[#e0e0e0]">
          <h3 class="text-sm font-semibold text-[#da1e28] flex items-center space-x-2">
            <Trash2 size={16} />
            <span>Spieler entfernen?</span>
          </h3>
          <button 
            type="button"
            onclick={() => playerToDelete = null}
            class="text-[#8c8c8c] hover:text-[#161616]"
          >
            <X size={16} />
          </button>
        </div>

        <p class="text-xs text-[#525252] pt-3">
          Möchtest du <strong class="text-[#161616] font-semibold">{playerToDelete.name}</strong> wirklich aus dem Kader entfernen?
        </p>

        <div class="flex space-x-2 pt-4">
          <button
            type="button"
            onclick={() => playerToDelete = null}
            class="flex-1 bg-white border border-[#e0e0e0] text-[#161616] hover:bg-[#f4f4f4] h-8 rounded-none text-xs font-medium"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onclick={handleConfirmDelete}
            class="flex-1 bg-[#da1e28] hover:bg-[#ba1b23] text-white font-medium h-8 rounded-none text-xs"
          >
            Entfernen
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
