import React from 'react';
import { FastForward, Rewind } from 'lucide-react';
import { COARSE_STEP_SEC, DEFAULT_STEP_SEC, FINE_STEP_SEC } from '../../utils/constants';

interface SeekStepsProps {
  onStep: (deltaSec: number) => void;
}

const STEPS = [COARSE_STEP_SEC, DEFAULT_STEP_SEC, FINE_STEP_SEC];

function stepLabel(step: number): string {
  return step < 0.1 ? `${Math.round(step * 1000)}ms` : `${step}s`;
}

export const SeekSteps: React.FC<SeekStepsProps> = ({ onStep }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {STEPS.slice()
      .reverse()
      .map((step) => (
        <button
          key={`back-${step}`}
          onClick={() => onStep(-step)}
          title={`Back ${stepLabel(step)} (${step === FINE_STEP_SEC ? 'Alt+' : step === COARSE_STEP_SEC ? 'Shift+' : ''}Left)`}
          className="text-[11px] font-mono px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 transition cursor-pointer flex items-center gap-1"
        >
          <Rewind className="w-3 h-3" /> {stepLabel(step)}
        </button>
      ))}
    {STEPS.map((step) => (
      <button
        key={`fwd-${step}`}
        onClick={() => onStep(step)}
        title={`Forward ${stepLabel(step)} (${step === FINE_STEP_SEC ? 'Alt+' : step === COARSE_STEP_SEC ? 'Shift+' : ''}Right)`}
        className="text-[11px] font-mono px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 transition cursor-pointer flex items-center gap-1"
      >
        {stepLabel(step)} <FastForward className="w-3 h-3" />
      </button>
    ))}
  </div>
);
