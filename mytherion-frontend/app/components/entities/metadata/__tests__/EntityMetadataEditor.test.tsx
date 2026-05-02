import { render, screen, fireEvent } from '@testing-library/react';
import EntityMetadataEditor from '../EntityMetadataEditor';
import { EntityType } from '@/app/types/entity';
import '@testing-library/jest-dom';

describe('EntityMetadataEditor', () => {
  const mockOnUpdate = jest.fn();
  const mockMetadata = {
    components: [
      { type: 'BIO', data: { status: 'Alive' } },
      { type: 'APPEARANCE', data: { height: { value: 180, unit: 'cm' } } },
    ],
  };

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders the correct tabs for a CHARACTER entity', () => {
    render(
      <EntityMetadataEditor
        entityType={EntityType.CHARACTER}
        metadata={mockMetadata}
        onUpdateComponent={mockOnUpdate}
      />
    );

    expect(screen.getByText('Vitality')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Psychology')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(
      <EntityMetadataEditor
        entityType={EntityType.CHARACTER}
        metadata={mockMetadata}
        onUpdateComponent={mockOnUpdate}
      />
    );

    // Initial tab is Vitality (BIO)
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    
    // Switch to Appearance
    fireEvent.click(screen.getByText('Appearance'));
    
    // Bio fields should be gone (or at least appearance fields should be visible)
    expect(screen.getByLabelText('Height')).toBeInTheDocument();
  });

  it('calls onUpdateComponent when a field changes', () => {
    render(
      <EntityMetadataEditor
        entityType={EntityType.CHARACTER}
        metadata={mockMetadata}
        onUpdateComponent={mockOnUpdate}
      />
    );

    const statusInput = screen.getByLabelText('Status');
    fireEvent.change(statusInput, { target: { value: 'Missing' } });

    expect(mockOnUpdate).toHaveBeenCalledWith('BIO', expect.objectContaining({ status: 'Missing' }));
  });

  it('handles LOCATION entity specific tabs', () => {
    render(
      <EntityMetadataEditor
        entityType={EntityType.LOCATION}
        metadata={{ components: [] }}
        onUpdateComponent={mockOnUpdate}
      />
    );

    expect(screen.getByText('Environment')).toBeInTheDocument();
    expect(screen.getByText('Occupants')).toBeInTheDocument();
  });
});
