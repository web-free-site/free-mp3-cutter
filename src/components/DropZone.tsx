import React, { useRef, useState } from 'react';
import { Upload, Music, FileAudio, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';
import { MAX_FILE_SIZE_BYTES, SUPPORTED_AUDIO_EXTENSIONS } from '../utils/constants';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcess = (file: File) => {
    setErrorMsg(null);
    const ext = file.name.split('.').pop()?.toLowerCase();

    const isValidExt = ext && SUPPORTED_AUDIO_EXTENSIONS.includes(ext);
    const isValidMime =
      file.type.startsWith('audio/') || file.type === 'video/mp4' || file.type === 'video/x-m4a' || file.type === 'video/webm';

    if (!isValidExt && !isValidMime) {
      setErrorMsg(`Unsupported file type (.${ext || 'unknown'}). Please upload an audio file.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(
        `File too large (${formatFileSize(file.size)}). Max supported size is ${formatFileSize(MAX_FILE_SIZE_BYTES)} — processing happens in browser tab memory.`
      );
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/60 bg-slate-50/30 dark:bg-slate-900/40 hover:bg-slate-50/80 dark:hover:bg-slate-900/70 shadow-[0_4px_20px_rgb(0,0,0,0.02)]'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={`audio/*,${SUPPORTED_AUDIO_EXTENSIONS.map((e) => `.${e}`).join(',')}`}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-200 shadow-xs">
          <Upload className="w-7 h-7 stroke-[1.8]" />
        </div>

        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-1">
          Drop your audio file here, or <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 font-semibold">browse</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          Supports MP3, WAV, M4A, FLAC, OGG, and most other audio formats, up to {formatFileSize(MAX_FILE_SIZE_BYTES)}.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700 shadow-2xs">
            <FileAudio className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> Lossy (MP3, AAC, OGG...)
          </span>
          <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700 shadow-2xs">
            <Music className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> Lossless (WAV, FLAC...)
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Invalid File Selected</p>
            <p className="text-rose-700 dark:text-rose-300/90 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
};
