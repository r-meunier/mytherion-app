'use client';

import { KeyboardEvent, useEffect, useRef, useState } from 'react';

interface InlineChipsProps {
  items: string[];
  /** Persist the new list. Resolve to false when it failed: the list goes back to what is stored. */
  onSave: (next: string[]) => Promise<boolean>;
  /** e.g. { singular: 'tag', plural: 'tags' }, for buttons and messages. */
  itemLabel: { singular: string; plural: string };
  maxLength?: number;
  /** Classes of each chip; tags use `chip`, aliases a quieter look. */
  chipClassName?: string;
  disabled?: boolean;
}

/**
 * Aliases or tags on the entry page: chips with a remove button, and "+ Add" that opens a small
 * input (docs/style-guide.md §7). Every add and remove saves straight away.
 */
export default function InlineChips({
  items,
  onSave,
  itemLabel,
  maxLength = 30,
  chipClassName = 'chip',
  disabled = false,
}: InlineChipsProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  // While a save is in flight, show the list as it will be.
  const [optimistic, setOptimistic] = useState<string[] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const shown = optimistic ?? items;

  useEffect(() => {
    if (adding) input.current?.focus();
  }, [adding]);

  const persist = async (next: string[]) => {
    setOptimistic(next);
    const ok = await onSave(next);
    setOptimistic(null);
    if (!ok) setError(`Not saved. Check your connection and try again.`);
    return ok;
  };

  const add = async (): Promise<boolean> => {
    const value = draft.trim();
    if (!value) return true;
    if (value.length > maxLength) {
      setError(`${capitalise(itemLabel.singular)} must be ${maxLength} characters or less`);
      return false;
    }
    if (shown.includes(value)) {
      setError(`${capitalise(itemLabel.singular)} already exists`);
      return false;
    }
    setDraft('');
    setError(null);
    return persist([...shown, value]);
  };

  const close = () => {
    setAdding(false);
    setDraft('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Stay open for the next one.
      void add();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setError(null);
      close();
    } else if (e.key === 'Backspace' && !draft && shown.length > 0) {
      void persist(shown.slice(0, -1));
    }
  };

  const handleBlur = async () => {
    if (await add()) close();
  };

  return (
    <div>
      <ul className="flex flex-wrap items-center gap-2" aria-label={capitalise(itemLabel.plural)}>
        {shown.map((item) => (
          <li key={item} className={`${chipClassName} group/chip`}>
            {item}
            {!disabled && (
              <button
                type="button"
                onClick={() => void persist(shown.filter((i) => i !== item))}
                aria-label={`Remove ${item}`}
                className="flex opacity-50 hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[12px]" aria-hidden="true">close</span>
              </button>
            )}
          </li>
        ))}
        {!disabled && (
          <li>
            {adding ? (
              <input
                ref={input}
                type="text"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => void handleBlur()}
                aria-label={`New ${itemLabel.singular}`}
                aria-invalid={!!error}
                placeholder={`Add ${itemLabel.singular}…`}
                title="Enter to add · Esc to close"
                className="field-input w-40 px-2.5 py-0.5 text-xs rounded-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                aria-label={`Add ${itemLabel.singular}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white/40 border border-dashed border-white/15 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">add</span>
                {shown.length === 0 ? `Add ${itemLabel.singular}` : 'Add'}
              </button>
            )}
          </li>
        )}
      </ul>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
