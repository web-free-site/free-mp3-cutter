import React from 'react';
import { Crosshair, Layers, Lock, Waves } from 'lucide-react';

const FEATURES = [
  {
    icon: Waves,
    title: 'Manual Editor',
    description: 'Waveform-based trim, gain, split, and join — pick exact start/end points on the graph.',
  },
  {
    icon: Crosshair,
    title: 'Find Timestamp',
    description: 'Scrub and step frame-by-frame to pinpoint a sharp cut, then copy it straight into the editor.',
  },
  {
    icon: Lock,
    title: '100% Local',
    description: 'Everything runs in your browser tab. No uploads, no server, no storage.',
  },
  {
    icon: Layers,
    title: 'Equal Split',
    description: 'Split long recordings into fixed-length chunks in one click.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <feature.icon className="w-4.5 h-4.5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{feature.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
