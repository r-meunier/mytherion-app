'use client';

import BioFields from './BioFields';
import AppearanceFields from './AppearanceFields';
import PsychologyFields from './PsychologyFields';
import SocialFields from './SocialFields';
import HistoryFields from './HistoryFields';
import CustomFields from './CustomFields';
import { EntityComponent, ComponentType } from '@/app/types/entity';

interface ComponentDispatcherProps {
  component: EntityComponent;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

export default function ComponentDispatcher({ component, onChange, disabled = false }: ComponentDispatcherProps) {
  // Render the appropriate fields based on component type
  switch (component.type) {
    case ComponentType.BIO:
      return <BioFields data={component.data as any} onChange={onChange} disabled={disabled} />;
    
    case ComponentType.APPEARANCE:
      return <AppearanceFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case ComponentType.PSYCHOLOGY:
      return <PsychologyFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case ComponentType.SOCIAL:
      return <SocialFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case ComponentType.HISTORY:
      return <HistoryFields data={component.data as any} onChange={onChange} disabled={disabled} />;
    
    case ComponentType.CHARACTER_RELATIONS:
    case ComponentType.ORGANIZATION:
    case ComponentType.ORG_RELATIONS:
    case ComponentType.ORIGINS:
    case ComponentType.CULTURE:
    case ComponentType.CULTURE_RELATIONS:
    case ComponentType.SPECIES:
    case ComponentType.SPECIES_RELATIONS:
    case ComponentType.LOCATION:
    case ComponentType.LOCATION_RELATIONS:
    case ComponentType.ITEM:
    case ComponentType.ITEM_RELATIONS:
    case ComponentType.PERSPECTIVES:
      return (
        <div className="p-4 bg-gray-900/30 border border-dashed border-gray-700 rounded-lg text-center">
          <p className="text-xs text-gray-500 mb-2">
            Component <span className="text-purple-400 font-mono">{component.type}</span> is not yet fully implemented.
          </p>
          <CustomFields data={component.data} onChange={onChange} disabled={disabled} />
        </div>
      );

    case ComponentType.CUSTOM:
      return <CustomFields data={component.data} onChange={onChange} disabled={disabled} />;
    
    default:
      return (
        <div className="p-4 bg-red-900/10 border border-dashed border-red-700/50 rounded-lg text-center">
          <p className="text-xs text-red-400 mb-2">
            Unknown Component Type: <span className="font-mono">{component.type}</span>
          </p>
          <CustomFields data={component.data} onChange={onChange} disabled={disabled} />
        </div>
      );
  }
}
