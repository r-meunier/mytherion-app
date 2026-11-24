'use client';

import { useEffect, useRef, useState } from 'react';
import { CodexEntry, EntryDetail } from '@/app/types/codex';
import { entryTypeConfig } from '@/app/components/codex/EntryTypeSelector';
import DetailsEditor from '@/app/components/codex/details/DetailsEditor';
import DetailsInline from '@/app/components/codex/details/DetailsInline';
import { normalizeContent } from '@/app/utils/entryContent';
import { mediaService, MEDIA_CONSTRAINTS } from '@/app/services/mediaService';

interface EntrySidebarProps {
  entry: CodexEntry;
  /** Save a change to the details (see DetailsInline). Given: the details are edited in place. */
  onDetailsChange?: (change: (details: EntryDetail[]) => EntryDetail[]) => Promise<boolean>;
  /** Store a new image (a file) or remove it (null). Given: the image can be changed in place. */
  onImageChange?: (file: File | null) => Promise<boolean>;
}

/**
 * Left column of the entry page (docs/codex-entry-model.md): the image, the entry's details and
 * when it was created and last changed. With the callbacks, the image and details are edited where
 * they are shown; without them it is read-only.
 */
export default function EntrySidebar({ entry, onDetailsChange, onImageChange }: EntrySidebarProps) {
  const { details } = normalizeContent(entry.content);

  return (
    <aside className="space-y-6" aria-label="Entry details">
      <EntryImage entry={entry} onChange={onImageChange} />

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="section-heading mb-4">Details</h2>
        {onDetailsChange ? (
          <DetailsInline details={details} onChange={onDetailsChange} />
        ) : (
          <DetailsEditor details={details} readOnly />
        )}
      </section>

      <dl className="text-xs text-white/40 space-y-1 px-1">
        <div className="flex justify-between gap-2">
          <dt>Created</dt>
          <dd className="text-white/60">{new Date(entry.createdAt).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Last updated</dt>
          <dd className="text-white/60">{new Date(entry.updatedAt).toLocaleString()}</dd>
        </div>
      </dl>
    </aside>
  );
}

function EntryImage({ entry, onChange }: { entry: CodexEntry; onChange?: (file: File | null) => Promise<boolean> }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stored = mediaService.getThumbnailUrl(entry.thumbnail);
  const shown = preview ?? stored;

  // Release the local preview once it is no longer shown.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const apply = async (file: File | null) => {
    if (!onChange) return;
    setError(null);
    setBusy(true);
    if (file) setPreview(URL.createObjectURL(file));
    const ok = await onChange(file);
    setBusy(false);
    setPreview(null);
    if (!ok) setError('The image could not be saved.');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const check = mediaService.validateImageFile(file);
    if (!check.valid) {
      setError(check.error || 'Invalid image file');
      return;
    }
    void apply(file);
  };

  const box = 'relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center';

  if (!onChange) {
    return (
      <div className={box}>
        {stored ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={stored} alt={entry.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl opacity-40" aria-hidden="true">{entryTypeConfig[entry.type].icon}</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFile}
        className="hidden"
        aria-label="Entry image"
        disabled={busy}
      />
      <div className={`${box} group`}>
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt={entry.name} className="w-full h-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-6xl opacity-40 group-hover:opacity-20 transition-opacity" aria-hidden="true">
              {entryTypeConfig[entry.type].icon}
            </span>
            <span className="text-xs font-semibold text-white/40 group-hover:text-primary transition-colors">
              Upload an image
            </span>
            <span className="text-[10px] text-white/30">JPEG, PNG, GIF, WebP (max {MEDIA_CONSTRAINTS.MAX_SIZE_LABEL})</span>
          </button>
        )}

        {shown && !busy && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => fileInput.current?.click()} className="btn-pill btn-pill-secondary" title="Change Image">
              <span className="material-symbols-outlined" aria-hidden="true">cached</span>
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Remove the image from this entry?')) void apply(null);
              }}
              className="btn-pill btn-pill-danger"
              title="Remove Image"
            >
              <span className="material-symbols-outlined" aria-hidden="true">delete</span>
              <span>Remove</span>
            </button>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center" role="status" aria-label="Saving image">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
