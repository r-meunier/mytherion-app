'use client';

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** id of the text input, so a <label htmlFor> can point at it. */
  id?: string;
  placeholder?: string;
  maxLength?: number;
  /** Singular/plural noun for messages, so the same input serves tags and aliases. */
  itemLabel?: { singular: string; plural: string };
}

export default function TagInput({
  tags,
  onChange,
  id,
  placeholder = 'Add tags...',
  maxLength = 30,
  itemLabel = { singular: 'Tag', plural: 'tags' }
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(tags[tags.length - 1]);
    }
  };

  const addTag = (tag: string) => {
    setError('');

    // Validation
    if (tag.length > maxLength) {
      setError(`${itemLabel.singular} must be ${maxLength} characters or less`);
      return;
    }

    if (tags.includes(tag)) {
      setError(`${itemLabel.singular} already exists`);
      return;
    }

    onChange([...tags, tag]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
    setError('');
  };

  return (
    <div>
      {/* One field to the eye: the chips and the input share the field-input frame. */}
      <div className="field-input flex flex-wrap items-center gap-2 px-2 py-2 min-h-[44px]">
        {tags.map((tag) => (
          <span key={tag} className="chip normal-case tracking-normal text-xs py-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-primary/60 hover:text-white transition-colors flex"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">close</span>
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] px-2 bg-transparent text-white placeholder-white/30 focus:outline-none"
        />
      </div>
      {error && <p className="field-error">{error}</p>}
      <p className="field-hint">Press Enter to add {itemLabel.plural}</p>
    </div>
  );
}
