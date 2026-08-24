import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, { Region } from 'wavesurfer.js/plugins/regions';

export interface WaveformRegion {
  start: number;
  end: number;
}

export interface WaveformHandle {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (sec: number) => void;
  setRegionTimes: (start: number, end: number) => void;
  clearRegion: () => void;
  setVolume: (linear: number) => void;
  setZoom: (pxPerSec: number) => void;
}

interface WaveformProps {
  file: File;
  onReady?: (durationSec: number, fitPxPerSec: number) => void;
  onTimeUpdate?: (currentSec: number) => void;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  onRegionChange?: (region: WaveformRegion | null) => void;
}

const REGION_COLOR = 'rgba(99, 102, 241, 0.25)';

export const Waveform = forwardRef<WaveformHandle, WaveformProps>(
  ({ file, onReady, onTimeUpdate, onPlayPauseChange, onRegionChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const regionsRef = useRef<RegionsPlugin | null>(null);
    const activeRegionRef = useRef<Region | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const isDark = document.documentElement.classList.contains('dark');
      const objectUrl = URL.createObjectURL(file);
      const regions = RegionsPlugin.create();

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: isDark ? '#475569' : '#cbd5e1',
        progressColor: isDark ? '#818cf8' : '#6366f1',
        cursorColor: isDark ? '#e2e8f0' : '#1e293b',
        height: 120,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        url: objectUrl,
        plugins: [regions],
      });

      wavesurferRef.current = ws;
      regionsRef.current = regions;

      const disableDragSelection = regions.enableDragSelection({ color: REGION_COLOR });

      const clearOtherRegions = (keepId: string) => {
        regions.getRegions().forEach((r) => {
          if (r.id !== keepId) r.remove();
        });
      };

      ws.on('ready', (duration) => {
        // Measure wavesurfer's own scroll element (inside its shadow root), not our
        // padded container — its available width is narrower than containerRef's.
        const scrollEl = containerRef.current?.firstElementChild as HTMLElement | undefined;
        const innerWidth = scrollEl?.shadowRoot?.querySelector('.scroll')?.clientWidth ?? containerRef.current?.clientWidth ?? 0;
        const fitPxPerSec = duration > 0 && innerWidth > 0 ? innerWidth / duration : 10;
        onReady?.(duration, fitPxPerSec);
      });
      ws.on('timeupdate', (currentTime) => onTimeUpdate?.(currentTime));
      // 'timeupdate' doesn't reliably fire for a paused programmatic/click seek — 'seeking' covers that gap.
      ws.on('seeking', (currentTime) => onTimeUpdate?.(currentTime));
      ws.on('play', () => onPlayPauseChange?.(true));
      ws.on('pause', () => onPlayPauseChange?.(false));

      regions.on('region-created', (region) => {
        clearOtherRegions(region.id);
        activeRegionRef.current = region;
        onRegionChange?.({ start: region.start, end: region.end });
      });

      regions.on('region-updated', (region) => {
        activeRegionRef.current = region;
        onRegionChange?.({ start: region.start, end: region.end });
      });

      regions.on('region-removed', (region) => {
        if (activeRegionRef.current?.id === region.id) {
          activeRegionRef.current = null;
          onRegionChange?.(null);
        }
      });

      return () => {
        disableDragSelection();
        ws.destroy();
        URL.revokeObjectURL(objectUrl);
        wavesurferRef.current = null;
        regionsRef.current = null;
        activeRegionRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    useImperativeHandle(ref, () => ({
      play: () => wavesurferRef.current?.play(),
      pause: () => wavesurferRef.current?.pause(),
      togglePlayPause: () => wavesurferRef.current?.playPause(),
      seekTo: (sec) => {
        const ws = wavesurferRef.current;
        const duration = ws?.getDuration() ?? 0;
        if (ws && duration > 0) ws.seekTo(Math.min(1, Math.max(0, sec / duration)));
      },
      setRegionTimes: (start, end) => {
        const regions = regionsRef.current;
        if (!regions) return;
        if (activeRegionRef.current) {
          activeRegionRef.current.setOptions({ start, end });
        } else {
          activeRegionRef.current = regions.addRegion({ start, end, color: REGION_COLOR });
        }
        onRegionChange?.({ start, end });
      },
      clearRegion: () => {
        activeRegionRef.current?.remove();
        activeRegionRef.current = null;
        onRegionChange?.(null);
      },
      setVolume: (linear) => wavesurferRef.current?.setVolume(Math.min(1, Math.max(0, linear))),
      setZoom: (pxPerSec) => wavesurferRef.current?.zoom(pxPerSec),
    }));

    return (
      <div
        ref={containerRef}
        className="waveform-host w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3"
      />
    );
  }
);

Waveform.displayName = 'Waveform';
