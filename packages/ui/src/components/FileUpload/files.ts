/**
 * Reading and describing files, kept apart from the component so the rules can
 * be tested without a DOM.
 */

/** The shape a consumer hands back while and after an upload runs. */
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  /** MIME type. Drives whether a thumbnail or a document icon is shown. */
  type: string;
  status: 'uploading' | 'success' | 'error';
  /** 0 to 100. Left out for an upload with no measurable progress. */
  progress?: number | undefined;
  /** Why it failed. Shown exactly as written; this component invents no wording. */
  error?: string | undefined;
  /** A preview or final URL. Takes precedence over the local file. */
  url?: string | undefined;
  /** The original file, so an image can be previewed before the server replies. */
  file?: File | undefined;
}

export type RejectionReason = 'too-large' | 'wrong-type' | 'too-many';

export interface Rejection {
  id: string;
  name: string;
  size: number;
  reason: RejectionReason;
  message: string;
}

/**
 * Human-readable file size.
 *
 * Binary steps: a limit written as `5 * 1024 * 1024` is the one developers
 * actually type, and reading it back as anything other than "5 MB" would make
 * the message disagree with the prop that produced it. The number itself goes
 * through Intl, so Indonesian gets its decimal comma.
 */
export function formatFileSize(bytes: number, locale: string): string {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
  let value = Math.max(0, bytes);
  let step = 0;
  while (value >= 1024 && step < units.length - 1) {
    value /= 1024;
    step += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[step],
    unitDisplay: 'short',
    /* Whole bytes; one decimal once the number has been divided down. */
    maximumFractionDigits: step === 0 ? 0 : 1,
  }).format(value);
}

const patterns = (accept: string): string[] =>
  accept
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

/** Matches the same three forms a browser's `accept` attribute takes. */
export function matchesAccept(file: { name: string; type: string }, accept?: string): boolean {
  if (!accept) return true;
  const list = patterns(accept);
  if (list.length === 0) return true;

  return list.some((pattern) => {
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1));
    return file.type.toLowerCase() === pattern.toLowerCase();
  });
}

/**
 * Turns an accept attribute into something worth putting in an error message.
 * "image/jpeg,.png,application/pdf" reads back as "JPEG, PNG, PDF".
 */
export function describeAccept(accept?: string): string {
  if (!accept) return '';
  const names = patterns(accept).map((pattern) => {
    if (pattern.startsWith('.')) return pattern.slice(1).toUpperCase();
    if (pattern.endsWith('/*')) return pattern.slice(0, -2).toUpperCase();
    return (pattern.split('/')[1] ?? pattern).toUpperCase();
  });
  return [...new Set(names)].join(', ');
}

export const isImage = (type: string): boolean => type.startsWith('image/');
