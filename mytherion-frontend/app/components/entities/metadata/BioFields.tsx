'use client';

import { EntityComponent } from '@/app/types/entity';

interface BioFieldsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

export default function BioFields({ data, onChange, disabled = false }: BioFieldsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Age */}
      <div>
        <label htmlFor="bio-age" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
          Age
        </label>
        <input
          type="text"
          id="bio-age"
          value={data.age || ''}
          onChange={(e) => handleChange('age', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          placeholder="e.g. 25, Immortal"
        />
      </div>

      {/* Gender/Pronouns */}
      <div>
        <label htmlFor="bio-gender" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
          Gender / Pronouns
        </label>
        <input
          type="text"
          id="bio-gender"
          value={data.gender || ''}
          onChange={(e) => handleChange('gender', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          placeholder="e.g. They/Them"
        />
      </div>

      {/* Role */}
      <div className="md:col-span-2">
        <label htmlFor="bio-role" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
          Role / Occupation
        </label>
        <input
          type="text"
          id="bio-role"
          value={data.role || ''}
          onChange={(e) => handleChange('role', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          placeholder="e.g. Ship Pilot, High Priestess"
        />
      </div>

      {/* Personality */}
      <div className="md:col-span-2">
        <label htmlFor="bio-personality" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
          Personality Traits
        </label>
        <textarea
          id="bio-personality"
          value={data.personality || ''}
          onChange={(e) => handleChange('personality', e.target.value)}
          disabled={disabled}
          rows={2}
          className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          placeholder="Brief description of character traits..."
        />
      </div>
    </div>
  );
}
