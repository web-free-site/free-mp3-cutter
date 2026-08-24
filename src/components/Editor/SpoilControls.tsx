import React, { useState } from 'react';
import { ChevronDown, ShieldAlert } from 'lucide-react';
import { SpoilSettings } from '../../types';

interface SpoilControlsProps {
  settings: SpoilSettings;
  onChange: (settings: SpoilSettings) => void;
}

const SLIDERS: { key: keyof Omit<SpoilSettings, 'enabled'>; label: string; hint: string }[] = [
  { key: 'noiseAmount', label: 'Noise', hint: 'Mixes in faint hiss to mask fidelity' },
  { key: 'muffleAmount', label: 'Muffle', hint: 'Cuts highs, like a phone recording' },
  { key: 'wobbleAmount', label: 'Wobble', hint: 'Slight pitch flutter, like worn tape' },
];

export const SpoilControls: React.FC<SpoilControlsProps> = ({ settings, onChange }) => {
  const [open, setOpen] = useState(false);
  const isActive = settings.enabled && (settings.noiseAmount > 0 || settings.muffleAmount > 0 || settings.wobbleAmount > 0);

  const update = (patch: Partial<SpoilSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
      >
        <ShieldAlert className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Protect Original</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">(optional — degrade audio before sharing)</span>
        {isActive && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 rounded-full px-2 py-0.5">
            On
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 pt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
              className="accent-indigo-600 w-3.5 h-3.5"
            />
            Apply on export
          </label>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-2">
            Bakes a subtle quality hit into the exported file only — useful for sending a preview copy without
            handing over the clean original. Combine sliders for a stronger effect; keep them low to stay barely
            noticeable.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SLIDERS.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">
                  {label} ({settings[key]}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings[key]}
                  disabled={!settings.enabled}
                  onChange={(e) => update({ [key]: Number(e.target.value) } as Partial<SpoilSettings>)}
                  className="w-full accent-indigo-600 disabled:opacity-40"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
