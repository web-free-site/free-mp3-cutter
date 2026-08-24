import React from 'react';
import { Check, Play, Pause, Scissors, SplitSquareHorizontal, X, XCircle, ZoomIn } from 'lucide-react';
import { MAX_GAIN_DB, MIN_GAIN_DB } from '../../utils/constants';
import { parseTimeOrRangeInput } from '../../utils/parseTimestamps';
import { formatMinutesSeconds, formatPreciseTime } from '../../utils/formatters';
import { SeekSteps } from './SeekSteps';

interface EditorToolbarProps {
  currentTimeSec: number;
  durationSec: number;
  isPlaying: boolean;
  region: { start: number; end: number } | null;
  gainDb: number;
  zoomPxPerSec: number;
  minZoomPxPerSec?: number;
  onTogglePlay: () => void;
  onStep: (deltaSec: number) => void;
  onRegionStartChange: (sec: number) => void;
  onRegionEndChange: (sec: number) => void;
  onRegionRangeChange: (start: number, end: number) => void;
  onClearRegion: () => void;
  onGainChange: (db: number) => void;
  onZoomChange: (pxPerSec: number) => void;
  onExtractSelection: () => void;
  onDeleteSelection: () => void;
  onSplitAtPlayhead: () => void;
  editingClipLabel?: string | null;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  currentTimeSec,
  durationSec,
  isPlaying,
  region,
  gainDb,
  zoomPxPerSec,
  minZoomPxPerSec = 10,
  onTogglePlay,
  onStep,
  onRegionStartChange,
  onRegionEndChange,
  onRegionRangeChange,
  onClearRegion,
  onGainChange,
  onZoomChange,
  onExtractSelection,
  onDeleteSelection,
  onSplitAtPlayhead,
  editingClipLabel,
  onSaveEdit,
  onCancelEdit,
}) => {
  const handleTimeInput = (raw: string, apply: (sec: number) => void) => {
    const result = parseTimeOrRangeInput(raw);
    if (!result) return;

    if (result.kind === 'range') {
      onRegionRangeChange(result.startSec, result.endSec);
      return;
    }

    apply(Math.min(durationSec, Math.max(0, result.sec)));
  };

  return (
    <div className="space-y-5">
      {editingClipLabel && (
        <div className="bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 font-medium">
          Editing <span className="font-mono">{editingClipLabel}</span> — adjust the selection below, then Save or Cancel.
        </div>
      )}

      {/* Transport row */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center hover:bg-slate-800 dark:hover:bg-indigo-500 transition cursor-pointer shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <span className="font-mono text-sm text-slate-600 dark:text-slate-300 tabular-nums">
          {formatMinutesSeconds(currentTimeSec)} / {formatMinutesSeconds(durationSec)}
        </span>

        <SeekSteps onStep={onStep} />

        <div className="flex items-center gap-2 sm:ml-auto">
          <ZoomIn className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="range"
            min={minZoomPxPerSec}
            max={Math.max(300, minZoomPxPerSec)}
            value={zoomPxPerSec}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-24 sm:w-28 accent-indigo-600"
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-3">
        Shortcuts: <kbd className="font-mono">Space</kbd> play/pause · <kbd className="font-mono">←/→</kbd> step
        0.1s · <kbd className="font-mono">Shift</kbd>+arrow 1s · <kbd className="font-mono">Alt</kbd>+arrow 10ms
      </p>

      {/* Selection start/end + gain */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">
            Start Point
          </label>
          <input
            type="text"
            disabled={durationSec <= 0}
            defaultValue={region ? formatPreciseTime(region.start) : ''}
            key={`start-${region?.start ?? 'none'}`}
            onBlur={(e) => handleTimeInput(e.target.value, onRegionStartChange)}
            placeholder="mm:ss.mmm or mm.ss-mm.ss"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">
            End Point
          </label>
          <input
            type="text"
            disabled={durationSec <= 0}
            defaultValue={region ? formatPreciseTime(region.end) : ''}
            key={`end-${region?.end ?? 'none'}`}
            onBlur={(e) => handleTimeInput(e.target.value, onRegionEndChange)}
            placeholder="mm:ss.mmm or mm.ss-mm.ss"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">
            Gain ({gainDb > 0 ? '+' : ''}{gainDb} dB)
          </label>
          <input
            type="range"
            min={MIN_GAIN_DB}
            max={MAX_GAIN_DB}
            value={gainDb}
            onChange={(e) => onGainChange(Number(e.target.value))}
            className="w-full accent-indigo-600 mt-2.5"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {editingClipLabel ? (
          <>
            <button
              onClick={onSaveEdit}
              disabled={!region}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20 px-3.5 py-2 rounded-lg border border-emerald-100 dark:border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
            <button
              onClick={onCancelEdit}
              className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onExtractSelection}
              disabled={!region}
              className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20 px-3.5 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Scissors className="w-3.5 h-3.5" /> Extract Selection
            </button>

            <button
              onClick={onDeleteSelection}
              disabled={!region}
              className="text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100/80 dark:hover:bg-rose-500/20 px-3.5 py-2 rounded-lg border border-rose-100 dark:border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <XCircle className="w-3.5 h-3.5" /> Delete Selection
            </button>

            <button
              onClick={onSplitAtPlayhead}
              className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5" /> Split at Playhead
            </button>
          </>
        )}

        {region && (
          <button
            onClick={onClearRegion}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3.5 py-2 rounded-lg transition cursor-pointer ml-auto"
          >
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );
};
