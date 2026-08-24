import React, { useState } from 'react';
import { Check, ClipboardCopy, ListChecks, Pause, Play, Trash2 } from 'lucide-react';
import { TimestampMark } from '../../types';
import { formatHumanDuration, formatPreciseTime } from '../../utils/formatters';

interface MarkListProps {
  marks: TimestampMark[];
  onRemoveMark: (id: string) => void;
  onPreviewMark: (mark: TimestampMark) => void;
  previewingMarkId: string | null;
}

export const MarkList: React.FC<MarkListProps> = ({ marks, onRemoveMark, onPreviewMark, previewingMarkId }) => {
  const [copied, setCopied] = useState(false);

  const outputText = marks.map((m) => `${formatPreciseTime(m.startSec)}-${formatPreciseTime(m.endSec)}`).join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — the textarea below is the fallback, user can select-all manually
    }
  };

  if (marks.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 dark:text-slate-500">
        No timestamps marked yet. Play the song, pause on the exact beat, then use Mark Start / Mark End below.
      </div>
    );
  }

  return (
    <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      <div className="bg-slate-50 dark:bg-slate-800/60 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <ListChecks className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Marked Timestamps
        </span>
        <span className="bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[11px] text-slate-700 dark:text-slate-200">
          {marks.length} mark{marks.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        {marks.map((mark, index) => {
          const isPreviewing = previewingMarkId === mark.id;
          return (
            <div key={mark.id} className="px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center text-[11px] shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                  {formatPreciseTime(mark.startSec)} - {formatPreciseTime(mark.endSec)}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{formatHumanDuration(mark.endSec - mark.startSec)}</p>
              </div>
              <button
                onClick={() => onPreviewMark(mark)}
                title="Play this range"
                className="w-6 h-6 rounded-md flex items-center justify-center text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
              >
                {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onRemoveMark(mark.id)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
          Copy into Manual Editor's Paste Timestamps box
        </p>
        <textarea
          readOnly
          value={outputText}
          rows={Math.min(6, marks.length)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 px-3 py-2"
        />
        <button
          onClick={handleCopy}
          className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20 px-3.5 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy All Timestamps'}
        </button>
      </div>
    </div>
  );
};
