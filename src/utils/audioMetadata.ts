import { AudioFileDetails } from '../types';
import { formatFileSize, formatHumanDuration, getFileExtensionAndBase } from './formatters';

/**
 * Reads audio file metadata (duration, size, channels, etc.) without sending anything to a server.
 */
export async function getAudioFileDetails(file: File): Promise<AudioFileDetails> {
  const { baseName, extension } = getFileExtensionAndBase(file.name);
  
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const onLoaded = () => {
      const durationSeconds = audio.duration;
      cleanup();

      if (!durationSeconds || isNaN(durationSeconds) || durationSeconds === Infinity) {
        // Fallback to Web Audio API decoding if HTML5 Audio metadata fails
        tryWebAudioDecode(file)
          .then(resolve)
          .catch((err) => reject(new Error('Could not determine audio duration. Please ensure the file is a valid MP3 or M4A audio file.')));
        return;
      }

      resolve({
        file,
        name: file.name,
        size: file.size,
        extension,
        durationSeconds,
        formattedDuration: formatHumanDuration(durationSeconds),
      });
    };

    const onError = () => {
      cleanup();
      // Try Web Audio API as fallback before failing
      tryWebAudioDecode(file)
        .then(resolve)
        .catch(() => reject(new Error('Unsupported or corrupted audio file. Please try re-exporting as standard MP3 or M4A.')));
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.src = objectUrl;
  });
}

/**
 * Fallback audio duration decoder using Web Audio API AudioContext
 */
async function tryWebAudioDecode(file: File): Promise<AudioFileDetails> {
  const { extension } = getFileExtensionAndBase(file.name);
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextClass();
  
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const durationSeconds = audioBuffer.duration;
    
    return {
      file,
      name: file.name,
      size: file.size,
      extension,
      durationSeconds,
      formattedDuration: formatHumanDuration(durationSeconds),
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
    };
  } finally {
    await ctx.close().catch(() => {});
  }
}

/**
 * Computes chunk count and breakdown based on total duration and target chunk duration in minutes.
 */
export function calculateChunks(durationSeconds: number, chunkDurationMinutes: number = 18) {
  const chunkDurationSec = chunkDurationMinutes * 60;
  if (!durationSeconds || durationSeconds <= 0) {
    return { totalChunks: 0, chunkDurationSec, chunksSummary: [] };
  }

  const totalChunks = Math.ceil(durationSeconds / chunkDurationSec);
  const chunksSummary: { index: number; durationSeconds: number; formattedDuration: string }[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkDurationSec;
    const dur = Math.min(chunkDurationSec, durationSeconds - start);
    chunksSummary.push({
      index: i + 1,
      durationSeconds: dur,
      formattedDuration: formatHumanDuration(dur),
    });
  }

  return {
    totalChunks,
    chunkDurationSec,
    chunksSummary,
    lastChunkDuration: chunksSummary[chunksSummary.length - 1]?.durationSeconds || 0,
    formattedLastChunkDuration: chunksSummary[chunksSummary.length - 1]?.formattedDuration || '0s',
  };
}
