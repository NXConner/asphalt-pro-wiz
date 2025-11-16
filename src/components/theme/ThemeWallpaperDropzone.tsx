import { Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface ThemeWallpaperDropzoneProps {
  onSelectFile: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  busy?: boolean;
  label?: string;
  description?: string;
}

export function ThemeWallpaperDropzone({
  onSelectFile,
  accept = 'image/png,image/jpeg,image/webp',
  disabled = false,
  busy = false,
  label = 'Drop wallpapers or browse files',
  description = 'PNG, JPG, or WebP up to 8 MB. Landscape 2560x1440 recommended.',
}: ThemeWallpaperDropzoneProps) {
  const [isDragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files?: FileList | null) => {
      if (!files?.length || disabled || busy) return;
      const [file] = files;
      if (file) {
        onSelectFile(file);
      }
    },
    [busy, disabled, onSelectFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
      if (disabled || busy) return;
      handleFiles(event.dataTransfer?.files);
    },
    [busy, disabled, handleFiles],
  );

  const preventDefault = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="space-y-2">
      <label className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
        {label}
      </label>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          'relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-6 text-center transition',
          isDragActive && 'border-white/60 bg-black/30',
          (disabled || busy) && 'cursor-not-allowed opacity-50',
        )}
        onDragEnter={(event) => {
          preventDefault(event);
          if (disabled || busy) return;
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          preventDefault(event);
          setDragActive(false);
        }}
        onDragOver={preventDefault}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        aria-disabled={disabled || busy}
      >
        <Upload className="mb-3 h-6 w-6 text-white/70" aria-hidden />
        <p className="text-sm font-semibold text-white">{busy ? 'Processing…' : 'Drag & drop wallpaper'}</p>
        <p className="mt-2 text-xs text-white/60">{description}</p>
        <p className="mt-4 rounded-full border border-white/20 px-4 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-white/80">
          Browse Files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          disabled={disabled || busy}
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
    </div>
  );
}

