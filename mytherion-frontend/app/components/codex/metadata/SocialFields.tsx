'use client';

import { SocialData } from '@/app/types/entity';

interface SocialFieldsProps {
  data: SocialData;
  onChange: (data: Partial<SocialData>) => void;
  disabled?: boolean;
}

export default function SocialFields({ data, onChange, disabled = false }: SocialFieldsProps) {
  const safeData: SocialData = {
    occupations: data.occupations || [],
    hobbies: data.hobbies || [],
    skills: data.skills || [],
    talents: data.talents || [],
    sociology: data.sociology || '',
    affiliations: data.affiliations || ''
  };

  const handleListChange = (field: 'occupations' | 'hobbies' | 'skills' | 'talents', value: string) => {
    const list = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    onChange({ [field]: list });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label 
            htmlFor="social-occupations"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Occupations
          </label>
          <input
            id="social-occupations"
            type="text"
            value={safeData.occupations.join(', ')}
            onChange={(e) => handleListChange('occupations', e.target.value)}
            disabled={disabled}
            placeholder="Blacksmith, Soldier..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
        <div>
          <label 
            htmlFor="social-skills"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Skills / Expertise
          </label>
          <input
            id="social-skills"
            type="text"
            value={safeData.skills.join(', ')}
            onChange={(e) => handleListChange('skills', e.target.value)}
            disabled={disabled}
            placeholder="Lockpicking, Archery..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label 
            htmlFor="social-hobbies"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Hobbies / Interests
          </label>
          <input
            id="social-hobbies"
            type="text"
            value={safeData.hobbies.join(', ')}
            onChange={(e) => handleListChange('hobbies', e.target.value)}
            disabled={disabled}
            placeholder="Reading, Fishing..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
        <div>
          <label 
            htmlFor="social-talents"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Natural Talents
          </label>
          <input
            id="social-talents"
            type="text"
            value={safeData.talents.join(', ')}
            onChange={(e) => handleListChange('talents', e.target.value)}
            disabled={disabled}
            placeholder="Singing, High Agility..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label 
            htmlFor="social-sociology"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Sociology / Class / Standing
          </label>
          <textarea
            id="social-sociology"
            value={safeData.sociology || ''}
            onChange={(e) => onChange({ sociology: e.target.value })}
            disabled={disabled}
            rows={3}
            placeholder="What is their place in society? Are they nobility, a commoner, or an outcast?"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>
        <div>
          <label 
            htmlFor="social-affiliations"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Other Affiliations
          </label>
          <textarea
            id="social-affiliations"
            value={safeData.affiliations || ''}
            onChange={(e) => onChange({ affiliations: e.target.value })}
            disabled={disabled}
            rows={3}
            placeholder="Any other groups, guilds, or cliques they are associated with (text description)."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
