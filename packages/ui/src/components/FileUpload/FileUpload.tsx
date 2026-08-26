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

import { DEFAULT_LABELS, constraintLines, type FileUploadLabels } from './labels.js';
import {
  describeAccept,
  formatFileSize,
  isImage,
  matchesAccept,
  type Rejection,
  type UploadFile,
} from './files.js';

export interface FileUploadProps {
  label: string;
  /** Handed every file that passed the size and format checks. */
  onUpload?: ((files: File[]) => void) | undefined;
  /** Called with the id of a row the pilgrim removed. */
  onRemove?: ((id: string) => void) | undefined;
  /** The rows to show. Owned by the consumer, who runs the actual upload. */
  value?: readonly UploadFile[] | undefined;
  accept?: string | undefined;
  /** In bytes. Counted in binary steps, so 5 * 1024 * 1024 reads back as 5 MB. */
  maxSize?: number | undefined;
  maxFiles?: number | undefined;
  multiple?: boolean | undefined;
  helperText?: string | undefined;
  /** Set by the consumer, for a problem with the set as a whole. */
  errorMessage?: string | undefined;
  disabled?: boolean | undefined;
  locale?: string | undefined;
  labels?: Partial<FileUploadLabels> | undefined;
  className?: string | undefined;
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M14 3.5H7.5a2 2 0 00-2 2v13a2 2 0 002 2h9a2 2 0 002-2V8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M13.75 3.75V8.5h4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
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
                  <span
                    className="uh-upload__progress"
                    role="progressbar"
                    aria-label={labels.progressLabel(file.name)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    {...(file.progress === undefined ? {} : { 'aria-valuenow': file.progress })}
                  >
                    <span
                      className="uh-upload__progress-fill"
                      style={{ inlineSize: `${file.progress ?? 0}%` }}
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
                  <RemoveIcon />
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
                <RemoveIcon />
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

export const FileUpload = forwardRef(FileUploadImpl);
FileUpload.displayName = 'FileUpload';
