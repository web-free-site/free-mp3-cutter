import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileOverview } from './components/FileOverview';
import { ProcessingProgress } from './components/ProcessingProgress';
import { CompletionView } from './components/CompletionView';
import { ModeSelect } from './components/ModeSelect';
import { AudioEditor } from './components/Editor/AudioEditor';
import { TimestampFinder } from './components/Finder/TimestampFinder';
import { FeaturesSection } from './components/FeaturesSection';

import { AppMode, AudioFileDetails, ChunkInfo, ProcessingProgressState } from './types';
import { getAudioFileDetails } from './utils/audioMetadata';
import { splitAudioFile } from './services/ffmpegService';
import { createAndDownloadZip } from './services/zipService';
import { DEFAULT_CHUNK_MINUTES } from './utils/constants';

export default function App() {
  const [fileDetails, setFileDetails] = useState<AudioFileDetails | null>(null);
  const [mode, setMode] = useState<AppMode>('editor');
  const [chunkDurationMinutes, setChunkDurationMinutes] = useState<number>(DEFAULT_CHUNK_MINUTES);
  const [createdChunks, setCreatedChunks] = useState<ChunkInfo[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [processingState, setProcessingState] = useState<ProcessingProgressState>({
    stage: 'idle',
    currentChunkIndex: 0,
    totalChunks: 0,
    progressPercent: 0,
    statusMessage: '',
    logs: [],
  });

  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setProcessingState({
      stage: 'analyzing',
      currentChunkIndex: 0,
      totalChunks: 0,
      progressPercent: 0,
      statusMessage: 'Analyzing audio file duration and codec...',
      logs: ['Reading audio file headers in browser memory...'],
    });

    try {
      const details = await getAudioFileDetails(file);
      setFileDetails(details);
      setProcessingState({
        stage: 'ready',
        currentChunkIndex: 0,
        totalChunks: 0,
        progressPercent: 0,
        statusMessage: 'File loaded successfully.',
        logs: [`File verified: ${details.name} (${details.formattedDuration})`],
      });
    } catch (err) {
      setProcessingState({
        stage: 'error',
        currentChunkIndex: 0,
        totalChunks: 0,
        progressPercent: 0,
        statusMessage: 'Error reading file',
        logs: [`Error: ${(err as Error).message}`],
        errorMessage: (err as Error).message,
      });
      setFileDetails(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartProcessing = async () => {
    if (!fileDetails) return;

    setProcessingState({
      stage: 'processing',
      currentChunkIndex: 0,
      totalChunks: 0,
      progressPercent: 1,
      statusMessage: 'Starting chunk splitting...',
      logs: ['Initializing audio processing engine...'],
    });

    try {
      const chunks = await splitAudioFile(
        fileDetails,
        chunkDurationMinutes,
        (percent, currentChunk, totalChunks, logMsg) => {
          setProcessingState((prev) => ({
            ...prev,
            progressPercent: percent,
            currentChunkIndex: currentChunk,
            totalChunks,
            statusMessage: logMsg,
            logs: [...prev.logs, logMsg].slice(-15),
          }));
        }
      );

      setCreatedChunks(chunks);

      setProcessingState((prev) => ({
        ...prev,
        stage: 'zipping',
        progressPercent: 95,
        statusMessage: 'Creating ZIP file and triggering download...',
        logs: [...prev.logs, 'Bundling all chunks into JSZip...'],
      }));

      const generatedZipBlob = await createAndDownloadZip(fileDetails.name, chunks, (zipPercent) => {
        setProcessingState((prev) => ({
          ...prev,
          progressPercent: Math.min(99, 92 + Math.round(zipPercent * 0.08)),
          statusMessage: `Compressing ZIP file (${zipPercent}%)...`,
        }));
      });

      setZipBlob(generatedZipBlob);

      setProcessingState({
        stage: 'completed',
        currentChunkIndex: chunks.length,
        totalChunks: chunks.length,
        progressPercent: 100,
        statusMessage: 'Processing completed successfully!',
        logs: ['ZIP file generated and auto-downloaded successfully!'],
      });
    } catch (err) {
      console.error('Audio chunking error:', err);
      setProcessingState((prev) => ({
        ...prev,
        stage: 'error',
        errorMessage: (err as Error).message || 'An error occurred while splitting the audio file.',
        logs: [...prev.logs, `Error: ${(err as Error).message}`],
      }));
    }
  };

  const handleReset = () => {
    setFileDetails(null);
    setMode('editor');
    setCreatedChunks([]);
    setZipBlob(null);
    setProcessingState({
      stage: 'idle',
      currentChunkIndex: 0,
      totalChunks: 0,
      progressPercent: 0,
      statusMessage: '',
      logs: [],
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-slate-950 text-[#1a1a1a] dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-400/30 dark:selection:text-indigo-50">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Step 1: File Drop Zone */}
        {(!fileDetails || processingState.stage === 'idle') && (
          <>
            <DropZone onFileSelected={handleFileSelected} isLoading={isAnalyzing} />
            <FeaturesSection />
          </>
        )}

        {/* Step 2: Mode Select + File Overview / Manual Editor */}
        {fileDetails && (processingState.stage === 'ready' || processingState.stage === 'analyzing') && (
          <div className="space-y-6">
            <ModeSelect mode={mode} onModeChange={setMode} />

            {mode === 'split' && (
              <FileOverview
                fileDetails={fileDetails}
                chunkDurationMinutes={chunkDurationMinutes}
                onChunkDurationChange={setChunkDurationMinutes}
                onStartProcessing={handleStartProcessing}
                onReset={handleReset}
                isProcessing={isAnalyzing}
              />
            )}
            {mode === 'editor' && <AudioEditor fileDetails={fileDetails} onReset={handleReset} />}
            {mode === 'finder' && <TimestampFinder fileDetails={fileDetails} onReset={handleReset} />}
          </div>
        )}

        {/* Step 3: Active Processing State */}
        {(processingState.stage === 'processing' || processingState.stage === 'loading-ffmpeg' || processingState.stage === 'zipping') && (
          <ProcessingProgress state={processingState} filename={fileDetails?.name || ''} />
        )}

        {/* Step 4: Completion State */}
        {processingState.stage === 'completed' && (
          <CompletionView
            baseFilename={fileDetails?.name || 'audio'}
            chunks={createdChunks}
            zipBlob={zipBlob}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-600 space-y-1.5">
        <p>Processing runs 100% locally in your browser. No uploads, no storage.</p>
        <p>
          <a
            href="https://github.com/irajeshegde/AudioSlice"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-400 transition underline underline-offset-2"
          >
            <Github className="w-3.5 h-3.5" /> Open source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
