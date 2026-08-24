import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AudioFileDetails } from '../types';
import { formatFileSize } from '../utils/formatters';

interface FileHeaderBannerProps {
  fileDetails: AudioFileDetails;
  onReset: () => void;
  disabled?: boolean;
}

export const FileHeaderBanner: React.FC<FileHeaderBannerProps> = ({ fileDetails, onReset, disabled }) => {
  return (
    <div className="p-6 sm:p-8 bg-slate-900 dark:bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white font-bold flex items-center justify-center text-base shrink-0 uppercase shadow-md">
          {fileDetails.extension}
        </div>
        <div className="overflow-hidden">
          <h2 className="text-lg sm:text-xl font-semibold truncate text-slate-100" title={fileDetails.name}>
            {fileDetails.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
            <span>Size: <strong className="text-slate-200 font-medium">{formatFileSize(fileDetails.size)}</strong></span>
            <span>•</span>
            <span>Total Duration: <strong className="text-indigo-300 font-medium">{fileDetails.formattedDuration}</strong></span>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        disabled={disabled}
        className="self-start sm:self-auto text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Change File
      </button>
    </div>
  );
};
