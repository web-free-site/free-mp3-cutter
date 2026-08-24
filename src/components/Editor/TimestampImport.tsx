import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { parseTimestampRanges } from '../../utils/parseTimestamps';

interface TimestampImportProps {
  onImport: (text: string) => void;
  disabled?: boolean;
}

export const TimestampImport: React.FC<TimestampImportProps> = ({ onImport, disabled }) => {
  const [text, setText] = useState('');
  const previewCount = parseTimestampRanges(text).length;

  const handleImport = () => {
    if (previewCount === 0) return;
    onImport(text);
    setText('');
  };

  return (
    <details className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
      <summary className="cursor-pointer select-none px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60">
        <ClipboardList className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Paste Timestamps
      </summary>
      <div className="p-5 space-y-3">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          One range per line, e.g. <code className="font-mono">3.16-5:14</code>. Extra text on the line (chat
          names, dates) is ignored.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          disabled={disabled}
          placeholder={'3.16-5:14\n8.02-8.55\n12.08-13.18'}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {disabled
              ? 'Finish editing the clip below to import more'
              : previewCount > 0
                ? `${previewCount} range${previewCount === 1 ? '' : 's'} detected`
                : 'No ranges detected yet'}
          </span>
          <button
            onClick={handleImport}
            disabled={previewCount === 0 || disabled}
            className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20 px-3.5 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/30 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Import {previewCount > 0 ? `${previewCount} Clip${previewCount === 1 ? '' : 's'}` : 'Clips'}
          </button>
        </div>
      </div>
    </details>
  );
};
