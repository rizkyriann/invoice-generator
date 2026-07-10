import { useRef, useState, type DragEvent } from 'react';

interface FileDropzoneProps {
  label?: string;
  accept?: string;
  error?: string;
  disabled?: boolean;
  preview?: string;
  onDrop: (file: File) => void;
}

export default function FileDropzone({
  label,
  accept = 'image/*',
  error,
  disabled = false,
  preview,
  onDrop,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onDrop(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onDrop(file);
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <p className="text-sm font-medium text-text-secondary">{label}</p>
      )}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? 'border-primary bg-primary-light'
            : error
              ? 'border-danger bg-danger-light'
              : 'border-border hover:border-primary'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Uploaded preview"
            className="max-h-20 max-w-28 rounded object-contain"
          />
        ) : (
          <>
            <svg
              className="h-8 w-8 text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
            </svg>
            <p className="text-xs text-text-tertiary">
              Drop file here or click to browse
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
