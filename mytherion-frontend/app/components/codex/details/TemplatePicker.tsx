'use client';

import { EntryTemplate } from '@/app/types/codex';

interface TemplatePickerProps {
  templates: EntryTemplate[];
  selectedId?: string | null;
  onSelect: (template: EntryTemplate) => void;
  disabled?: boolean;
}

/** Choose how much a new entry starts with: Blank, Basic (and Full once MYT-90 adds it). */
export default function TemplatePicker({ templates, selectedId, onSelect, disabled = false }: TemplatePickerProps) {
  if (templates.length <= 1) return null;

  return (
    <div role="radiogroup" aria-label="Template" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {templates.map((template) => {
        const selected = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(template)}
            disabled={disabled}
            className={`text-left p-3 rounded-xl border transition-all ${
              selected
                ? 'border-purple-500 bg-purple-500/10 text-white'
                : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-500'
            }`}
          >
            <span className="block text-sm font-semibold">{template.name}</span>
            {template.description && (
              <span className="block text-xs text-gray-400 mt-1">{template.description}</span>
            )}
            <span className="block text-xs text-gray-500 mt-1">
              {template.details.length === 0 ? 'No details' : `${template.details.length} details`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
