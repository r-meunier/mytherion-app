'use client';

import { HistoryData } from '@/app/types/entity';

interface HistoryFieldsProps {
  data: HistoryData;
  onChange: (data: Partial<HistoryData>) => void;
  disabled?: boolean;
}

export default function HistoryFields({ data, onChange, disabled = false }: HistoryFieldsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Backstory / Origin Story
        </label>
        <textarea
          value={data.backstory || ''}
          onChange={(e) => onChange({ backstory: e.target.value })}
          disabled={disabled}
          rows={6}
          placeholder="Where did they come from? Major life events before the story begins..."
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          The Journey / Current Arc Progress
        </label>
        <textarea
          value={data.journey || ''}
          onChange={(e) => onChange({ journey: e.target.value })}
          disabled={disabled}
          rows={6}
          placeholder="Major events that have happened since the beginning of the narrative/campaign..."
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
        />
      </div>
    </div>
  );
}
