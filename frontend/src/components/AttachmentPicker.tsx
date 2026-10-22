"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { FaFileAlt, FaPaperclip, FaTimes, FaUpload } from "react-icons/fa";

interface AttachmentPickerProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFileSizeMB?: number;
  maxTotalFileSizeMB?: number;
  className?: string;
}

const fileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentPicker({
  onFilesSelected,
  disabled = false,
  maxFileSizeMB = 10,
  maxTotalFileSizeMB = 10,
  className = "",
}: AttachmentPickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const addFiles = (incoming: File[]) => {
    const maxBytes = maxFileSizeMB * 1024 * 1024;
    const tooLarge = incoming.filter((file) => file.size > maxBytes);
    const valid = incoming.filter((file) => file.size <= maxBytes);
    const totalLimitBytes = maxTotalFileSizeMB * 1024 * 1024;
    const existingBytes = selected.reduce((total, file) => total + file.size, 0);
    const seen = new Set(selected.map(fileKey));
    const accepted: File[] = [];
    const totalLimitExceeded: File[] = [];
    let nextBytes = existingBytes;

    for (const file of valid) {
      const key = fileKey(file);
      if (seen.has(key)) continue;

      if (nextBytes + file.size > totalLimitBytes) {
        totalLimitExceeded.push(file);
        continue;
      }

      seen.add(key);
      accepted.push(file);
      nextBytes += file.size;
    }

    setSelected((prev) => [...prev, ...accepted]);
    const errors = [
      ...(tooLarge.length > 0
        ? [
            `${tooLarge.map((file) => file.name).join(", ")} exceeds ${maxFileSizeMB} MB per file.`,
          ]
        : []),
      ...(totalLimitExceeded.length > 0
        ? [
            `${totalLimitExceeded.map((file) => file.name).join(", ")} would exceed the ${maxTotalFileSizeMB} MB total limit.`,
          ]
        : []),
    ];
    setError(errors.join(" "));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(Array.from(event.target.files));
    }
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const removeFile = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setSelected([]);
    setError("");
    setOpen(false);
  };

  const handleAttach = () => {
    if (selected.length === 0) return;

    onFilesSelected(selected);
    setSelected([]);
    setError("");
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        aria-label="Attach files"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FaPaperclip className="text-2xl" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Attach files"
          className="absolute bottom-full right-0 z-50 mb-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#7769ab] bg-[#4A4170] p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Attach files</h3>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
              dragging
                ? "border-[#3BBFA7] bg-[#3BBFA7]/10"
                : "border-white/25 hover:border-white/50 hover:bg-white/5"
            }`}
          >
            <FaUpload className="text-2xl text-[#3BBFA7]" aria-hidden="true" />
            <span className="text-sm font-medium text-white">
              Choose files or drop them here
            </span>
            <span className="text-xs text-white/60">
              Up to {maxFileSizeMB} MB per file, {maxTotalFileSizeMB} MB total
            </span>
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />

          {error && (
            <p role="alert" className="mt-3 text-xs text-[#F2A488]">
              {error}
            </p>
          )}

          {selected.length > 0 && (
            <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
              {selected.map((file, index) => (
                <li
                  key={fileKey(file)}
                  className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2"
                >
                  <FaFileAlt
                    className="shrink-0 text-[#9EEBDB]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{file.name}</p>
                    <p className="text-xs text-white/60">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(index)}
                    className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAttach}
              disabled={selected.length === 0}
              className="rounded-xl bg-[#3BBFA7] px-4 py-2 text-sm font-semibold text-[#1f1a3d] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
            >
              {selected.length > 0 ? `Attach (${selected.length})` : "Attach"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}