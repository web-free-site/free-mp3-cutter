import React from 'react';
import { ChunkInfo } from '../types';
import { formatFileSize } from '../utils/formatters';
import { triggerBlobDownload } from '../services/zipService';
import { CheckCircle2, Download, FileArchive, Music, RotateCcw } from 'lucide-react';

interface CompletionViewProps {
  baseFilename: string;
  chunks: ChunkInfo[];
  zipBlob: Blob | null;
  onReset: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  baseFilename,
  chunks,
  zipBlob,
  onReset,
}) => {
  const cleanBaseName = baseFilename.replace(/[^a-zA-Z0-9_-]/g, '_');
  const zipFilename = `${cleanBaseName}_chunks.zip`;

  const handleDownloadZip = () => {
    if (zipBlob) {
      triggerBlobDownload(zipBlob, zipFilename);
    }
  };

  const handleDownloadChunk = (chunk: ChunkInfo) => {
    if (chunk.blob) {
      triggerBlobDownload(chunk.blob, chunk.filename);
    }
  };

  const totalBytes = chunks.reduce((acc, curr) => acc + (curr.size || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-6 sm:p-8 space-y-6">
      {/* Success Banner */}
      <div className="bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/30 rounded-2xl p-6 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-sm">
          <CheckCircle2 className="w-8 h-8 stroke-[2]" />
        </div>
        <h2 className="text-xl font-semibold text-emerald-950 dark:text-emerald-200">
          Splitting Complete! ZIP Downloaded
        </h2>
        <p className="text-sm text-emerald-800 dark:text-emerald-300/90 mt-1 max-w-md">
          Successfully generated <strong className="font-semibold text-emerald-950 dark:text-emerald-200">{chunks.length} audio chunks</strong>. Your single ZIP archive has been created and triggered for download.
        </p>

        {zipBlob && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadZip}
              className="py-3 px-6 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-medium text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <FileArchive className="w-4 h-4" /> Download ZIP Archive Again ({formatFileSize(zipBlob.size)})
            </button>
            <button
              onClick={onReset}
              className="py-3 px-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" /> Process Another File
            </button>
          </div>
        )}
      </div>

      {/* Individual Chunks Breakdown & Download Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Individual Audio Chunks ({chunks.length})
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Total Combined Size: {formatFileSize(totalBytes)}
          </span>
        </div>

        <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          {chunks.map((chunk) => (
            <div
              key={chunk.index}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center text-xs shrink-0">
                  #{chunk.index}
                </div>
                <div>
                  <p className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                    {chunk.filename}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Range: {chunk.formattedRange} • Duration: <strong className="text-slate-700 dark:text-slate-300 font-medium">{chunk.formattedDuration}</strong> • Size: {formatFileSize(chunk.size || 0)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDownloadChunk(chunk)}
                className="self-start sm:self-auto text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/30 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Chunk
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
