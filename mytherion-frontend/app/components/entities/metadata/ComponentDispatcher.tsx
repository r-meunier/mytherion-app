'use client';

import BioFields from './BioFields';
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
      return <BioFields data={component.data} onChange={onChange} disabled={disabled} />;
    
    case 'CUSTOM':
      return <CustomFields data={component.data} onChange={onChange} disabled={disabled} />;
    
    default:
      return (
        <div className="p-4 bg-gray-900/30 border border-dashed border-gray-700 rounded-lg text-center">
          <p className="text-xs text-gray-500">
            Unknown component type: <span className="text-gray-300 font-mono">{component.type}</span>
          </p>
          <CustomFields data={component.data} onChange={onChange} disabled={disabled} />
        </div>
      );
  }
}
