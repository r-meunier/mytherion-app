'use client';

import { EntryType } from '@/app/types/codex';

interface EntryTypeSelectorProps {
  value: EntryType | undefined;
  onChange: (type: EntryType) => void;
  disabled?: boolean;
  label?: string;
}

const entryTypeConfig = {
  [EntryType.CHARACTER]: { icon: '👤', label: 'Character', color: 'text-blue-400' },
  [EntryType.LOCATION]: { icon: '📍', label: 'Location', color: 'text-green-400' },
  [EntryType.ORGANIZATION]: { icon: '🏛️', label: 'Organization', color: 'text-purple-400' },
  [EntryType.SPECIES]: { icon: '🧬', label: 'Species', color: 'text-pink-400' },
  [EntryType.CULTURE]: { icon: '🎭', label: 'Culture', color: 'text-yellow-400' },
  [EntryType.ITEM]: { icon: '⚔️', label: 'Item', color: 'text-orange-400' },
  [EntryType.CUSTOM]: { icon: '🛠️', label: 'Custom', color: 'text-gray-400' },
};

export default function EntryTypeSelector({ 
  value, 
  onChange, 
  disabled = false,
  label = 'Entry Type'
}: EntryTypeSelectorProps) {
  return (
    <div role="group" aria-label={label || 'Entry type'}>
      {label && <p className="field-label">{label}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 w-full">
        {Object.entries(entryTypeConfig).map(([type, config]) => {
          const isSelected = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type as EntryType)}
              disabled={disabled}
              aria-pressed={isSelected}
              className="choice-tile flex items-center gap-2 p-3"
            >
              <span className="text-2xl">{config.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : config.color}`}>
                {config.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { entryTypeConfig };
