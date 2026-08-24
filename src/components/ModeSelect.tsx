import React from 'react';
import { Crosshair, Layers, Waves } from 'lucide-react';
import { AppMode } from '../types';

interface ModeSelectProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const TABS: { mode: AppMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'editor', label: 'Manual Editor', icon: <Waves className="w-3.5 h-3.5" /> },
  { mode: 'finder', label: 'Find Timestamp', icon: <Crosshair className="w-3.5 h-3.5" /> },
  { mode: 'split', label: 'Equal Split', icon: <Layers className="w-3.5 h-3.5" /> },
];

export const ModeSelect: React.FC<ModeSelectProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1 w-fit max-w-full">
      {TABS.map((tab) => (
        <button
          key={tab.mode}
          onClick={() => onModeChange(tab.mode)}
          className={`text-xs font-medium px-3 sm:px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            mode === tab.mode
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
};
