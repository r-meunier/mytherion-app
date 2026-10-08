'use client';

import { CodexEntry } from '@/app/types/codex';
import { entryTypeConfig } from '@/app/components/codex/EntryTypeSelector';
import DetailsEditor from '@/app/components/codex/details/DetailsEditor';
import { normalizeContent } from '@/app/utils/entryContent';
import { mediaService } from '@/app/services/mediaService';

interface EntrySidebarProps {
  entry: CodexEntry;
}

/**
 * Left column of the entry page (docs/codex-entry-model.md): the thumbnail, the entry's details
 * and when it was created and last changed. Read-only; editing in this layout comes later in MYT-87.
 */
export default function EntrySidebar({ entry }: EntrySidebarProps) {
  const thumbnailUrl = mediaService.getThumbnailUrl(entry.thumbnail);
  const { details } = normalizeContent(entry.content);

  return (
    <aside className="space-y-6" aria-label="Entry details">
      <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt={entry.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl opacity-40" aria-hidden="true">
            {entryTypeConfig[entry.type].icon}
          </span>
        )}
      </div>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-4">Details</h2>
        <DetailsEditor details={details} readOnly />
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
