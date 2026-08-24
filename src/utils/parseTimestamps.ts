export interface ParsedTimeRange {
  startSec: number;
  endSec: number;
}

// Matches "3.16-5:14", "8.02 - 8.55", "24.22-24.54", and precise variants
// with milliseconds like "3:16.245-5:14.000" — mm.ss or mm:ss on either side
// of the dash (separators used interchangeably), with an optional .mmm tail
// for sub-second precision. Anything else on the line (chat sender names,
// dates, message timestamps) is ignored.
const RANGE_REGEX = /(\d{1,3})[.:](\d{2})(?:\.(\d{1,3}))?\s*-\s*(\d{1,3})[.:](\d{2})(?:\.(\d{1,3}))?/;

function msFraction(ms: string | undefined): number {
  return ms ? Number(ms) / Math.pow(10, ms.length) : 0;
}

/**
 * Parses one time-range per line (mm.ss-mm.ss / mm:ss-mm:ss, optionally with
 * .mmm precision) out of pasted text, e.g. lines copied from a chat export
 * or from the Timestamp Finder's mark list. Lines without a matching
 * pattern, or with end <= start, are skipped.
 */
export function parseTimestampRanges(text: string): ParsedTimeRange[] {
  const ranges: ParsedTimeRange[] = [];

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(RANGE_REGEX);
    if (!match) continue;

    const [, startMin, startSec, startMs, endMin, endSec, endMs] = match;
    const startTotal = Number(startMin) * 60 + Number(startSec) + msFraction(startMs);
    const endTotal = Number(endMin) * 60 + Number(endSec) + msFraction(endMs);

    if (Number.isNaN(startTotal) || Number.isNaN(endTotal) || endTotal <= startTotal) continue;
    ranges.push({ startSec: startTotal, endSec: endTotal });
  }

  return ranges;
}

export type TimeInputResult = { kind: 'single'; sec: number } | { kind: 'range'; startSec: number; endSec: number };

/**
 * Parses a single toolbar time-field value: either a plain "mm:ss" (or bare
 * seconds), or a pasted full range ("12.08-13.18") which sets both ends at once.
 */
export function parseTimeOrRangeInput(raw: string): TimeInputResult | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const ranges = parseTimestampRanges(trimmed);
  if (ranges.length === 1) {
    return { kind: 'range', startSec: ranges[0].startSec, endSec: ranges[0].endSec };
  }

  const parts = trimmed.split(':').map(Number);
  if (parts.some(Number.isNaN)) return null;
  const sec = parts.length === 2 ? parts[0] * 60 + parts[1] : Number(trimmed);
  if (Number.isNaN(sec)) return null;

  return { kind: 'single', sec };
}
