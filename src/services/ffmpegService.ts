import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { AudioFileDetails, ChunkInfo } from '../types';
import { formatFFmpegTime, formatHumanDuration, formatTimestampRange, getFileExtensionAndBase } from '../utils/formatters';

/**
 * Codecs the bundled ffmpeg-core WASM build is known to support for re-encoding.
 * Extensions not listed here fall back to MP3 (libmp3lame), which is always available.
 */
const CODEC_STRATEGY: Record<string, { mimeType: string; encodeArgs: string[] }> = {
  mp3: { mimeType: 'audio/mpeg', encodeArgs: ['-c:a', 'libmp3lame', '-b:a', '192k'] },
  mpeg: { mimeType: 'audio/mpeg', encodeArgs: ['-c:a', 'libmp3lame', '-b:a', '192k'] },
  mpg: { mimeType: 'audio/mpeg', encodeArgs: ['-c:a', 'libmp3lame', '-b:a', '192k'] },
  mpga: { mimeType: 'audio/mpeg', encodeArgs: ['-c:a', 'libmp3lame', '-b:a', '192k'] },
  m4a: { mimeType: 'audio/mp4', encodeArgs: ['-c:a', 'aac', '-b:a', '192k'] },
  aac: { mimeType: 'audio/aac', encodeArgs: ['-c:a', 'aac', '-b:a', '192k'] },
  mp4: { mimeType: 'audio/mp4', encodeArgs: ['-c:a', 'aac', '-b:a', '192k'] },
  wav: { mimeType: 'audio/wav', encodeArgs: ['-c:a', 'pcm_s16le'] },
  aiff: { mimeType: 'audio/aiff', encodeArgs: ['-c:a', 'pcm_s16le'] },
  aif: { mimeType: 'audio/aiff', encodeArgs: ['-c:a', 'pcm_s16le'] },
  flac: { mimeType: 'audio/flac', encodeArgs: ['-c:a', 'flac'] },
  ogg: { mimeType: 'audio/ogg', encodeArgs: ['-c:a', 'libvorbis', '-q:a', '5'] },
  oga: { mimeType: 'audio/ogg', encodeArgs: ['-c:a', 'libvorbis', '-q:a', '5'] },
  opus: { mimeType: 'audio/opus', encodeArgs: ['-c:a', 'libopus', '-b:a', '128k'] },
  webm: { mimeType: 'audio/webm', encodeArgs: ['-c:a', 'libopus', '-b:a', '128k'] },
  mka: { mimeType: 'audio/x-matroska', encodeArgs: ['-c:a', 'libopus', '-b:a', '128k'] },
};

const FALLBACK_STRATEGY = { extension: 'mp3', mimeType: 'audio/mpeg', encodeArgs: ['-c:a', 'libmp3lame', '-b:a', '192k'] };

export function getCodecStrategy(extension: string): { extension: string; mimeType: string; encodeArgs: string[] } {
  const strategy = CODEC_STRATEGY[extension];
  if (!strategy) return FALLBACK_STRATEGY;
  return { extension, ...strategy };
}

let ffmpegInstance: FFmpeg | null = null;
let isLoaded = false;

/**
 * Initializes and loads FFmpeg WASM instance in the browser.
 */
export async function getFFmpegInstance(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) {
    return ffmpegInstance;
  }

  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }

  if (onLog) {
    ffmpegInstance.on('log', ({ message }) => {
      onLog(message);
    });
  }

  const cdnProviders = [
    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
  ];

  let lastError: Error | null = null;

  for (const baseURL of cdnProviders) {
    try {
      if (onLog) onLog(`Loading FFmpeg WASM core from ${baseURL}...`);
      
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

      await ffmpegInstance.load({
        coreURL,
        wasmURL,
      });

      isLoaded = true;
      if (onLog) onLog('FFmpeg WASM initialized successfully!');
      return ffmpegInstance;
    } catch (err) {
      lastError = err as Error;
      if (onLog) onLog(`Failed loading from ${baseURL}, trying fallback CDN...`);
    }
  }

  throw new Error(
    `Failed to load FFmpeg WASM engine (${lastError?.message || 'Network error'}). Please check internet connection.`
  );
}

/**
 * Splits an audio file into fixed minute chunks using FFmpeg WASM.
 */
export async function splitAudioFile(
  fileDetails: AudioFileDetails,
  chunkDurationMinutes: number = 18,
  onProgress: (percent: number, currentChunk: number, totalChunks: number, logMsg: string) => void
): Promise<ChunkInfo[]> {
  const file = fileDetails.file;
  const totalDuration = fileDetails.durationSeconds;
  const chunkDurationSec = chunkDurationMinutes * 60;
  const totalChunks = Math.ceil(totalDuration / chunkDurationSec);

  const { baseName, extension } = getFileExtensionAndBase(file.name);
  const inputFilename = `input_${Date.now()}.${extension}`;
  const reEncodeStrategy = getCodecStrategy(extension);
  const copyMimeType = CODEC_STRATEGY[extension]?.mimeType || 'audio/mpeg';

  onProgress(2, 0, totalChunks, 'Initializing FFmpeg WASM audio engine...');
  const ffmpeg = await getFFmpegInstance((msg) => {
    // optional verbose log hook
  });

  onProgress(5, 0, totalChunks, `Loading "${file.name}" (${fileDetails.formattedDuration}) into browser memory...`);
  
  // Write file to FFmpeg virtual FS
  const fileData = await fetchFile(file);
  await ffmpeg.writeFile(inputFilename, fileData);

  const createdChunks: ChunkInfo[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const startSec = i * chunkDurationSec;
    const currentChunkDur = Math.min(chunkDurationSec, totalDuration - startSec);
    const chunkNum = i + 1;
    const paddedNum = chunkNum.toString().padStart(2, '0');
    const outputFilename = `${baseName}_part${paddedNum}.${extension}`;

    const progressBase = 10 + Math.round((i / totalChunks) * 80);
    onProgress(
      progressBase,
      chunkNum,
      totalChunks,
      `Splitting chunk ${chunkNum} of ${totalChunks} (${formatHumanDuration(currentChunkDur)})...`
    );

    const startTimeFormatted = formatFFmpegTime(startSec);
    const durationFormatted = formatFFmpegTime(currentChunkDur);

    let chunkBlob: Blob | null = null;

    // Try fast stream copy first (-c copy)
    try {
      await ffmpeg.exec([
        '-ss', startTimeFormatted,
        '-i', inputFilename,
        '-t', durationFormatted,
        '-c', 'copy',
        '-avoid_negative_ts', 'make_zero',
        outputFilename,
      ]);

      const data = await ffmpeg.readFile(outputFilename);
      const uint8Array = new Uint8Array(data as ArrayBuffer);
      
      if (uint8Array.byteLength > 100) {
        chunkBlob = new Blob([uint8Array], { type: copyMimeType });
      } else {
        await ffmpeg.deleteFile(outputFilename).catch(() => {});
      }
    } catch {
      // stream copy failed, proceed to re-encode fallback below
    }

    let finalFilename = outputFilename;

    // Fallback re-encode if stream copy created invalid or zero-byte file.
    // If the source extension has no confirmed WASM encoder, re-encode to MP3 instead.
    if (!chunkBlob) {
      onProgress(
        progressBase + 1,
        chunkNum,
        totalChunks,
        `Re-encoding chunk ${chunkNum}/${totalChunks} for clean audio boundary...`
      );

      finalFilename = `${baseName}_part${paddedNum}.${reEncodeStrategy.extension}`;

      await ffmpeg.exec([
        '-ss', startTimeFormatted,
        '-i', inputFilename,
        '-t', durationFormatted,
        ...reEncodeStrategy.encodeArgs,
        finalFilename,
      ]);

      const data = await ffmpeg.readFile(finalFilename);
      const uint8Array = new Uint8Array(data as ArrayBuffer);
      chunkBlob = new Blob([uint8Array], { type: reEncodeStrategy.mimeType });
    }

    // Clean up temporary output file in FFmpeg FS
    await ffmpeg.deleteFile(finalFilename).catch(() => {});

    createdChunks.push({
      index: chunkNum,
      filename: finalFilename,
      startTimeSeconds: startSec,
      durationSeconds: currentChunkDur,
      formattedRange: formatTimestampRange(startSec, currentChunkDur),
      formattedDuration: formatHumanDuration(currentChunkDur),
      blob: chunkBlob,
      size: chunkBlob.size,
    });
  }

  // Clean up input file from FFmpeg FS
  await ffmpeg.deleteFile(inputFilename).catch(() => {});

  onProgress(92, totalChunks, totalChunks, 'All audio chunks created! Preparing ZIP file...');
  return createdChunks;
}
