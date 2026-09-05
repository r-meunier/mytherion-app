'use client';

import { useState } from 'react';
import { EntryType, EntryContent, EntrySection, SectionType } from '@/app/types/codex';
import SectionDispatcher from './SectionDispatcher';

interface TabDefinition {
  id: string;
  label: string;
  sections: SectionType[]; // List of component types to show in this tab
}

const TAB_CONFIG: Record<string, TabDefinition[]> = {
  [EntryType.CHARACTER]: [
    { id: 'vitality', label: 'Vitality', sections: [SectionType.BIO] },
    { id: 'appearance', label: 'Appearance', sections: [SectionType.APPEARANCE] },
    { id: 'psychology', label: 'Psychology', sections: [SectionType.PSYCHOLOGY] },
    { id: 'social', label: 'Social', sections: [SectionType.SOCIAL] },
    { id: 'history', label: 'History', sections: [SectionType.HISTORY] },
    { id: 'relations', label: 'Relations', sections: [SectionType.CHARACTER_RELATIONS] },
    { id: 'perspectives', label: 'Perspectives', sections: [SectionType.PERSPECTIVES] },
  ],
  [EntryType.ORGANIZATION]: [
    { id: 'structure', label: 'Structure', sections: [SectionType.ORGANIZATION_DETAILS] },
    { id: 'network', label: 'Network', sections: [SectionType.ORGANIZATION_RELATIONS] },
    { id: 'perspectives', label: 'Perspectives', sections: [SectionType.PERSPECTIVES] },
  ],
  [EntryType.CULTURE]: [
    { id: 'lore', label: 'Lore', sections: [SectionType.CULTURE_DETAILS] },
    { id: 'network', label: 'Network', sections: [SectionType.CULTURE_RELATIONS] },
    { id: 'perspectives', label: 'Perspectives', sections: [SectionType.PERSPECTIVES] },
  ],
  [EntryType.SPECIES]: [
    { id: 'biology', label: 'Biology', sections: [SectionType.SPECIES_DETAILS] },
    { id: 'evolution', label: 'Evolution', sections: [SectionType.SPECIES_RELATIONS] },
  ],
  [EntryType.LOCATION]: [
    { id: 'details', label: 'Environment', sections: [SectionType.LOCATION_DETAILS] },
    { id: 'occupants', label: 'Occupants', sections: [SectionType.LOCATION_RELATIONS] },
  ],
  [EntryType.ITEM]: [
    { id: 'attributes', label: 'Attributes', sections: [SectionType.ITEM_DETAILS] },
    { id: 'ownership', label: 'Ownership', sections: [SectionType.ITEM_RELATIONS] },
  ],
};

interface EntrySectionsEditorProps {
  entryType: EntryType;
  content: EntryContent;
  onUpdateComponent?: (type: SectionType, data: Record<string, any>) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function EntrySectionsEditor({ 
  entryType, 
  content, 
  onUpdateComponent, 
  disabled = false,
  readOnly = false
}: EntrySectionsEditorProps) {
  const tabs = TAB_CONFIG[entryType] || [{ id: 'custom', label: 'Custom Fields', sections: [SectionType.CUSTOM_FIELDS] }];
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const currentTabDef = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-500 text-white bg-purple-500/5'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {/* Always allow access to Custom Fields if not in main tabs */}
        {!tabs.some(t => t.sections.includes(SectionType.CUSTOM_FIELDS)) && (
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'custom'
                ? 'border-blue-500 text-white bg-blue-500/5'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            Custom
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="pt-2 animate-in fade-in duration-300">
        {activeTab === 'custom' ? (
          <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/50">
             <SectionDispatcher 
                component={content.sections.find(c => c.type === SectionType.CUSTOM_FIELDS) || ({ id: SectionType.CUSTOM_FIELDS, type: SectionType.CUSTOM_FIELDS, data: {} } as any)}
                onChange={(data) => onUpdateComponent?.(SectionType.CUSTOM_FIELDS, data)}
                disabled={readOnly || disabled}
             />
          </div>
        ) : (
          <div className="space-y-6">
            {currentTabDef.sections.map((compType) => {
              const component = content.sections.find(c => c.type === compType) || ({ id: compType as string, type: compType, data: {} } as any);
              return (
                <div key={compType} className="p-6 bg-gray-800/20 rounded-xl border border-gray-700/50">
                  <SectionDispatcher 
                    component={component}
                    onChange={(data) => onUpdateComponent?.(compType, data)}
                    disabled={readOnly || disabled}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
