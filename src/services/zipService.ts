import JSZip from 'jszip';
import { ChunkInfo } from '../types';

/**
 * Bundles created chunk blobs into a ZIP file and triggers browser download.
 */
export async function createAndDownloadZip(
  baseFilename: string,
  chunks: ChunkInfo[],
  onZipProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  // Add each chunk blob to the ZIP root
  for (const chunk of chunks) {
    if (chunk.blob) {
      zip.file(chunk.filename, chunk.blob);
    }
  }

  // Add a small readme metadata file inside the zip for clarity
  const readmeContent = `Audio Chunker Export
===================
Original File Base: ${baseFilename}
Total Chunks: ${chunks.length}
Generated Date: ${new Date().toLocaleString()}

Chunk List:
${chunks.map((c) => `- ${c.filename} | Duration: ${c.formattedDuration} | Time Range: ${c.formattedRange}`).join('\n')}

Processing completed 100% client-side in browser memory.
`;
  zip.file('chunk_manifest.txt', readmeContent);

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'STORE', // Audio is already compressed, STORE is much faster
    },
    (metadata) => {
      if (onZipProgress) {
        onZipProgress(Math.round(metadata.percent));
      }
    }
  );

  // Trigger browser download
  const cleanBaseName = baseFilename.replace(/[^a-zA-Z0-9_-]/g, '_');
  const zipFilename = `${cleanBaseName}_chunks.zip`;
  triggerBlobDownload(zipBlob, zipFilename);

  return zipBlob;
}

/**
 * Triggers browser download for any blob object.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
