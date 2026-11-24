'use client';

import { useState } from 'react';
import { EntryDetail } from '@/app/types/codex';
import { newDetailId } from '@/app/utils/entryContent';
import InlineText from '../inline/InlineText';

interface DetailsInlineProps {
  details: EntryDetail[];
  /** Persist the whole list. Resolves to false when the save failed. */
  onChange: (details: EntryDetail[]) => Promise<boolean>;
  disabled?: boolean;
}

/**
 * The details in the entry page's sidebar, edited where they are shown (docs/codex-entry-model.md).
 * Click a label or a value to edit it; reorder and remove from the buttons that appear on hover.
 * Empty details from the template stay visible with their hint, so the author sees what to fill in.
 * Renaming keeps the detail's context role: renames are usually rewording, and the role has no UI yet.
 */
export default function DetailsInline({ details, onChange, disabled = false }: DetailsInlineProps) {
  const [adding, setAdding] = useState(false);

  const update = (id: string, patch: Partial<EntryDetail>) =>
    onChange(details.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const remove = (detail: EntryDetail) => {
    const hasValue = (detail.value ?? '').trim() !== '';
    if (hasValue && !window.confirm(`Remove "${detail.label || 'this detail'}" and its text?`)) return;
    void onChange(details.filter((d) => d.id !== detail.id));
  };

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= details.length) return;
    const next = [...details];
    [next[index], next[target]] = [next[target], next[index]];
    void onChange(next);
  };

  const requireLabel = (label: string) => (label.trim() ? null : 'A detail needs a label.');
  const iconButton = 'text-white/35 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-white/35';

  return (
    <div className="space-y-3">
      {details.length === 0 && !adding && (
        <p className="text-sm text-white/40 italic">No details yet.</p>
      )}

      <dl className="space-y-3">
        {details.map((detail, index) => (
          <div key={detail.id} className="group/detail" data-testid="detail-row">
            <dt className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <InlineText
                  value={detail.label}
                  label={`label of ${detail.label || 'detail'}`}
                  onSave={(label) => update(detail.id, { label })}
                  validate={requireLabel}
                  maxLength={100}
                  disabled={disabled}
                  className="text-[11px] font-semibold uppercase tracking-wider text-white/40"
                />
              </div>
              {!disabled && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover/detail:opacity-100 focus-within:opacity-100 transition-opacity">
                  {detail.hint && (
                    <span
                      role="img"
                      aria-label={`Hint: ${detail.hint}`}
                      title={detail.hint}
                      className="material-symbols-outlined text-[16px] text-white/35 cursor-help"
                    >
                      info
                    </span>
                  )}
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${detail.label || 'detail'} up`} className={iconButton}>
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_upward</span>
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === details.length - 1} aria-label={`Move ${detail.label || 'detail'} down`} className={iconButton}>
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_downward</span>
                  </button>
                  <button type="button" onClick={() => remove(detail)} aria-label={`Remove ${detail.label || 'detail'}`} className="text-white/35 hover:text-rose-400 transition-colors">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">delete</span>
                  </button>
                </div>
              )}
            </dt>
            <dd>
              <InlineText
                value={detail.value ?? ''}
                label={detail.label || 'detail'}
                multiline
                placeholder={detail.hint ?? 'Add…'}
                onSave={(value) => update(detail.id, { value: value.trim() === '' ? null : value })}
                disabled={disabled}
                className="text-sm text-white/80"
              />
            </dd>
          </div>
        ))}
      </dl>

      {adding && (
        <InlineText
          value=""
          label="new detail's label"
          placeholder="Label, e.g. Voice"
          autoEdit
          validate={requireLabel}
          maxLength={100}
          onCancel={() => setAdding(false)}
          onSave={async (label) => {
            // Stay open until it is saved, so a failed save keeps the label to retry.
            const ok = await onChange([...details, { id: newDetailId(), label, value: null }]);
            if (ok) setAdding(false);
            return ok;
          }}
          className="text-[11px] font-semibold uppercase tracking-wider text-white/60"
        />
      )}

      {!disabled && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
          Add detail
        </button>
      )}
    </div>
  );
}
