import React, { useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Waveform, WaveformHandle, WaveformRegion } from './Waveform';
import { EditorToolbar } from './EditorToolbar';
import { ClipList } from './ClipList';
import { TimestampImport } from './TimestampImport';
import { SpoilControls } from './SpoilControls';
import { ProcessingProgress } from '../ProcessingProgress';
import { CompletionView } from '../CompletionView';
import { FileHeaderBanner } from '../FileHeaderBanner';
import { AudioFileDetails, ChunkInfo, EditorClip, ProcessingProgressState, SpoilSettings } from '../../types';
import { DEFAULT_GAIN_DB } from '../../utils/constants';
import { parseTimestampRanges } from '../../utils/parseTimestamps';
import { exportClips } from '../../services/audioEditorService';
import { createAndDownloadZip } from '../../services/zipService';
import { useSeekShortcuts } from '../../hooks/useSeekShortcuts';
import { useFullscreen } from '../../hooks/useFullscreen';

const DEFAULT_SPOIL_SETTINGS: SpoilSettings = {
  enabled: false,
  noiseAmount: 0,
  muffleAmount: 0,
  wobbleAmount: 0,
};

const MAX_UNDO_DEPTH = 20;

interface AudioEditorProps {
  fileDetails: AudioFileDetails;
  onReset: () => void;
}

function dbToLinear(db: number): number {
  return Math.min(1, Math.max(0, Math.pow(10, db / 20)));
}

const BOUNDARY_EPSILON_SEC = 0.05;

const IDLE_EXPORT_STATE: ProcessingProgressState = {
  stage: 'idle',
  currentChunkIndex: 0,
  totalChunks: 0,
  progressPercent: 0,
  statusMessage: '',
  logs: [],
};

export const AudioEditor: React.FC<AudioEditorProps> = ({ fileDetails, onReset }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<WaveformHandle>(null);
  const previewEndSecRef = useRef<number | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(rootRef);

  const [spoilSettings, setSpoilSettings] = useState<SpoilSettings>(DEFAULT_SPOIL_SETTINGS);

  const [durationSec, setDurationSec] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [region, setRegion] = useState<WaveformRegion | null>(null);
  const [gainDb, setGainDb] = useState(DEFAULT_GAIN_DB);
  const [zoomPxPerSec, setZoomPxPerSec] = useState(50);
  const [minZoomPxPerSec, setMinZoomPxPerSec] = useState(10);

  const [clips, setClips] = useState<EditorClip[]>([]);
  const [clipsHistory, setClipsHistory] = useState<EditorClip[][]>([]);
  const [joinIntoOne, setJoinIntoOne] = useState(false);
  const [previewingClipId, setPreviewingClipId] = useState<string | null>(null);
  const [editingClipId, setEditingClipId] = useState<string | null>(null);

  const [exportState, setExportState] = useState<ProcessingProgressState>(IDLE_EXPORT_STATE);
  const [resultChunks, setResultChunks] = useState<ChunkInfo[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const editingClip = clips.find((c) => c.id === editingClipId) ?? null;

  const relabel = (list: EditorClip[]): EditorClip[] =>
    list.map((c, i) => ({ ...c, label: `part${String(i + 1).padStart(2, '0')}` }));

  const pushHistory = (snapshot: EditorClip[]) => {
    setClipsHistory((h) => [...h, snapshot].slice(-MAX_UNDO_DEPTH));
  };

  const handleUndo = () => {
    setClipsHistory((h) => {
      if (h.length === 0) return h;
      setClips(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  const handleTimeUpdate = (t: number) => {
    setCurrentTimeSec(t);
    if (previewEndSecRef.current !== null && t >= previewEndSecRef.current) {
      waveformRef.current?.pause();
      previewEndSecRef.current = null;
      setPreviewingClipId(null);
    }
  };

  const handlePlayPauseChange = (playing: boolean) => {
    setIsPlaying(playing);
    if (!playing) {
      setPreviewingClipId(null);
      previewEndSecRef.current = null;
    }
  };

  const handlePreviewClip = (clip: EditorClip) => {
    if (previewingClipId === clip.id) {
      waveformRef.current?.pause();
      setPreviewingClipId(null);
      previewEndSecRef.current = null;
      return;
    }
    previewEndSecRef.current = clip.endSec;
    setPreviewingClipId(clip.id);
    waveformRef.current?.seekTo(clip.startSec);
    waveformRef.current?.play();
  };

  const handleEditClip = (clip: EditorClip) => {
    setEditingClipId(clip.id);
    setGainDb(clip.gainDb);
    waveformRef.current?.setRegionTimes(clip.startSec, clip.endSec);
    waveformRef.current?.setVolume(dbToLinear(clip.gainDb));
    if (zoomPxPerSec < 100) handleZoomChange(140);
  };

  const handleSaveEditedClip = () => {
    if (!editingClipId || !region) return;
    pushHistory(clips);
    setClips((prev) =>
      prev.map((c) => (c.id === editingClipId ? { ...c, startSec: region.start, endSec: region.end, gainDb } : c))
    );
    setEditingClipId(null);
    waveformRef.current?.clearRegion();
  };

  const handleCancelEdit = () => {
    setEditingClipId(null);
    waveformRef.current?.clearRegion();
  };

  const handleGainChange = (db: number) => {
    setGainDb(db);
    waveformRef.current?.setVolume(dbToLinear(db));
  };

  const handleZoomChange = (px: number) => {
    setZoomPxPerSec(px);
    waveformRef.current?.setZoom(px);
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

  const handleExtractSelection = () => {
    if (!region) return;
    pushHistory(clips);
    setClips((prev) =>
      relabel([...prev, { id: crypto.randomUUID(), startSec: region.start, endSec: region.end, gainDb, label: '' }])
    );
    waveformRef.current?.clearRegion();
  };

  const handleDeleteSelection = () => {
    if (!region || durationSec <= 0) return;
    const remaining: EditorClip[] = [];

    if (region.start > BOUNDARY_EPSILON_SEC) {
      remaining.push({ id: crypto.randomUUID(), startSec: 0, endSec: region.start, gainDb: 0, label: '' });
    }
    if (region.end < durationSec - BOUNDARY_EPSILON_SEC) {
      remaining.push({ id: crypto.randomUUID(), startSec: region.end, endSec: durationSec, gainDb: 0, label: '' });
    }
    if (remaining.length === 0) return;

    pushHistory(clips);
    setClips(relabel(remaining));
    if (remaining.length > 1) setJoinIntoOne(true);
    waveformRef.current?.clearRegion();
  };

  const handleSplitAtPlayhead = () => {
    if (durationSec <= 0) return;

    if (clips.length === 0) {
      if (currentTimeSec <= BOUNDARY_EPSILON_SEC || currentTimeSec >= durationSec - BOUNDARY_EPSILON_SEC) return;
      pushHistory(clips);
      setClips(
        relabel([
          { id: crypto.randomUUID(), startSec: 0, endSec: currentTimeSec, gainDb: 0, label: '' },
          { id: crypto.randomUUID(), startSec: currentTimeSec, endSec: durationSec, gainDb: 0, label: '' },
        ])
      );
      return;
    }

    const idx = clips.findIndex(
      (c) => currentTimeSec > c.startSec + BOUNDARY_EPSILON_SEC && currentTimeSec < c.endSec - BOUNDARY_EPSILON_SEC
    );
    if (idx === -1) return;

    const target = clips[idx];
    const head: EditorClip = { ...target, id: crypto.randomUUID(), endSec: currentTimeSec };
    const tail: EditorClip = { ...target, id: crypto.randomUUID(), startSec: currentTimeSec };

    pushHistory(clips);
    setClips((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1, head, tail);
      return relabel(copy);
    });
  };

  const handleImportTimestamps = (text: string) => {
    const ranges = parseTimestampRanges(text);
    if (ranges.length === 0) return;

    const imported: EditorClip[] = ranges
      .map((r) => ({
        id: crypto.randomUUID(),
        startSec: Math.max(0, r.startSec),
        endSec: durationSec > 0 ? Math.min(r.endSec, durationSec) : r.endSec,
        gainDb: 0,
        label: '',
      }))
      .filter((c) => c.endSec > c.startSec);

    if (imported.length === 0) return;
    pushHistory(clips);
    setClips((prev) => relabel([...prev, ...imported]));
  };

  const handleRemoveClip = (id: string) => {
    pushHistory(clips);
    setClips((prev) => relabel(prev.filter((c) => c.id !== id)));
  };

  const handleMoveClip = (id: string, direction: 'up' | 'down') => {
    pushHistory(clips);
    setClips((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[swapWith]] = [copy[swapWith], copy[idx]];
      return relabel(copy);
    });
  };

  const handleClipGainChange = (id: string, db: number) => {
    setClips((prev) => prev.map((c) => (c.id === id ? { ...c, gainDb: db } : c)));
  };

  const handleStep = (deltaSec: number) => {
    const target = Math.min(durationSec, Math.max(0, currentTimeSec + deltaSec));
    waveformRef.current?.seekTo(target);
  };

  useSeekShortcuts(() => waveformRef.current?.togglePlayPause(), handleStep);

  const handleExport = async () => {
    if (clips.length === 0) return;

    setExportState({
      stage: 'processing',
      currentChunkIndex: 0,
      totalChunks: clips.length,
      progressPercent: 1,
      statusMessage: 'Starting export...',
      logs: ['Initializing editor export...'],
    });

    try {
      const chunks = await exportClips(fileDetails, clips, joinIntoOne, spoilSettings, (percent, current, total, logMsg) => {
        setExportState((prev) => ({
          ...prev,
          progressPercent: percent,
          currentChunkIndex: current,
          totalChunks: total,
          statusMessage: logMsg,
          logs: [...prev.logs, logMsg].slice(-15),
        }));
      });

      setResultChunks(chunks);

      setExportState((prev) => ({
        ...prev,
        stage: 'zipping',
        progressPercent: 95,
        statusMessage: 'Creating ZIP file and triggering download...',
        logs: [...prev.logs, 'Bundling exported clips into JSZip...'],
      }));

      const generatedZipBlob = await createAndDownloadZip(fileDetails.name, chunks, (zipPercent) => {
        setExportState((prev) => ({
          ...prev,
          progressPercent: Math.min(99, 92 + Math.round(zipPercent * 0.08)),
          statusMessage: `Compressing ZIP file (${zipPercent}%)...`,
        }));
      });

      setZipBlob(generatedZipBlob);

      setExportState({
        stage: 'completed',
        currentChunkIndex: chunks.length,
        totalChunks: chunks.length,
        progressPercent: 100,
        statusMessage: 'Export completed successfully!',
        logs: ['ZIP file generated and auto-downloaded successfully!'],
      });
    } catch (err) {
      setExportState((prev) => ({
        ...prev,
        stage: 'error',
        errorMessage: (err as Error).message || 'An error occurred while exporting.',
        logs: [...prev.logs, `Error: ${(err as Error).message}`],
      }));
    }
  };

  if (exportState.stage === 'processing' || exportState.stage === 'zipping' || exportState.stage === 'error') {
    return <ProcessingProgress state={exportState} filename={fileDetails.name} />;
  }

  if (exportState.stage === 'completed') {
    return (
      <CompletionView baseFilename={fileDetails.name} chunks={resultChunks} zipBlob={zipBlob} onReset={onReset} />
    );
  }

  return (
    <div
      ref={rootRef}
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
        isFullscreen ? 'w-screen h-screen overflow-y-auto rounded-none' : 'rounded-3xl overflow-hidden'
      }`}
    >
      <FileHeaderBanner fileDetails={fileDetails} onReset={onReset} />

      <div className={isFullscreen ? 'p-4 sm:p-8 space-y-6' : 'p-6 sm:p-8 space-y-6'}>
        <div className="flex items-center justify-between gap-2">
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

        <div className={isFullscreen ? 'max-w-3xl mx-auto w-full space-y-6' : 'space-y-6'}>
          <EditorToolbar
            currentTimeSec={currentTimeSec}
            durationSec={durationSec}
            isPlaying={isPlaying}
            region={region}
            gainDb={gainDb}
            zoomPxPerSec={zoomPxPerSec}
            minZoomPxPerSec={minZoomPxPerSec}
            onTogglePlay={() => waveformRef.current?.togglePlayPause()}
            onStep={handleStep}
            onRegionStartChange={handleRegionStartChange}
            onRegionEndChange={handleRegionEndChange}
            onRegionRangeChange={handleRegionRangeChange}
            onClearRegion={() => waveformRef.current?.clearRegion()}
            onGainChange={handleGainChange}
            onZoomChange={handleZoomChange}
            onExtractSelection={handleExtractSelection}
            onDeleteSelection={handleDeleteSelection}
            onSplitAtPlayhead={handleSplitAtPlayhead}
            editingClipLabel={editingClip?.label ?? null}
            onSaveEdit={handleSaveEditedClip}
            onCancelEdit={handleCancelEdit}
          />

          <TimestampImport onImport={handleImportTimestamps} disabled={editingClipId !== null} />

          <SpoilControls settings={spoilSettings} onChange={setSpoilSettings} />

          <ClipList
            clips={clips}
            joinIntoOne={joinIntoOne}
            onJoinToggle={setJoinIntoOne}
            onRemoveClip={handleRemoveClip}
            onMoveClip={handleMoveClip}
            onClipGainChange={handleClipGainChange}
            onPreviewClip={handlePreviewClip}
            onEditClip={handleEditClip}
            previewingClipId={previewingClipId}
            editingClipId={editingClipId}
            onUndo={handleUndo}
            canUndo={clipsHistory.length > 0}
            onExport={handleExport}
            isExporting={false}
          />
        </div>
      </div>
    </div>
  );
};
