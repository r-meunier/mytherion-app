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
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 w-full">
        {Object.entries(entryTypeConfig).map(([type, config]) => {
          const isSelected = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type as EntryType)}
              disabled={disabled}
              className={`
                flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-purple-500 bg-purple-600/20' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
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
