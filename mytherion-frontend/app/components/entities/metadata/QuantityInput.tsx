'use client';

import { Quantity } from '@/app/types/entity';

interface QuantityInputProps {
  label: string;
  value: Quantity;
  onChange: (value: Quantity) => void;
  disabled?: boolean;
  placeholder?: string;
  units?: string[]; // Optional suggested units
}

export default function QuantityInput({ 
  label, 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "Amount",
  units = []
}: QuantityInputProps) {
  const inputId = `quantity-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="block text-xs font-semibold text-gray-400 uppercase tracking-wider"
      >
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="number"
          step="any"
          value={value.value ?? ''}
          onChange={(e) => onChange({ ...value, value: e.target.value ? parseFloat(e.target.value) : undefined })}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
        />
        <div className="w-24">
          <input
            type="text"
            list={`units-${label}`}
            aria-label={`Unit for ${label}`}
            value={value.unit ?? ''}
            onChange={(e) => onChange({ ...value, unit: e.target.value })}
            disabled={disabled}
            placeholder="Unit"
            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
          {units.length > 0 && (
            <datalist id={`units-${label}`}>
              {units.map(u => <option key={u} value={u} />)}
            </datalist>
          )}
        </div>
      </div>
    </div>
  );
}
