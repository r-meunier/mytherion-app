'use client';

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function TagInput({ 
  tags, 
  onChange, 
  placeholder = 'Add tags...', 
  maxLength = 30 
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
      setError(`Tag must be ${maxLength} characters or less`);
      return;
    }

    if (tags.includes(tag)) {
      setError('Tag already exists');
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-700 rounded-lg bg-gray-800/50 min-h-[42px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-300 rounded-md text-sm border border-purple-500/30"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-purple-100 transition-colors"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-white placeholder-gray-400 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-xs text-gray-400">Press Enter to add tags</p>
    </div>
  );
}
