import React from 'react';
import { EditorClip } from '../../types';
import { formatHumanDuration, formatTimestampRange } from '../../utils/formatters';
import { ArrowDown, ArrowUp, Layers, Link2, Pause, Pencil, Play, Trash2, Undo2 } from 'lucide-react';
import { MAX_GAIN_DB, MIN_GAIN_DB } from '../../utils/constants';

interface ClipListProps {
  clips: EditorClip[];
  joinIntoOne: boolean;
  onJoinToggle: (join: boolean) => void;
  onRemoveClip: (id: string) => void;
  onMoveClip: (id: string, direction: 'up' | 'down') => void;
  onClipGainChange: (id: string, gainDb: number) => void;
  onPreviewClip: (clip: EditorClip) => void;
  onEditClip: (clip: EditorClip) => void;
  previewingClipId: string | null;
  editingClipId: string | null;
  onUndo: () => void;
  canUndo: boolean;
  onExport: () => void;
  isExporting: boolean;
}

export const ClipList: React.FC<ClipListProps> = ({
  clips,
  joinIntoOne,
  onJoinToggle,
  onRemoveClip,
  onMoveClip,
  onClipGainChange,
  onPreviewClip,
  onEditClip,
  previewingClipId,
  editingClipId,
  onUndo,
  canUndo,
  onExport,
  isExporting,
}) => {
  if (clips.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
        <p>No clips yet. Drag a selection on the waveform, then use Extract, Delete, or Split to build your clip list.</p>
        {canUndo && (
          <button
            onClick={onUndo}
            className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo last change
          </button>
        )}
      </div>
    );
  }

  const listDisabled = editingClipId !== null;

  return (
    <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      <div className="bg-slate-50 dark:bg-slate-800/60 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Clip List
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo || listDisabled}
            title="Undo last change"
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
          <span className="bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[11px] text-slate-700 dark:text-slate-200">
            {clips.length} clip{clips.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        {clips.map((clip, index) => {
          const isPreviewing = previewingClipId === clip.id;
          const isEditing = editingClipId === clip.id;

          return (
            <div
              key={clip.id}
              className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 transition ${
                isEditing ? 'bg-amber-50/60 dark:bg-amber-500/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center text-[11px] shrink-0">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-slate-800 dark:text-slate-200 font-medium truncate">
                    {clip.label} {isEditing && <span className="text-amber-600 dark:text-amber-400">(editing)</span>}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {formatTimestampRange(clip.startSec, clip.endSec - clip.startSec)} • {formatHumanDuration(clip.endSec - clip.startSec)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <input
                  type="range"
                  min={MIN_GAIN_DB}
                  max={MAX_GAIN_DB}
                  value={clip.gainDb}
                  disabled={listDisabled}
                  onChange={(e) => onClipGainChange(clip.id, Number(e.target.value))}
                  className="w-20 accent-indigo-600 disabled:opacity-40"
                />
                <span className="font-mono text-slate-500 dark:text-slate-400 w-12 text-right">
                  {clip.gainDb > 0 ? '+' : ''}{clip.gainDb}dB
                </span>

                <button
                  onClick={() => onPreviewClip(clip)}
                  disabled={listDisabled && !isEditing}
                  title="Play this clip"
                  className="w-6 h-6 rounded-md flex items-center justify-center text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-30 cursor-pointer"
                >
                  {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => onEditClip(clip)}
                  disabled={listDisabled}
                  title="Re-trim this clip on the graph"
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onMoveClip(clip.id, 'up')}
                  disabled={listDisabled || index === 0}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onMoveClip(clip.id, 'down')}
                  disabled={listDisabled || index === clips.length - 1}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRemoveClip(clip.id)}
                  disabled={listDisabled}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-4 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={joinIntoOne}
            onChange={(e) => onJoinToggle(e.target.checked)}
            disabled={clips.length < 2 || listDisabled}
            className="accent-indigo-600 w-3.5 h-3.5"
          />
          <Link2 className="w-3.5 h-3.5" /> Join clips into one file
        </label>

        <button
          onClick={onExport}
          disabled={isExporting || listDisabled}
          className="bg-slate-900 dark:bg-indigo-600 text-white font-medium py-2.5 px-5 rounded-xl shadow-md hover:bg-slate-800 dark:hover:bg-indigo-500 transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export {joinIntoOne && clips.length > 1 ? 'Joined File' : `${clips.length} File${clips.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
};
