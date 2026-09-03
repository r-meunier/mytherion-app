'use client';

import { PsychologyData, MotivationData, CharacterArc } from '@/app/types/entity';

interface PsychologyFieldsProps {
  data: PsychologyData;
  onChange: (data: Partial<PsychologyData>) => void;
  disabled?: boolean;
}

export default function PsychologyFields({ data, onChange, disabled = false }: PsychologyFieldsProps) {
  const safeData: PsychologyData = {
    motivations: data.motivations || {},
    arc: data.arc || {},
    positiveTraits: data.positiveTraits || [],
    negativeTraits: data.negativeTraits || [],
    quirks: data.quirks || [],
    mannerisms: data.mannerisms || '',
    perspective: data.perspective || ''
  };

  const handleMotivationChange = (field: keyof MotivationData, value: string) => {
    onChange({ motivations: { ...safeData.motivations, [field]: value } });
  };

  const handleArcChange = (field: keyof CharacterArc, value: string) => {
    onChange({ arc: { ...safeData.arc, [field]: value } });
  };

  const handleListChange = (field: 'positiveTraits' | 'negativeTraits' | 'quirks', value: string) => {
    const list = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    onChange({ [field]: list });
  };

  return (
    <div className="space-y-8">
      {/* Motivations */}
      <section className="space-y-4">
        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest border-b border-gray-800 pb-2">
          Motivations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label 
              htmlFor="psych-goal"
              className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >
              External Goal
            </label>
            <input
              id="psych-goal"
              type="text"
              value={safeData.motivations.externalGoal || ''}
              onChange={(e) => handleMotivationChange('externalGoal', e.target.value)}
              disabled={disabled}
              placeholder="What do they want?"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>
          <div>
            <label 
              htmlFor="psych-need"
              className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >
              Internal Need
            </label>
            <input
              id="psych-need"
              type="text"
              value={safeData.motivations.internalNeed || ''}
              onChange={(e) => handleMotivationChange('internalNeed', e.target.value)}
              disabled={disabled}
              placeholder="What do they need?"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>
          <div>
            <label 
              htmlFor="psych-justification"
              className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >
              Justification
            </label>
            <input
              id="psych-justification"
              type="text"
              value={safeData.motivations.justification || ''}
              onChange={(e) => handleMotivationChange('justification', e.target.value)}
              disabled={disabled}
              placeholder="Why is this right?"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>
        </div>
      </section>

      {/* Traits & Quirks */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label 
            htmlFor="psych-pos-traits"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Positive Traits
          </label>
          <input
            id="psych-pos-traits"
            type="text"
            value={safeData.positiveTraits.join(', ')}
            onChange={(e) => handleListChange('positiveTraits', e.target.value)}
            disabled={disabled}
            placeholder="Kind, Brave, Loyal..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
        <div>
          <label 
            htmlFor="psych-neg-traits"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Negative Traits
          </label>
          <input
            id="psych-neg-traits"
            type="text"
            value={safeData.negativeTraits.join(', ')}
            onChange={(e) => handleListChange('negativeTraits', e.target.value)}
            disabled={disabled}
            placeholder="Arrogant, Greedy..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
        <div>
          <label 
            htmlFor="psych-quirks"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Quirks
          </label>
          <input
            id="psych-quirks"
            type="text"
            value={safeData.quirks.join(', ')}
            onChange={(e) => handleListChange('quirks', e.target.value)}
            disabled={disabled}
            placeholder="Taps fingers, Hums..."
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
      </section>

      {/* Narrative Context */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label 
            htmlFor="psych-mannerisms"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Mannerisms
          </label>
          <textarea
            id="psych-mannerisms"
            value={safeData.mannerisms || ''}
            onChange={(e) => onChange({ mannerisms: e.target.value })}
            disabled={disabled}
            rows={3}
            placeholder="How do they carry themselves? Unique speech patterns?"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>
        <div>
          <label 
            htmlFor="psych-perspective"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Perspective / Worldview
          </label>
          <textarea
            id="psych-perspective"
            value={safeData.perspective || ''}
            onChange={(e) => onChange({ perspective: e.target.value })}
            disabled={disabled}
            rows={3}
            placeholder="What do they think of the world in general?"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
          />
        </div>
      </section>
    </div>
  );
}
