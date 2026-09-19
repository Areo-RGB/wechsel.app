import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface FullscreenButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function FullscreenButton({ className, showLabel = false }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(Boolean(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
        (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
      ));
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('MSFullscreenChange', checkFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('MSFullscreenChange', checkFullscreen);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      const doc = document as unknown as {
        fullscreenElement?: Element;
        webkitFullscreenElement?: Element;
        exitFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
      };

      const elem = document.documentElement as unknown as {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

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
      toast.info('Vollbild in neuem Tab öffnen', {
        description: 'Vollbildmodus wird in der eingebetteten iFrame-Vorschau blockiert. Öffne die App im separaten Tab für echtes Vollbild.'
      });
    }
  };

  return (
    <button
      id="fullscreen-toggle-btn"
      type="button"
      onClick={toggleFullscreen}
      title={isFullscreen ? "Vollbild beenden" : "Vollbildmodus aktivieren"}
      aria-label={isFullscreen ? "Vollbild beenden" : "Vollbildmodus aktivieren"}
      className={cn(
        "h-7 px-2 bg-white hover:bg-[#e0e0e0] active:bg-[#c6c6c6] text-[#161616] border border-[#e0e0e0] flex items-center justify-center space-x-1 text-xs font-medium rounded-none transition-colors shrink-0",
        className
      )}
    >
      {isFullscreen ? (
        <Minimize2 size={13} className="text-[#0f62fe]" />
      ) : (
        <Maximize2 size={13} className="text-[#525252]" />
      )}
      {showLabel && (
        <span className="hidden sm:inline text-xs font-medium">
          {isFullscreen ? 'Beenden' : 'Vollbild'}
        </span>
      )}
    </button>
  );
}
