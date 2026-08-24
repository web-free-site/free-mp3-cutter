import React from 'react';
import { ProcessingProgressState } from '../types';
import { Loader2, Cpu, AlertCircle, HardDrive } from 'lucide-react';

interface ProcessingProgressProps {
  state: ProcessingProgressState;
  filename: string;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ state, filename }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Processing Audio Chunks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
              {filename}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            {state.progressPercent}%
          </span>
          <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Chunk {state.currentChunkIndex} of {state.totalChunks}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            style={{ width: `${Math.max(3, state.progressPercent)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
          <span className="flex items-center gap-1.5 italic">
            <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 not-italic" />
            {state.statusMessage}
          </span>
          <span className="text-slate-400 dark:text-slate-500">{state.progressPercent}% Complete</span>
        </div>
      </div>

      {/* Live Log Window */}
      <div className="border border-slate-800 rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-300 space-y-1 max-h-96 overflow-y-auto">
        <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-2 font-sans font-bold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5" /> Client Engine Activity Logs
        </div>
        {state.logs.map((log, index) => (
          <div key={index} className="leading-relaxed flex items-start gap-2">
            <span className="text-slate-600 shrink-0">&gt;</span>
            <span className={log.includes('Failed') || log.includes('Error') ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
              {log}
            </span>
          </div>
        ))}
      </div>

      {state.errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/30 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Processing Failure</p>
            <p className="mt-1 leading-relaxed text-rose-700 dark:text-rose-300/90">{state.errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
