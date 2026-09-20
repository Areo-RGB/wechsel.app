<script lang="ts">
  import { store } from '../store.svelte';
  import { formatTime } from '../lib/utils';
  import { getPlayerAvatar } from '../lib/avatars';
  import FullscreenButton from './FullscreenButton.svelte';

  const stats = $derived.by(() => {
    return store.players
      .filter(p => p.feldzeit > 0 || p.bankzeit > 0)
      .map(p => {
        const total = p.feldzeit + p.bankzeit;
        const percent = total > 0 ? (p.feldzeit / total) * 100 : 0;
        return { ...p, total, percent };
      })
      .sort((a, b) => b.percent - a.percent);
  });
</script>

<div class="overflow-y-auto pb-16 h-full bg-white text-[#161616] flex flex-col select-none">
  <!-- Condensed Header -->
  <div class="h-9 px-3 bg-[#f4f4f4] border-b border-[#e0e0e0] flex items-center justify-between shrink-0">
    <h2 class="text-xs font-semibold uppercase tracking-[0.32px] text-[#525252]">
      Spieldaten & Einsatzzeiten
    </h2>
    <div class="flex items-center space-x-2">
      <span class="font-mono text-xs text-[#161616] font-bold">
        {stats.length} Spieler
      </span>
      <FullscreenButton />
    </div>
  </div>

  <div class="flex-1 overflow-auto">
    <table class="w-full text-xs border-collapse">
      <thead class="bg-[#f4f4f4] sticky top-0 z-10 border-b border-[#e0e0e0]">
        <tr class="h-7">
          <th class="text-left text-[#525252] font-semibold text-[10px] uppercase tracking-[0.32px] px-3">Name</th>
          <th class="text-right text-[#525252] font-semibold text-[10px] uppercase tracking-[0.32px] px-2">Spielzeit</th>
          <th class="text-right text-[#525252] font-semibold text-[10px] uppercase tracking-[0.32px] px-2">Anteil</th>
          <th class="text-right text-[#525252] font-semibold text-[10px] uppercase tracking-[0.32px] px-3">Gesamt</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#e0e0e0]">
        {#each stats as p (p.id)}
          {@const avatar = getPlayerAvatar(p.name, p.avatar)}
          <tr class="hover:bg-[#f4f4f4] transition-colors h-9">
            <td class="font-medium py-1.5 px-3">
              <div class="flex items-center space-x-2">
                <div class="w-5 h-5 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden flex items-center justify-center text-[9px] font-semibold text-[#161616] shrink-0">
                  {#if avatar}
                    <img src={avatar} alt={p.name} class="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {:else}
                    {p.name.substring(0, 2).toUpperCase()}
                  {/if}
                </div>
                <span class="truncate max-w-[130px]">{p.name}</span>
              </div>
            </td>
            <td class="text-right font-mono text-xs text-[#161616] px-2">{formatTime(p.feldzeit)}</td>
            <td class="text-right font-mono text-xs text-[#0f62fe] font-bold px-2">{Math.round(p.percent)}%</td>
            <td class="text-right font-mono text-xs text-[#8c8c8c] px-3">{formatTime(p.total)}</td>
          </tr>
        {/each}
        {#if stats.length === 0}
          <tr>
            <td colspan="4" class="h-28 text-center text-[#8c8c8c] text-xs">
              Noch keine Spieldaten vorhanden
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
