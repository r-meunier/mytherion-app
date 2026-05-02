'use client';

import { AppearanceData } from '@/app/types/entity';
import QuantityInput from './QuantityInput';

interface AppearanceFieldsProps {
  data: AppearanceData;
  onChange: (data: Partial<AppearanceData>) => void;
  disabled?: boolean;
}

export default function AppearanceFields({ data, onChange, disabled = false }: AppearanceFieldsProps) {
  const safeData: AppearanceData = {
    physicalFeatures: data.physicalFeatures || '',
    clothingStyle: data.clothingStyle || '',
    distinguishingMarks: data.distinguishingMarks || '',
    skinAndMarkings: data.skinAndMarkings || '',
    height: data.height || {},
    weight: data.weight || {}
  };

  const handleChange = (field: keyof AppearanceData, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label 
            htmlFor="appearance-physical"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Physical Features
          </label>
          <textarea
            id="appearance-physical"
            value={safeData.physicalFeatures}
            onChange={(e) => handleChange('physicalFeatures', e.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="Eyes, hair, build, face shape..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>

        <div>
          <label 
            htmlFor="appearance-clothing"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Clothing Style
          </label>
          <textarea
            id="appearance-clothing"
            value={safeData.clothingStyle}
            onChange={(e) => handleChange('clothingStyle', e.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="Common attire, preferred colors, accessories..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label 
            htmlFor="appearance-marks"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Distinguishing Marks
          </label>
          <textarea
            id="appearance-marks"
            value={safeData.distinguishingMarks}
            onChange={(e) => handleChange('distinguishingMarks', e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Scars, tattoos, birthmarks..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>

        <div>
          <label 
            htmlFor="appearance-skin"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Skin and Markings
          </label>
          <textarea
            id="appearance-skin"
            value={safeData.skinAndMarkings}
            onChange={(e) => handleChange('skinAndMarkings', e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Skin tone, texture, complexions, unique markings..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
