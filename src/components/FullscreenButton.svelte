<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Maximize2, Minimize2 } from 'lucide-svelte';

  let { class: className = '', showLabel = false }: { class?: string; showLabel?: boolean } = $props();

  let isFullscreen = $state(false);

  function checkFullscreen() {
    isFullscreen = Boolean(
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
    );
  }

  onMount(() => {
    checkFullscreen();
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('MSFullscreenChange', checkFullscreen);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('MSFullscreenChange', checkFullscreen);
    }
  });

  async function toggleFullscreen() {
    try {
      const doc = document as any;
      const elem = document.documentElement as any;

      const currentlyFullscreen = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement
      );

      if (!currentlyFullscreen) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch {
      // ignore
    }
  }
</script>

<button
  id="fullscreen-toggle-btn"
  type="button"
  onclick={toggleFullscreen}
  title={isFullscreen ? "Vollbild beenden" : "Vollbildmodus aktivieren"}
  aria-label={isFullscreen ? "Vollbild beenden" : "Vollbildmodus aktivieren"}
  class="h-7 px-2 bg-white hover:bg-[#e0e0e0] active:bg-[#c6c6c6] text-[#161616] border border-[#e0e0e0] flex items-center justify-center space-x-1 text-xs font-medium rounded-none transition-colors shrink-0 {className}"
>
  {#if isFullscreen}
    <Minimize2 size={13} class="text-[#0f62fe]" />
  {:else}
    <Maximize2 size={13} class="text-[#525252]" />
  {/if}
  {#if showLabel}
    <span class="hidden sm:inline text-xs font-medium">
      {isFullscreen ? 'Beenden' : 'Vollbild'}
    </span>
  {/if}
</button>
