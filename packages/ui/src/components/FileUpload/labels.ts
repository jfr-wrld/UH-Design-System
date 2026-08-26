import { formatFileSize } from './files.js';

/**
 * Every string the component can put on screen.
 *
 * Gathered into one object because half of them need a number or a name
 * interpolated, and a translator needs to control where that lands. English is
 * the default; the stories pass Malay and Indonesian.
 */
export interface FileUploadLabels {
  prompt: string;
  browse: string;
  maxSize: (size: string) => string;
  formats: (list: string) => string;
  tooLarge: (name: string, max: string, actual: string) => string;
  wrongType: (name: string, list: string) => string;
  tooMany: (max: number) => string;
  remove: (name: string) => string;
  confirmRemove: (name: string) => string;
  confirm: string;
  keep: string;
  uploadingStatus: (count: number) => string;
  uploadedStatus: (count: number) => string;
  failedStatus: (count: number) => string;
  partialStatus: (uploaded: number, failed: number) => string;
  progressLabel: (name: string) => string;
  documentIcon: string;
}

export const DEFAULT_LABELS: FileUploadLabels = {
  prompt: 'Drag files here or browse',
  browse: 'Browse',
  maxSize: (size) => `Maximum file size: ${size}`,
  formats: (list) => `Accepted formats: ${list}`,
  tooLarge: (name, max, actual) =>
    `${name} is ${actual}. Maximum file size: ${max}. Compress it or scan at a lower quality.`,
  wrongType: (name, list) => `${name} is not a supported format. Accepted formats: ${list}.`,
  tooMany: (max) => `You can attach ${max} files at most. Remove one before adding another.`,
  remove: (name) => `Remove ${name}`,
  confirmRemove: (name) => `Remove ${name}?`,
  confirm: 'Remove',
  keep: 'Keep',
  uploadingStatus: (count) => `Uploading ${count} file${count === 1 ? '' : 's'}.`,
  uploadedStatus: (count) => `${count} file${count === 1 ? '' : 's'} uploaded.`,
  failedStatus: (count) => `${count} file${count === 1 ? '' : 's'} failed to upload.`,
  partialStatus: (uploaded, failed) => `${uploaded} uploaded, ${failed} failed.`,
  progressLabel: (name) => `Uploading ${name}`,
  documentIcon: 'Document',
};

/** The two constraint lines under the prompt, with the numbers filled in. */
export function constraintLines(
  labels: FileUploadLabels,
  locale: string,
  maxSize: number | undefined,
  acceptList: string,
): string[] {
  const lines: string[] = [];
  if (acceptList) lines.push(labels.formats(acceptList));
  if (maxSize !== undefined) lines.push(labels.maxSize(formatFileSize(maxSize, locale)));
  return lines;
}
