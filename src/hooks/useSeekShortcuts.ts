import { useEffect } from 'react';
import { COARSE_STEP_SEC, DEFAULT_STEP_SEC, FINE_STEP_SEC } from '../utils/constants';

/**
 * Space = play/pause, Left/Right = step, Shift+arrow = coarse step, Alt+arrow = fine ("frame") step.
 * Ignored while an input/textarea has focus so it doesn't hijack typing or native slider arrow-key behavior.
 */
export function useSeekShortcuts(onTogglePlay: () => void, onStep: (deltaSec: number) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
        return;
      }

      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        const direction = e.code === 'ArrowRight' ? 1 : -1;
        const magnitude = e.shiftKey ? COARSE_STEP_SEC : e.altKey ? FINE_STEP_SEC : DEFAULT_STEP_SEC;
        onStep(direction * magnitude);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onStep]);
}
