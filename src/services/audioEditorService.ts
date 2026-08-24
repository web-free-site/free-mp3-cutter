import { fetchFile } from '@ffmpeg/util';
import { AudioFileDetails, ChunkInfo, EditorClip, SpoilSettings } from '../types';
import { getFFmpegInstance, getCodecStrategy } from './ffmpegService';
import { formatFFmpegTime, formatHumanDuration, formatTimestampRange, getFileExtensionAndBase } from '../utils/formatters';

/**
 * Builds the FFmpeg args for one clip's audio filtering: gain plus the optional
 * "Protect Original" degradations (noise/muffle/wobble). Noise needs an extra
 * lavfi input mixed in via filter_complex; the rest run as a plain -af chain.
 */
function buildClipFilterArgs(gainDb: number, durationFormatted: string, spoil?: SpoilSettings): string[] {
  const chain: string[] = [];
  if (gainDb !== 0) chain.push(`volume=${gainDb}dB`);

  const spoilOn = spoil?.enabled ?? false;
  if (spoilOn && spoil!.muffleAmount > 0) {
    const cutoff = Math.round(12000 - (spoil!.muffleAmount / 100) * 10500);
    chain.push(`lowpass=f=${cutoff}`);
  }
  if (spoilOn && spoil!.wobbleAmount > 0) {
    const depth = (spoil!.wobbleAmount / 100) * 0.9;
    chain.push(`vibrato=f=6:d=${depth.toFixed(2)}`);
  }

  if (spoilOn && spoil!.noiseAmount > 0) {
    const amp = (spoil!.noiseAmount / 100) * 0.5;
    const mainLabel = chain.length > 0 ? `[0:a]${chain.join(',')}[m]` : `[0:a]anull[m]`;
    const filterComplex = `${mainLabel};[1:a]volume=${amp.toFixed(3)}[n];[m][n]amix=inputs=2:duration=first:normalize=0[aout]`;
    return [
      '-f', 'lavfi', '-t', durationFormatted, '-i', 'anoisesrc=color=pink:amplitude=1',
      '-filter_complex', filterComplex,
      '-map', '[aout]',
    ];
  }

  return chain.length > 0 ? ['-af', chain.join(',')] : [];
}

/**
 * Renders manually-picked clips (trim + gain) via FFmpeg WASM, optionally
 * concatenating them into a single output file.
 */
export async function exportClips(
  fileDetails: AudioFileDetails,
  clips: EditorClip[],
  joinIntoOne: boolean,
  spoil: SpoilSettings | undefined,
  onProgress: (percent: number, currentIndex: number, total: number, logMsg: string) => void
): Promise<ChunkInfo[]> {
  if (clips.length === 0) {
    throw new Error('No clips to export. Select a range on the waveform first.');
  }

  const file = fileDetails.file;
  const { baseName, extension } = getFileExtensionAndBase(file.name);
  const strategy = getCodecStrategy(extension);
  const inputFilename = `edit_input_${Date.now()}.${extension}`;

  onProgress(2, 0, clips.length, 'Initializing FFmpeg WASM audio engine...');
  const ffmpeg = await getFFmpegInstance();

  onProgress(5, 0, clips.length, `Loading "${file.name}" into browser memory...`);
  const fileData = await fetchFile(file);
  await ffmpeg.writeFile(inputFilename, fileData);

  const partFilenames: string[] = [];
  const clipResults: ChunkInfo[] = [];

  try {
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const durationSec = Math.max(0, clip.endSec - clip.startSec);
      const progressBase = 10 + Math.round((i / clips.length) * 70);
      onProgress(progressBase, i + 1, clips.length, `Rendering clip ${i + 1} of ${clips.length} (${clip.label})...`);

      const startFormatted = formatFFmpegTime(clip.startSec);
      const durationFormatted = formatFFmpegTime(durationSec);
      const partFilename = `edit_part${i.toString().padStart(2, '0')}.${strategy.extension}`;
      const filterArgs = buildClipFilterArgs(clip.gainDb, durationFormatted, spoil);

      await ffmpeg.exec([
        '-ss', startFormatted,
        '-t', durationFormatted,
        '-i', inputFilename,
        ...filterArgs,
        ...strategy.encodeArgs,
        partFilename,
      ]);

      const data = await ffmpeg.readFile(partFilename);
      const uint8Array = new Uint8Array(data as ArrayBuffer);
      const blob = new Blob([uint8Array], { type: strategy.mimeType });
      partFilenames.push(partFilename);

      clipResults.push({
        index: i + 1,
        filename: `${baseName}_${clip.label}.${strategy.extension}`,
        startTimeSeconds: clip.startSec,
        durationSeconds: durationSec,
        formattedRange: formatTimestampRange(clip.startSec, durationSec),
        formattedDuration: formatHumanDuration(durationSec),
        blob,
        size: blob.size,
      });
    }

    if (!joinIntoOne || clipResults.length === 1) {
      onProgress(92, clips.length, clips.length, 'All clips rendered!');
      return clipResults;
    }

    onProgress(85, clips.length, clips.length, 'Joining clips into a single file...');
    const concatListFilename = 'edit_concat_list.txt';
    const concatListContent = partFilenames.map((name) => `file '${name}'`).join('\n');
    await ffmpeg.writeFile(concatListFilename, new TextEncoder().encode(concatListContent));

    const joinedFilename = `edit_joined.${strategy.extension}`;
    await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', concatListFilename, '-c', 'copy', joinedFilename]);

    const joinedData = await ffmpeg.readFile(joinedFilename);
    const joinedBlob = new Blob([new Uint8Array(joinedData as ArrayBuffer)], { type: strategy.mimeType });
    const totalDuration = clips.reduce((acc, c) => acc + Math.max(0, c.endSec - c.startSec), 0);

    await ffmpeg.deleteFile(concatListFilename).catch(() => {});
    await ffmpeg.deleteFile(joinedFilename).catch(() => {});

    onProgress(92, clips.length, clips.length, 'All clips joined and rendered!');

    return [
      {
        index: 1,
        filename: `${baseName}_edited.${strategy.extension}`,
        startTimeSeconds: clips[0].startSec,
        durationSeconds: totalDuration,
        formattedRange: `${clipResults.length} clips joined`,
        formattedDuration: formatHumanDuration(totalDuration),
        blob: joinedBlob,
        size: joinedBlob.size,
      },
    ];
  } finally {
    await ffmpeg.deleteFile(inputFilename).catch(() => {});
    for (const name of partFilenames) {
      await ffmpeg.deleteFile(name).catch(() => {});
    }
  }
}
