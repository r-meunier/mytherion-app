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
  // Shown even with a single template (Custom has only Blank), so the form below doesn't move
  // when the author switches type.
  if (templates.length === 0) return null;

  return (
    <div>
      <p className="field-label" aria-hidden="true">Template</p>
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
              className="choice-tile text-left p-3"
            >
              <span className={`block text-sm font-semibold ${selected ? 'text-white' : 'text-white/80'}`}>{template.name}</span>
              {template.description && (
                <span className="block text-xs text-white/50 mt-1">{template.description}</span>
              )}
              <span className="block text-xs text-white/35 mt-1">
                {template.details.length === 0 ? 'No details' : `${template.details.length} details`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
