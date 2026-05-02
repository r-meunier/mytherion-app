'use client';

import BioFields from './BioFields';
import AppearanceFields from './AppearanceFields';
import PsychologyFields from './PsychologyFields';
import SocialFields from './SocialFields';
import HistoryFields from './HistoryFields';
import CustomFields from './CustomFields';
import { EntityComponent } from '@/app/types/entity';

interface ComponentDispatcherProps {
  component: EntityComponent;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

export default function ComponentDispatcher({ component, onChange, disabled = false }: ComponentDispatcherProps) {
  // Render the appropriate fields based on component type
  switch (component.type.toUpperCase()) {
    case 'BIO':
      return <BioFields data={component.data as any} onChange={onChange} disabled={disabled} />;
    
    case 'APPEARANCE':
      return <AppearanceFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case 'PSYCHOLOGY':
      return <PsychologyFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case 'SOCIAL':
      return <SocialFields data={component.data as any} onChange={onChange} disabled={disabled} />;

    case 'HISTORY':
      return <HistoryFields data={component.data as any} onChange={onChange} disabled={disabled} />;
    
    case 'CUSTOM':
      return <CustomFields data={component.data} onChange={onChange} disabled={disabled} />;
    
    default:
      return (
        <div className="p-4 bg-gray-900/30 border border-dashed border-gray-700 rounded-lg text-center">
          <p className="text-xs text-gray-500 mb-2">
            Component <span className="text-gray-300 font-mono">{component.type}</span> is not yet fully implemented in the UI.
          </p>
          <CustomFields data={component.data} onChange={onChange} disabled={disabled} />
        </div>
      );
  }
}
