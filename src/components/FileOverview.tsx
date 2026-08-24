import React from 'react';
import { AudioFileDetails } from '../types';
import { formatFileSize, formatHumanDuration } from '../utils/formatters';
import { calculateChunks } from '../utils/audioMetadata';
import { AlertTriangle, Layers, Download } from 'lucide-react';
import { WARN_FILE_SIZE_BYTES, MIN_CHUNK_MINUTES, MAX_CHUNK_MINUTES, CHUNK_PRESETS_MINUTES } from '../utils/constants';
import { FileHeaderBanner } from './FileHeaderBanner';

interface FileOverviewProps {
  fileDetails: AudioFileDetails;
  chunkDurationMinutes: number;
  onChunkDurationChange: (minutes: number) => void;
  onStartProcessing: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const FileOverview: React.FC<FileOverviewProps> = ({
  fileDetails,
  chunkDurationMinutes,
  onChunkDurationChange,
  onStartProcessing,
  onReset,
  isProcessing,
}) => {
  const calculation = calculateChunks(fileDetails.durationSeconds, chunkDurationMinutes);
  const isLargeFile = fileDetails.size > WARN_FILE_SIZE_BYTES;

  const handleCustomMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return;
    const clamped = Math.min(MAX_CHUNK_MINUTES, Math.max(MIN_CHUNK_MINUTES, raw));
    onChunkDurationChange(clamped);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      {/* File Banner Header */}
      <FileHeaderBanner fileDetails={fileDetails} onReset={onReset} disabled={isProcessing} />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Large File Memory Warning */}
        {isLargeFile && (
          <div className="p-4 bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 rounded-2xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Large File Notice ({formatFileSize(fileDetails.size)})</p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300/90 leading-relaxed">
                Processing occurs entirely inside your browser tab memory. Files over 1GB may take longer or require sufficient browser RAM.
              </p>
            </div>
          </div>
        )}

        {/* Chunk calculation & preview grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Audio Duration</span>
            <div className="text-2xl font-medium text-slate-800 dark:text-slate-100">
              {fileDetails.formattedDuration}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-2">Full audio length</span>
          </div>

          <div className="bg-indigo-50/40 dark:bg-indigo-500/10 border border-indigo-100/80 dark:border-indigo-500/20 rounded-xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between">
            <span className="block text-[10px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-bold mb-1">Expected Chunks</span>
            <div className="text-2xl font-medium text-indigo-900 dark:text-indigo-200 flex items-baseline gap-2">
              {calculation.totalChunks} <span className="text-sm font-normal text-indigo-600 dark:text-indigo-400">units</span>
            </div>
            <span className="text-xs text-indigo-700 dark:text-indigo-300 mt-2">
              Final chunk duration: <strong>{calculation.formattedLastChunkDuration}</strong>
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Chunk Length</span>
            <div className="mt-1 flex items-center gap-1.5">
              <input
                type="number"
                min={MIN_CHUNK_MINUTES}
                max={MAX_CHUNK_MINUTES}
                value={chunkDurationMinutes}
                onChange={handleCustomMinutesChange}
                disabled={isProcessing}
                className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">minutes</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {CHUNK_PRESETS_MINUTES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => onChunkDurationChange(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                    chunkDurationMinutes === preset
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chunk Parts Breakdown Table Preview */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Planned Output Chunks
            </span>
            <span className="bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[11px] text-slate-700 dark:text-slate-200">{calculation.totalChunks} Files</span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {calculation.chunksSummary.map((chunk) => (
              <div key={chunk.index} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center text-[11px]">
                    {chunk.index}
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    {fileDetails.name.replace(/\.[^/.]+$/, '')}_part{chunk.index.toString().padStart(2, '0')}.{fileDetails.extension}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Duration: <strong className="text-slate-800 dark:text-slate-200 font-medium">{chunk.formattedDuration}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA button */}
        <div className="pt-2">
          <button
            onClick={onStartProcessing}
            disabled={isProcessing}
            className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-medium py-4 rounded-xl shadow-lg shadow-slate-200/60 dark:shadow-none hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Process &amp; Download ZIP ({calculation.totalChunks} Chunks)</span>
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
