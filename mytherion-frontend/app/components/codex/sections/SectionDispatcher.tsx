'use client';

import BioFields from './BioFields';
import AppearanceFields from './AppearanceFields';
import PsychologyFields from './PsychologyFields';
import SocialFields from './SocialFields';
import HistoryFields from './HistoryFields';
import CustomFields from './CustomFields';
import ItemFields from './ItemFields';
import { EntrySection, SectionType } from '@/app/types/codex';

interface ComponentDispatcherProps {
  component: EntrySection;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

export default function SectionDispatcher({ component, onChange, disabled = false }: ComponentDispatcherProps) {
  // Render the appropriate fields based on component type
  switch (component.type) {
    case SectionType.BIO:
      return <BioFields data={component.data as any} onChange={onChange} disabled={disabled} />;
    
    case SectionType.APPEARANCE:
      return <AppearanceFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case SectionType.PSYCHOLOGY:
      return <PsychologyFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case SectionType.SOCIAL:
      return <SocialFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case SectionType.HISTORY:
      return <HistoryFields data={component.data as any} onChange={onChange} disabled={disabled} />;
    
    case SectionType.ITEM_DETAILS:
      return <ItemFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case SectionType.CHARACTER_RELATIONS:
    case SectionType.ORGANIZATION_DETAILS:
    case SectionType.ORGANIZATION_RELATIONS:
    case SectionType.ORIGINS:
    case SectionType.CULTURE_DETAILS:
    case SectionType.CULTURE_RELATIONS:
    case SectionType.SPECIES_DETAILS:
    case SectionType.SPECIES_RELATIONS:
    case SectionType.LOCATION_DETAILS:
    case SectionType.LOCATION_RELATIONS:
    case SectionType.ITEM_RELATIONS:
    case SectionType.PERSPECTIVES:
      return (
        <div className="p-4 bg-gray-900/30 border border-dashed border-gray-700 rounded-lg text-center">
          <p className="text-xs text-gray-500 mb-2">
            Component <span className="text-purple-400 font-mono">{component.type}</span> is not yet fully implemented.
          </p>
          <CustomFields data={component.data} onChange={onChange} disabled={disabled} />
        </div>
      );

    case SectionType.CUSTOM_FIELDS:
      return <CustomFields data={component.data} onChange={onChange} disabled={disabled} /> as any;
    
    default:
      const unknownComponent = component as any;
      return (
        <div className="p-4 bg-red-900/10 border border-dashed border-red-700/50 rounded-lg text-center">
          <p className="text-xs text-red-400 mb-2">
            Unknown Component Type: <span className="font-mono">{unknownComponent.type || 'Unknown'}</span>
          </p>
          <CustomFields data={unknownComponent.data || {}} onChange={onChange} disabled={disabled} />
        </div>
      );
  }
}
