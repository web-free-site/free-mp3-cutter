import React, { useRef, useState } from 'react';
import { Info, MapPin, Maximize2, Minimize2, Pause, Play, Plus } from 'lucide-react';
import { Waveform, WaveformHandle, WaveformRegion } from '../Editor/Waveform';
import { SeekSteps } from '../Editor/SeekSteps';
import { MarkList } from './MarkList';
import { FileHeaderBanner } from '../FileHeaderBanner';
import { AudioFileDetails, TimestampMark } from '../../types';
import { formatMinutesSeconds, formatPreciseTime } from '../../utils/formatters';
import { parseTimeOrRangeInput } from '../../utils/parseTimestamps';
import { useSeekShortcuts } from '../../hooks/useSeekShortcuts';
import { useFullscreen } from '../../hooks/useFullscreen';

interface TimestampFinderProps {
  fileDetails: AudioFileDetails;
  onReset: () => void;
}

const BOUNDARY_EPSILON_SEC = 0.05;

export const TimestampFinder: React.FC<TimestampFinderProps> = ({ fileDetails, onReset }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<WaveformHandle>(null);
  const previewEndSecRef = useRef<number | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(rootRef);

  const [durationSec, setDurationSec] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [region, setRegion] = useState<WaveformRegion | null>(null);
  const [zoomPxPerSec, setZoomPxPerSec] = useState(80);
  const [minZoomPxPerSec, setMinZoomPxPerSec] = useState(10);

  const [marks, setMarks] = useState<TimestampMark[]>([]);
  const [previewingMarkId, setPreviewingMarkId] = useState<string | null>(null);

  const handleTimeUpdate = (t: number) => {
    setCurrentTimeSec(t);
    if (previewEndSecRef.current !== null && t >= previewEndSecRef.current) {
      waveformRef.current?.pause();
      previewEndSecRef.current = null;
      setPreviewingMarkId(null);
    }
  };

  const handlePlayPauseChange = (playing: boolean) => {
    setIsPlaying(playing);
    if (!playing) {
      setPreviewingMarkId(null);
      previewEndSecRef.current = null;
    }
  };

  const handleStep = (deltaSec: number) => {
    const target = Math.min(durationSec, Math.max(0, currentTimeSec + deltaSec));
    waveformRef.current?.seekTo(target);
  };

  const handleWaveformReady = (duration: number, fitPxPerSec: number) => {
    setDurationSec(duration);
    setMinZoomPxPerSec(fitPxPerSec);
    setZoomPxPerSec(fitPxPerSec);
    waveformRef.current?.setZoom(fitPxPerSec);
  };

  const handleRegionStartChange = (sec: number) => {
    const currentEnd = region ? region.end : Math.min(durationSec, sec + 1);
    const newStart = Math.min(sec, currentEnd - BOUNDARY_EPSILON_SEC);
    waveformRef.current?.setRegionTimes(newStart, currentEnd);
  };

  const handleRegionEndChange = (sec: number) => {
    const currentStart = region ? region.start : 0;
    const newEnd = Math.max(sec, currentStart + BOUNDARY_EPSILON_SEC);
    waveformRef.current?.setRegionTimes(currentStart, newEnd);
  };

  const handleRegionRangeChange = (start: number, end: number) => {
    if (durationSec <= 0) return;
    const clampedStart = Math.max(0, Math.min(start, durationSec));
    const clampedEnd = Math.max(clampedStart + BOUNDARY_EPSILON_SEC, Math.min(end, durationSec));
    waveformRef.current?.setRegionTimes(clampedStart, clampedEnd);
  };

  const handleTimeInput = (raw: string, apply: (sec: number) => void) => {
    const result = parseTimeOrRangeInput(raw);
    if (!result) return;
    if (result.kind === 'range') {
      handleRegionRangeChange(result.startSec, result.endSec);
      return;
    }
    apply(Math.min(durationSec, Math.max(0, result.sec)));
  };

  const handleMarkStartHere = () => handleRegionStartChange(currentTimeSec);
  const handleMarkEndHere = () => handleRegionEndChange(currentTimeSec);

  useSeekShortcuts(() => waveformRef.current?.togglePlayPause(), handleStep);

  const handleAddTimestamp = () => {
    if (!region) return;
    setMarks((prev) => [...prev, { id: crypto.randomUUID(), startSec: region.start, endSec: region.end }]);
    waveformRef.current?.clearRegion();
  };

  const handleRemoveMark = (id: string) => {
    setMarks((prev) => prev.filter((m) => m.id !== id));
  };

  const handlePreviewMark = (mark: TimestampMark) => {
    if (previewingMarkId === mark.id) {
      waveformRef.current?.pause();
      setPreviewingMarkId(null);
      previewEndSecRef.current = null;
      return;
    }
    previewEndSecRef.current = mark.endSec;
    setPreviewingMarkId(mark.id);
    waveformRef.current?.seekTo(mark.startSec);
    waveformRef.current?.play();
  };

  return (
    <div
      ref={rootRef}
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
        isFullscreen ? 'w-screen h-screen overflow-y-auto rounded-none' : 'rounded-3xl overflow-hidden'
      }`}
    >
      <FileHeaderBanner fileDetails={fileDetails} onReset={onReset} />

      <div className={isFullscreen ? 'p-4 sm:p-8 space-y-6' : 'p-6 sm:p-8 space-y-6'}>
        <div className={isFullscreen ? 'max-w-3xl mx-auto w-full' : ''}>
          <div className="flex items-start gap-2.5 bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-4 py-3 text-xs text-indigo-900 dark:text-indigo-200">
            <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p>
              This tool only <strong>finds</strong> cut points, it doesn't export. Play, pause exactly on the beat,
              and stamp the playhead — then copy the results into <strong>Manual Editor's</strong> Paste Timestamps
              box to actually cut and download.
            </p>
          </div>
        </div>

        <div className={isFullscreen ? 'max-w-3xl mx-auto w-full flex items-center justify-between gap-2' : 'flex items-center justify-between gap-2'}>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
            Timeline
          </span>
          <button
            onClick={toggleFullscreen}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        <Waveform
          ref={waveformRef}
          file={fileDetails.file}
          onReady={handleWaveformReady}
          onTimeUpdate={handleTimeUpdate}
          onPlayPauseChange={handlePlayPauseChange}
          onRegionChange={setRegion}
        />

        <div className={isFullscreen ? 'max-w-3xl mx-auto w-full space-y-5' : 'space-y-5'}>
          {/* Transport + precision stepping */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => waveformRef.current?.togglePlayPause()}
              className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center hover:bg-slate-800 dark:hover:bg-indigo-500 transition cursor-pointer shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <span className="font-mono text-sm text-slate-600 dark:text-slate-300 tabular-nums mr-2">
              {formatMinutesSeconds(currentTimeSec)} / {formatMinutesSeconds(durationSec)}
            </span>

            <SeekSteps onStep={handleStep} />

            <div className="flex items-center gap-2 sm:ml-auto">
              <input
                type="range"
                min={minZoomPxPerSec}
                max={Math.max(300, minZoomPxPerSec)}
                value={zoomPxPerSec}
                onChange={(e) => {
                  setZoomPxPerSec(Number(e.target.value));
                  waveformRef.current?.setZoom(Number(e.target.value));
                }}
                className="w-24 accent-indigo-600"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-3">
            Shortcuts: <kbd className="font-mono">Space</kbd> play/pause · <kbd className="font-mono">←/→</kbd> step
            0.1s · <kbd className="font-mono">Shift</kbd>+arrow 1s · <kbd className="font-mono">Alt</kbd>+arrow 10ms
          </p>

          {/* Mark start/end from playhead, or type/paste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">
                Start Point
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  disabled={durationSec <= 0}
                  defaultValue={region ? formatPreciseTime(region.start) : ''}
                  key={`start-${region?.start ?? 'none'}`}
                  onBlur={(e) => handleTimeInput(e.target.value, handleRegionStartChange)}
                  placeholder="mm:ss.mmm or mm.ss-mm.ss"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
                />
                <button
                  onClick={handleMarkStartHere}
                  disabled={durationSec <= 0}
                  title="Stamp the current playhead as the start"
                  className="shrink-0 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20 transition cursor-pointer disabled:opacity-40"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">
                End Point
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  disabled={durationSec <= 0}
                  defaultValue={region ? formatPreciseTime(region.end) : ''}
                  key={`end-${region?.end ?? 'none'}`}
                  onBlur={(e) => handleTimeInput(e.target.value, handleRegionEndChange)}
                  placeholder="mm:ss.mmm or mm.ss-mm.ss"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
                />
                <button
                  onClick={handleMarkEndHere}
                  disabled={durationSec <= 0}
                  title="Stamp the current playhead as the end"
                  className="shrink-0 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20 transition cursor-pointer disabled:opacity-40"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddTimestamp}
              disabled={!region}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20 px-3.5 py-2 rounded-lg border border-emerald-100 dark:border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" /> Add Timestamp
            </button>

            {region && (
              <button
                onClick={() => waveformRef.current?.clearRegion()}
                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3.5 py-2 rounded-lg transition cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>

          <MarkList
            marks={marks}
            onRemoveMark={handleRemoveMark}
            onPreviewMark={handlePreviewMark}
            previewingMarkId={previewingMarkId}
          />
        </div>
      </div>
    </div>
  );
};
