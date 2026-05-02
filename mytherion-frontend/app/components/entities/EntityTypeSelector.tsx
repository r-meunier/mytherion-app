'use client';

import { EntityType } from '@/app/types/entity';

interface EntityTypeSelectorProps {
  value: EntityType | undefined;
  onChange: (type: EntityType) => void;
  disabled?: boolean;
  label?: string;
}

const entityTypeConfig = {
  [EntityType.CHARACTER]: { icon: '👤', label: 'Character', color: 'text-blue-400' },
  [EntityType.LOCATION]: { icon: '📍', label: 'Location', color: 'text-green-400' },
  [EntityType.ORGANIZATION]: { icon: '🏛️', label: 'Organization', color: 'text-purple-400' },
  [EntityType.SPECIES]: { icon: '🧬', label: 'Species', color: 'text-pink-400' },
  [EntityType.CULTURE]: { icon: '🎭', label: 'Culture', color: 'text-yellow-400' },
  [EntityType.ITEM]: { icon: '⚔️', label: 'Item', color: 'text-orange-400' },
  [EntityType.CUSTOM]: { icon: '🛠️', label: 'Custom', color: 'text-gray-400' },
};

export default function EntityTypeSelector({ 
  value, 
  onChange, 
  disabled = false,
  label = 'Entity Type'
}: EntityTypeSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 w-full">
        {Object.entries(entityTypeConfig).map(([type, config]) => {
          const isSelected = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type as EntityType)}
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

export { entityTypeConfig };
