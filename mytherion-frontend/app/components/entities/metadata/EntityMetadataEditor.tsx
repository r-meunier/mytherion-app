'use client';

import { useState } from 'react';
import { EntityType, EntityMetadata, EntityComponent } from '@/app/types/entity';
import ComponentDispatcher from './ComponentDispatcher';

interface TabDefinition {
  id: string;
  label: string;
  components: string[]; // List of component types to show in this tab
}

const TAB_CONFIG: Record<string, TabDefinition[]> = {
  [EntityType.CHARACTER]: [
    { id: 'vitality', label: 'Vitality', components: ['BIO'] },
    { id: 'appearance', label: 'Appearance', components: ['APPEARANCE'] },
    { id: 'psychology', label: 'Psychology', components: ['PSYCHOLOGY'] },
    { id: 'social', label: 'Social', components: ['SOCIAL'] },
    { id: 'history', label: 'History', components: ['HISTORY'] },
    { id: 'relations', label: 'Relations', components: ['CHARACTER_RELATIONS'] },
    { id: 'perspectives', label: 'Perspectives', components: ['PERSPECTIVES'] },
  ],
  [EntityType.ORGANIZATION]: [
    { id: 'structure', label: 'Structure', components: ['ORGANIZATION'] },
    { id: 'network', label: 'Network', components: ['ORG_RELATIONS'] },
    { id: 'perspectives', label: 'Perspectives', components: ['PERSPECTIVES'] },
  ],
  [EntityType.CULTURE]: [
    { id: 'lore', label: 'Lore', components: ['CULTURE'] },
    { id: 'network', label: 'Network', components: ['CULTURE_RELATIONS'] },
    { id: 'perspectives', label: 'Perspectives', components: ['PERSPECTIVES'] },
  ],
  [EntityType.SPECIES]: [
    { id: 'biology', label: 'Biology', components: ['SPECIES'] },
    { id: 'evolution', label: 'Evolution', components: ['SPECIES_RELATIONS'] },
  ],
  [EntityType.LOCATION]: [
    { id: 'details', label: 'Details', components: ['LOCATION'] },
    { id: 'occupants', label: 'Occupants', components: ['LOCATION_RELATIONS'] },
  ],
  [EntityType.ITEM]: [
    { id: 'attributes', label: 'Attributes', components: ['ITEM'] },
    { id: 'ownership', label: 'Ownership', components: ['ITEM_RELATIONS'] },
  ],
};

interface EntityMetadataEditorProps {
  entityType: EntityType;
  metadata: EntityMetadata;
  onUpdateComponent?: (type: string, data: Record<string, any>) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function EntityMetadataEditor({ 
  entityType, 
  metadata, 
  onUpdateComponent, 
  disabled = false,
  readOnly = false
}: EntityMetadataEditorProps) {
  const tabs = TAB_CONFIG[entityType] || [{ id: 'custom', label: 'Custom Fields', components: ['CUSTOM'] }];
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
        {!tabs.some(t => t.components.includes('CUSTOM')) && (
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
             <ComponentDispatcher 
                component={metadata.components.find(c => c.type === 'CUSTOM') || { type: 'CUSTOM', data: {} }}
                onChange={(data) => onUpdateComponent?.('CUSTOM', data)}
                disabled={readOnly || disabled}
             />
          </div>
        ) : (
          <div className="space-y-6">
            {currentTabDef.components.map((compType) => {
              const component = metadata.components.find(c => c.type === compType) || { type: compType, data: {} };
              return (
                <div key={compType} className="p-6 bg-gray-800/20 rounded-xl border border-gray-700/50">
                  <ComponentDispatcher 
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
