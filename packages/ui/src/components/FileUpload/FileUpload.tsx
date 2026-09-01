import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ForwardedRef,
} from 'react';
import { UploadCloud, Page } from '@tailgrids/icons';

import { DEFAULT_LABELS, constraintLines, type FileUploadLabels } from './labels.js';
import { CloseIcon } from '../../lib/icons.js';
import { ProgressBar } from '../ProgressBar/ProgressBar.js';
import {
  describeAccept,
  formatFileSize,
  isImage,
  matchesAccept,
  type Rejection,
  type UploadFile,
} from './files.js';

export interface FileUploadProps {
  /** Field label shown above the drop area; also half of the input's accessible name. */
  label: string;
  /** Handed every file that passed the size and format checks. */
  onUpload?: ((files: File[]) => void) | undefined;
  /** Called with the id of a row the pilgrim removed. */
  onRemove?: ((id: string) => void) | undefined;
  /** The rows to show. Owned by the consumer, who runs the actual upload. */
  value?: readonly UploadFile[] | undefined;
  /** Same syntax as the native `accept` attribute - MIME types, `image/*`, or `.ext`, comma-separated. Enforced again in JS, since drag-and-drop bypasses the browser's own filter. */
  accept?: string | undefined;
  /** In bytes. Counted in binary steps, so 5 * 1024 * 1024 reads back as 5 MB. */
  maxSize?: number | undefined;
  /** Caps the row count, existing `value` entries included. Whatever would push past it is refused, not silently trimmed. */
  maxFiles?: number | undefined;
  /** Allows more than one file per pick or drop. Off by default - most document fields (e.g. one passport photo) take exactly one file. */
  multiple?: boolean | undefined;
  /** Supporting copy under the drop area. Replaced by `errorMessage` when both are set, so only one message shows at a time. */
  helperText?: string | undefined;
  /** Set by the consumer, for a problem with the set as a whole. */
  errorMessage?: string | undefined;
  /** Blocks the picker, drag-and-drop, and removal. The input stays in the tab order; only the interaction is refused. */
  disabled?: boolean | undefined;
  /** BCP 47 locale used to format file sizes via `Intl.NumberFormat` (5 MB vs 5 Mo). Does not translate the labels themselves - pass `labels` for that. */
  locale?: string | undefined;
  /** Overrides merged over `DEFAULT_LABELS`. Required for anything beyond English. */
  labels?: Partial<FileUploadLabels> | undefined;
  /** Extra class appended to the root element, after `uh-upload`. */
  className?: string | undefined;
}

function UploadIcon() {
  return <UploadCloud aria-hidden="true" focusable="false" />;
}

function DocumentIcon() {
  return <Page aria-hidden="true" focusable="false" />;
}

/**
 * An image preview.
 *
 * The object URL is written straight to the node and revoked on the way out,
 * rather than being put into state: a blob URL that outlived its row would
 * hold the whole file in memory for as long as the page stayed open.
 */
function Thumbnail({ file, url }: { file?: File | undefined; url?: string | undefined }) {
  const ref = useRef<HTMLImageElement | null>(null);

  useLayoutEffect(() => {
    const image = ref.current;
    if (!image) return undefined;
    if (url) {
      image.src = url;
      return undefined;
    }
    if (!file) return undefined;
    const objectUrl = URL.createObjectURL(file);
    image.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, url]);

  /* Decorative: the file name sits beside it and says the same thing better. */
  return <img ref={ref} alt="" className="uh-upload__thumb" />;
}

function FileUploadImpl(props: FileUploadProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    onUpload,
    onRemove,
    value = [],
    accept,
    maxSize,
    maxFiles,
    multiple = false,
    helperText,
    errorMessage,
    disabled = false,
    locale = 'en',
    labels: labelOverrides,
    className,
  } = props;

  const labels: FileUploadLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const labelId = `${reactId}-label`;
  const promptId = `${reactId}-prompt`;
  const constraintsId = `${reactId}-constraints`;
  const messageId = `${reactId}-message`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);
  const nextId = useRef(0);
  /* Depth counter: dragging over a child fires dragleave on the parent, and a
     plain boolean would flicker the whole time the pointer crossed the icon. */
  const dragDepth = useRef(0);

  const acceptList = describeAccept(accept);
  const constraints = constraintLines(labels, locale, maxSize, acceptList);

  const uploading = value.filter((file) => file.status === 'uploading').length;
  const uploaded = value.filter((file) => file.status === 'success').length;
  const failed = value.filter((file) => file.status === 'error').length + rejections.length;

  const state = dragging
    ? 'dragging'
    : uploading > 0
      ? 'uploading'
      : failed > 0 && uploaded > 0
        ? 'partial'
        : failed > 0
          ? 'error'
          : uploaded > 0
            ? 'success'
            : 'idle';

  /*
   * One sentence for the whole widget rather than a running commentary. A
   * region that announced every percent would talk over everything else on the
   * page for the length of the upload; the percentage lives on the progress
   * bar, where it is read on request.
   */
  const liveMessage =
    uploading > 0
      ? labels.uploadingStatus(uploading)
      : failed > 0 && uploaded > 0
        ? labels.partialStatus(uploaded, failed)
        : failed > 0
          ? labels.failedStatus(failed)
          : uploaded > 0
            ? labels.uploadedStatus(uploaded)
            : '';

  function reject(file: File, reason: Rejection['reason'], message: string): Rejection {
    nextId.current += 1;
    return { id: `rejected-${nextId.current}`, name: file.name, size: file.size, reason, message };
  }

  /** Splits what arrived into what may be uploaded and what may not, and why. */
  function accepting(incoming: File[]) {
    const accepted: File[] = [];
    const refused: Rejection[] = [];
    let room =
      maxFiles === undefined ? Number.POSITIVE_INFINITY : Math.max(0, maxFiles - value.length);

    for (const file of incoming) {
      if (!matchesAccept(file, accept)) {
        refused.push(reject(file, 'wrong-type', labels.wrongType(file.name, acceptList)));
        continue;
      }
      if (maxSize !== undefined && file.size > maxSize) {
        refused.push(
          reject(
            file,
            'too-large',
            labels.tooLarge(
              file.name,
              formatFileSize(maxSize, locale),
              formatFileSize(file.size, locale),
            ),
          ),
        );
        continue;
      }
      if (room <= 0) {
        refused.push(reject(file, 'too-many', labels.tooMany(maxFiles!)));
        continue;
      }
      room -= 1;
      accepted.push(file);
    }
    return { accepted, refused };
  }

  function receive(incoming: File[]) {
    if (disabled || incoming.length === 0) return;
    const list = multiple ? incoming : incoming.slice(0, 1);
    const { accepted, refused } = accepting(list);
    setRejections(refused);
    if (accepted.length > 0) onUpload?.(accepted);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    receive([...(event.target.files ?? [])]);
    /* Cleared so that choosing the same file twice in a row still fires. */
    event.target.value = '';
  }

  function onDragEnter(event: DragEvent<HTMLElement>) {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function onDragOver(event: DragEvent<HTMLElement>) {
    if (disabled) return;
    /* Without this the browser navigates to the dropped file instead. */
    event.preventDefault();
  }

  function onDragLeave(event: DragEvent<HTMLElement>) {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    receive([...(event.dataTransfer?.files ?? [])]);
  }

  function remove(file: UploadFile) {
    /* Only a finished upload is worth a second question: cancelling one that is
       still running, or clearing one that failed, loses nothing. */
    if (file.status === 'success' && confirming !== file.id) {
      setConfirming(file.id);
      return;
    }
    setConfirming(null);
    onRemove?.(file.id);
  }

  const message = errorMessage ?? helperText;

  return (
    <div
      className={['uh-upload', className].filter(Boolean).join(' ')}
      data-state={state}
      data-disabled={disabled ? 'true' : undefined}
    >
      <span className="uh-upload__label" id={labelId}>
        {label}
      </span>

      {/*
       * A label wrapping a visually hidden file input, rather than a div
       * pretending to be a button. The input is a real control, so it is in the
       * tab order on its own, Enter and Space open the picker with no key
       * handling of ours, and the whole area is clickable because it is a
       * label. The ring is drawn on the area through :focus-within.
       */}
      <label
        className="uh-upload__drop"
        htmlFor={inputId}
        data-dragging={dragging ? 'true' : undefined}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <span className="uh-upload__drop-icon" aria-hidden="true">
          <UploadIcon />
        </span>
        <span className="uh-upload__prompt" id={promptId}>
          {labels.prompt}
        </span>
        {constraints.length > 0 ? (
          <span className="uh-upload__constraints" id={constraintsId}>
            {constraints.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        ) : null}

        <input
          ref={(element) => {
            inputRef.current = element;
            if (typeof ref === 'function') ref(element);
            else if (ref) ref.current = element;
          }}
          id={inputId}
          className="uh-sr-only"
          type="file"
          aria-labelledby={`${labelId} ${promptId}`}
          aria-describedby={
            [constraints.length > 0 ? constraintsId : undefined, message ? messageId : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-invalid={errorMessage ? true : undefined}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={onInputChange}
        />
      </label>

      {message ? (
        <p id={messageId} className="uh-upload__message" role={errorMessage ? 'alert' : undefined}>
          {message}
        </p>
      ) : null}

      {value.length > 0 || rejections.length > 0 ? (
        <ul className="uh-upload__list">
          {value.map((file) => (
            <li key={file.id} className="uh-upload__item" data-status={file.status}>
              <span className="uh-upload__preview" aria-hidden="true">
                {isImage(file.type) && (file.url || file.file) ? (
                  <Thumbnail file={file.file} url={file.url} />
                ) : (
                  <span className="uh-upload__doc">
                    <DocumentIcon />
                  </span>
                )}
              </span>

              <span className="uh-upload__detail">
                <span className="uh-upload__name">{file.name}</span>
                <span className="uh-upload__size">{formatFileSize(file.size, locale)}</span>

                {file.status === 'uploading' ? (
                  <span className="uh-upload__progress">
                    <ProgressBar
                      label={labels.progressLabel(file.name)}
                      value={file.progress}
                      indeterminate={file.progress === undefined}
                    />
                  </span>
                ) : null}

                {file.status === 'error' && file.error ? (
                  <span className="uh-upload__error">{file.error}</span>
                ) : null}
              </span>

              {confirming === file.id ? (
                <span className="uh-upload__confirm">
                  <span className="uh-upload__confirm-question">
                    {labels.confirmRemove(file.name)}
                  </span>
                  <button
                    type="button"
                    className="uh-upload__confirm-yes"
                    onClick={() => remove(file)}
                  >
                    {labels.confirm}
                  </button>
                  <button
                    type="button"
                    className="uh-upload__confirm-no"
                    onClick={() => setConfirming(null)}
                  >
                    {labels.keep}
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="uh-upload__remove"
                  aria-label={labels.remove(file.name)}
                  disabled={disabled}
                  onClick={() => remove(file)}
                >
                  <CloseIcon />
                </button>
              )}
            </li>
          ))}

          {rejections.map((rejection) => (
            <li key={rejection.id} className="uh-upload__item" data-status="error">
              <span className="uh-upload__preview" aria-hidden="true">
                <span className="uh-upload__doc">
                  <DocumentIcon />
                </span>
              </span>
              <span className="uh-upload__detail">
                <span className="uh-upload__name">{rejection.name}</span>
                {/* Says what was wrong and what to do about it, per PRD 8.3.9. */}
                <span className="uh-upload__error">{rejection.message}</span>
              </span>
              <button
                type="button"
                className="uh-upload__remove"
                aria-label={labels.remove(rejection.name)}
                onClick={() =>
                  setRejections((current) => current.filter((item) => item.id !== rejection.id))
                }
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Spoken, not shown: the rows above already say all of this on screen. */}
      <span className="uh-sr-only" role="status">
        {liveMessage}
      </span>
    </div>
  );
}

export const FileUpload = /* @__PURE__ */ forwardRef(FileUploadImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  FileUpload.displayName = 'FileUpload';
}
