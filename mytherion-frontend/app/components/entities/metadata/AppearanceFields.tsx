'use client';

import { AppearanceData } from '@/app/types/entity';

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
    skinAndMarkings: data.skinAndMarkings || ''
  };

  const handleChange = (field: keyof AppearanceData, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Physical Features
          </label>
          <textarea
            value={safeData.physicalFeatures}
            onChange={(e) => handleChange('physicalFeatures', e.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="Eyes, hair, build, face shape..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Clothing Style
          </label>
          <textarea
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
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Distinguishing Marks
          </label>
          <textarea
            value={safeData.distinguishingMarks}
            onChange={(e) => handleChange('distinguishingMarks', e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Scars, tattoos, birthmarks..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Skin and Markings
          </label>
          <textarea
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
