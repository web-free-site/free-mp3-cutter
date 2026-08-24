import React from 'react';
import { Scissors, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Scissors className="w-4.5 h-4.5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">AudioSlice</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Cut, trim, and time audio — 100% in your browser.</p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
