'use client';

import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';

interface InlineTextProps {
  value: string;
  /** Persist the new value. Resolve to false when it failed: the editor reopens with the text. */
  onSave: (next: string) => Promise<boolean>;
  /** Names the field for screen readers and the hover hint, e.g. "name" or "description". */
  label: string;
  multiline?: boolean;
  /** Shown instead of an empty value, e.g. "Add a description…". */
  placeholder?: string;
  /** Returns an error message, or null when the value is fine. */
  validate?: (next: string) => string | null;
  /** Typography shared by the text and its editor, so clicking doesn't change how it looks. */
  className?: string;
  /** Extra classes for the input or textarea (borders, background). */
  inputClassName?: string;
  /** Custom rendering of a non-empty value. */
  children?: ReactNode;
  disabled?: boolean;
  /** Start in edit mode, e.g. for a row the author just added. */
  autoEdit?: boolean;
  /** Called when editing ends without a save (Esc, or blur with nothing changed). */
  onCancel?: () => void;
  maxLength?: number;
  /** Size to the text instead of filling the line, e.g. the name next to the type badge. */
  inline?: boolean;
}

/**
 * Text on the entry page that turns into an input when clicked (docs/style-guide.md §7).
 * Enter saves a single line; Ctrl/Cmd+Enter saves multiline text; clicking away saves both; Esc
 * cancels. While saving, the new text shows straight away; a failed save reopens the editor.
 */
export default function InlineText({
  value,
  onSave,
  label,
  multiline = false,
  placeholder,
  validate,
  className = '',
  inputClassName = '',
  children,
  disabled = false,
  autoEdit = false,
  onCancel,
  maxLength,
  inline = false,
}: InlineTextProps) {
  // The editor takes exactly the text's box, so opening it moves nothing on the page.
  // Blocks: same padding and 1px border, pulled out by negative margins to line up with the text.
  // Inline (the name in the title): no padding or margin at all, since a heading sized to its text
  // would come out too narrow and wrap; the frame is a box-shadow drawn outside the text instead.
  const box = inline ? 'inline-block max-w-full' : 'block w-full -mx-2 px-2 py-1';
  const frame = inline
    ? 'border-0 rounded-md hover:bg-white/[0.04] hover:shadow-[0_0_0_6px_rgba(255,255,255,0.04)] focus-visible:shadow-[0_0_0_6px_rgba(221,183,255,0.2)]'
    : 'border border-transparent rounded-lg hover:border-white/10 hover:bg-white/[0.03] focus-visible:border-primary/50';
  const [editing, setEditing] = useState(autoEdit);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  // Esc sets this so the blur that follows doesn't save.
  const cancelled = useRef(false);

  useEffect(() => {
    if (!editing) return;
    const el = field.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  const open = () => {
    if (disabled) return;
    cancelled.current = false;
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    cancelled.current = true;
    setEditing(false);
    setError(null);
    onCancel?.();
  };

  const commit = async (fromBlur: boolean) => {
    if (cancelled.current) return;
    const next = multiline ? draft : draft.trim();
    if (next === value) {
      cancel();
      return;
    }
    const problem = validate?.(next) ?? null;
    if (problem) {
      // On blur, drop an invalid value instead of trapping the author in the field.
      if (fromBlur) cancel();
      else setError(problem);
      return;
    }
    cancelled.current = true;
    setEditing(false);
    setSaving(next);
    const ok = await onSave(next);
    setSaving(null);
    if (!ok) {
      cancelled.current = false;
      setDraft(next);
      setError('Not saved. Check your connection and try again.');
      setEditing(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    } else if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void commit(false);
    }
  };

  if (editing) {
    const editorClass = `field-input ${box} ${
      inline
        ? 'w-auto min-w-[8ch] [field-sizing:content] p-0 border-0 rounded-md bg-white/[0.05] shadow-[0_0_0_6px_rgba(255,255,255,0.05)] focus:shadow-[0_0_0_6px_rgba(221,183,255,0.2)]'
        : 'rounded-lg'
    } ${className} ${inputClassName}`;
    const shared = {
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDraft(e.target.value);
        setError(null);
      },
      onKeyDown: handleKeyDown,
      onBlur: () => void commit(true),
      'aria-label': label,
      'aria-invalid': !!error,
      placeholder,
      maxLength,
      title: multiline ? 'Ctrl+Enter or click away to save · Esc to cancel' : 'Enter or click away to save · Esc to cancel',
    };
    return (
      <div className={inline ? 'inline-block max-w-full' : 'w-full'}>
        {/* field-sizing:content sizes the editor to its text where supported (Chromium), and then
            rows/size are ignored. Elsewhere (Firefox) rows and size are the fallback: the text's
            line count, at least 3 and at most 15, and the textarea can still be dragged taller. */}
        {multiline ? (
          <textarea
            ref={field}
            {...shared}
            rows={Math.min(15, Math.max(3, draft.split('\n').length + 1))}
            className={`${editorClass} resize-y [field-sizing:content]`}
          />
        ) : (
          <input
            ref={field}
            type="text"
            {...shared}
            size={inline ? Math.max(8, draft.length + 1) : undefined}
            className={editorClass}
          />
        )}
        {error && <p className="field-error">{error}</p>}
      </div>
    );
  }

  const shown = saving ?? value;
  return (
    <button
      type="button"
      onClick={open}
      disabled={disabled}
      title={`Click to edit ${label}`}
      className={`group/inline ${box} ${frame} text-left focus-visible:outline-none transition-[background-color,border-color,box-shadow] cursor-text disabled:cursor-default ${
        saving !== null ? 'opacity-70' : ''
      } ${className}`}
    >
      {shown ? (children && saving === null ? children : <span className="whitespace-pre-wrap">{shown}</span>) : (
        <span className="text-white/35 italic font-normal">{placeholder ?? `Add ${label}`}</span>
      )}
    </button>
  );
}
