'use client';

import { BioData } from '@/app/types/entity';
import QuantityInput from './QuantityInput';

interface BioFieldsProps {
  data: BioData;
  onChange: (data: Partial<BioData>) => void;
  disabled?: boolean;
}

export default function BioFields({ data, onChange, disabled = false }: BioFieldsProps) {
  // Ensure default structure
  const safeData: BioData = {
    status: data.status || '',
    age: data.age || {},
    gender: data.gender || '',
    sex: data.sex || '',
    role: data.role || '',
    height: data.height || {},
    weight: data.weight || {},
    condition: data.condition || ''
  };

  const handleChange = (field: keyof BioData, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Status */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Status
          </label>
          <input
            type="text"
            value={safeData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={disabled}
            placeholder="e.g. Alive, Dead, Missing"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>

        <QuantityInput 
          label="Age"
          value={safeData.age}
          onChange={(val) => handleChange('age', val)}
          disabled={disabled}
          units={['Years', 'Months', 'Eons', 'Cycles']}
        />

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Role
          </label>
          <input
            type="text"
            value={safeData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            disabled={disabled}
            placeholder="e.g. Protagonist, Shopkeeper"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Physical/Biological */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Gender
            </label>
            <input
              type="text"
              value={safeData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              disabled={disabled}
              placeholder="Gender Identity"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Sex
            </label>
            <input
              type="text"
              value={safeData.sex}
              onChange={(e) => handleChange('sex', e.target.value)}
              disabled={disabled}
              placeholder="Biological Sex"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>
        </div>

        <QuantityInput 
          label="Height"
          value={safeData.height}
          onChange={(val) => handleChange('height', val)}
          disabled={disabled}
          units={['cm', 'm', 'ft', 'inches']}
        />

        <QuantityInput 
          label="Weight"
          value={safeData.weight}
          onChange={(val) => handleChange('weight', val)}
          disabled={disabled}
          units={['kg', 'g', 'lbs', 'tons']}
        />
      </div>

      {/* Condition (Full Width) */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Overall Condition / Presentation
        </label>
        <textarea
          value={safeData.condition}
          onChange={(e) => handleChange('condition', e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Describe the current state or presentation of the entity..."
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
        />
      </div>
    </div>
  );
}
