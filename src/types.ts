export interface AudioFileDetails {
  file: File;
  name: string;
  size: number;
  extension: string;
  durationSeconds: number;
  formattedDuration: string;
  sampleRate?: number;
  numberOfChannels?: number;
}

export interface ChunkInfo {
  index: number;
  filename: string;
  startTimeSeconds: number;
  durationSeconds: number;
  formattedRange: string;
  formattedDuration: string;
  blob?: Blob;
  size?: number;
}

export type ProcessingStage = 'idle' | 'analyzing' | 'ready' | 'loading-ffmpeg' | 'processing' | 'zipping' | 'completed' | 'error';

export interface ProcessingProgressState {
  stage: ProcessingStage;
  currentChunkIndex: number;
  totalChunks: number;
  progressPercent: number;
  statusMessage: string;
  logs: string[];
  errorMessage?: string;
}

export interface ProcessingOptions {
  chunkDurationMinutes: number; // default 18
  forceReencode: boolean; // default false (use -c copy first)
}

export type AppMode = 'split' | 'editor' | 'finder';

export interface EditorClip {
  id: string;
  startSec: number;
  endSec: number;
  gainDb: number;
  label: string;
}

export interface TimestampMark {
  id: string;
  startSec: number;
  endSec: number;
}

export interface SpoilSettings {
  enabled: boolean;
  noiseAmount: number; // 0-100, mixes in hiss to mask fidelity
  muffleAmount: number; // 0-100, low-pass cutoff strength
  wobbleAmount: number; // 0-100, pitch/speed vibrato depth
}
