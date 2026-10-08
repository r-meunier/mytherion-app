'use client';

import { EntryDetail } from '@/app/types/codex';
import { newDetailId } from '@/app/utils/entryContent';

interface DetailsEditorProps {
  details: EntryDetail[];
  onChange?: (details: EntryDetail[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * The author-controlled label/value list on an entry (docs/codex-entry-model.md). Editing covers
 * values, labels, adding and removing; reordering and the sidebar layout come with MYT-87.
 */
export default function DetailsEditor({ details, onChange, disabled = false, readOnly = false }: DetailsEditorProps) {
  if (readOnly) {
    const filled = details.filter((d) => (d.value ?? '').trim() !== '');
    if (filled.length === 0) {
      return <p className="text-sm text-gray-500 italic">No details yet.</p>;
    }
    return (
      <dl className="space-y-3">
        {filled.map((detail) => (
          <div key={detail.id}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{detail.label}</dt>
            <dd className="text-sm text-gray-200 whitespace-pre-wrap">{detail.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  const update = (id: string, patch: Partial<EntryDetail>) =>
    onChange?.(details.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const remove = (detail: EntryDetail) => {
    const hasValue = (detail.value ?? '').trim() !== '';
    if (hasValue && !window.confirm(`Remove "${detail.label || 'this detail'}" and its text?`)) return;
    onChange?.(details.filter((d) => d.id !== detail.id));
  };

  const add = () => onChange?.([...details, { id: newDetailId(), label: '', value: null }]);

  return (
    <div className="space-y-4">
      {details.length === 0 && (
        <p className="text-sm text-gray-500">No details yet. Add the ones you want to track.</p>
      )}

      {details.map((detail) => (
        <div key={detail.id} className="space-y-1.5" data-testid="detail-row">
          <div className="flex items-center gap-2">
            <input
              type="text"
              aria-label="Detail label"
              value={detail.label}
              onChange={(e) => update(detail.id, { label: e.target.value })}
              placeholder="Label, e.g. Voice"
              maxLength={100}
              disabled={disabled}
              className="flex-1 bg-transparent text-xs font-semibold uppercase tracking-wider text-gray-400 placeholder-gray-600 focus:outline-none focus:text-white"
            />
            <button
              type="button"
              onClick={() => remove(detail)}
              disabled={disabled}
              aria-label={`Remove ${detail.label || 'detail'}`}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
          <textarea
            aria-label={detail.label || 'Detail value'}
            value={detail.value ?? ''}
            onChange={(e) => update(detail.id, { value: e.target.value })}
            placeholder={detail.hint ?? ''}
            title={detail.hint ?? undefined}
            rows={2}
            disabled={disabled}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex items-center gap-2 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Add detail
      </button>
    </div>
  );
}
