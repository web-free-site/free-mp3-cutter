import React, { useState } from 'react';
import { DropZone } from '../components/DropZone';
import { FileOverview } from '../components/FileOverview';
import { ProcessingProgress } from '../components/ProcessingProgress';
import { CompletionView } from '../components/CompletionView';
import { ModeSelect } from '../components/ModeSelect';
import { AudioEditor } from '../components/Editor/AudioEditor';
import { TimestampFinder } from '../components/Finder/TimestampFinder';
import { FeaturesSection } from '../components/FeaturesSection';
import { HomeSeoSection } from '../components/HomeSeoSection';
import { AdSlot } from '../components/ads/AdSlot';
import { JsonLd } from '../components/JsonLd';
import { SEO_PAGES } from '../seo/pages';

import { AppMode, AudioFileDetails, ChunkInfo, ProcessingProgressState } from '../types';
import { getAudioFileDetails } from '../utils/audioMetadata';
import { splitAudioFile } from '../services/ffmpegService';
import { createAndDownloadZip } from '../services/zipService';
import { DEFAULT_CHUNK_MINUTES } from '../utils/constants';

export const HomeToolPage: React.FC = () => {
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
        },
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

  const showSeo = !fileDetails && processingState.stage === 'idle';

  return (
    <div className="space-y-8">
      <JsonLd page={SEO_PAGES[0]} />
      {showSeo ? <HomeSeoSection /> : null}

      {(!fileDetails || processingState.stage === 'idle') && (
        <>
          <DropZone onFileSelected={handleFileSelected} isLoading={isAnalyzing} />
          <AdSlot slot="betweenToolContent728x90" className="ad-mid" />
          <FeaturesSection />
        </>
      )}

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

      {(processingState.stage === 'processing' ||
        processingState.stage === 'loading-ffmpeg' ||
        processingState.stage === 'zipping') && (
        <ProcessingProgress state={processingState} filename={fileDetails?.name || ''} />
      )}

      {processingState.stage === 'completed' && (
        <>
          <CompletionView
            baseFilename={fileDetails?.name || 'audio'}
            chunks={createdChunks}
            zipBlob={zipBlob}
            onReset={handleReset}
          />
          <AdSlot slot="nativeBelowResult" className="ad-native" />
        </>
      )}
    </div>
  );
};