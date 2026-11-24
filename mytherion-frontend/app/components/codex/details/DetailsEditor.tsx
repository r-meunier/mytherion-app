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
 * The author-controlled label/value list on an entry (docs/codex-entry-model.md), shown in the entry
 * page's sidebar. Editing covers values, labels, order, adding and removing. Renaming a detail keeps
 * its context role: renames are usually rewording, and the role has no UI yet.
 */
export default function DetailsEditor({ details, onChange, disabled = false, readOnly = false }: DetailsEditorProps) {
  if (readOnly) {
    const filled = details.filter((d) => (d.value ?? '').trim() !== '');
    if (filled.length === 0) {
      return <p className="text-sm text-white/40 italic">No details yet.</p>;
    }
    return (
      <dl className="space-y-3">
        {filled.map((detail) => (
          <div key={detail.id}>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{detail.label}</dt>
            <dd className="text-sm text-white/80 whitespace-pre-wrap">{detail.value}</dd>
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

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= details.length) return;
    const next = [...details];
    [next[index], next[target]] = [next[target], next[index]];
    onChange?.(next);
  };

  const add = () => onChange?.([...details, { id: newDetailId(), label: '', value: null }]);

  const iconButton = 'text-white/35 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-white/35';

  return (
    <div className="space-y-4">
      {details.length === 0 && (
        <p className="text-sm text-white/40">No details yet. Add the ones you want to track.</p>
      )}

      {details.map((detail, index) => (
        <div key={detail.id} className="space-y-1.5" data-testid="detail-row">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              aria-label="Detail label"
              value={detail.label}
              onChange={(e) => update(detail.id, { label: e.target.value })}
              placeholder="Label, e.g. Voice"
              maxLength={100}
              disabled={disabled}
              className="flex-1 min-w-0 bg-transparent text-[11px] font-semibold uppercase tracking-wider text-white/50 placeholder-white/25 hover:text-white/70 focus:outline-none focus:text-white"
            />
            {/* The hint is also the placeholder, which disappears once there is text; this keeps it reachable. */}
            {detail.hint && (
              <span
                role="img"
                aria-label={`Hint: ${detail.hint}`}
                title={detail.hint}
                className="material-symbols-outlined text-[16px] text-white/35 hover:text-white/70 cursor-help"
              >
                info
              </span>
            )}
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={disabled || index === 0}
              aria-label={`Move ${detail.label || 'detail'} up`}
              className={iconButton}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={disabled || index === details.length - 1}
              aria-label={`Move ${detail.label || 'detail'} down`}
              className={iconButton}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </button>
            <button
              type="button"
              onClick={() => remove(detail)}
              disabled={disabled}
              aria-label={`Remove ${detail.label || 'detail'}`}
              className="text-white/35 hover:text-rose-400 transition-colors disabled:opacity-30"
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
            className="field-input px-3 py-2 text-sm resize-y"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-white transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Add detail
      </button>
    </div>
  );
}
