import { render, screen, fireEvent } from '@testing-library/react';
import EntrySectionsEditor from '../EntrySectionsEditor';
import { EntryType, SectionType } from '@/app/types/codex';
import '@testing-library/jest-dom';

describe('EntrySectionsEditor', () => {
  const mockOnUpdate = jest.fn();
  const mockMetadata = {
    sections: [
      { type: SectionType.BIO, data: { status: 'Alive' } },
      { type: SectionType.APPEARANCE, data: { height: { value: 180, unit: 'cm' } } },
    ],
  };

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders the correct tabs for a CHARACTER entry', () => {
    render(
      <EntrySectionsEditor
        entryType={EntryType.CHARACTER}
        content={mockMetadata as any}
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
      <EntrySectionsEditor
        entryType={EntryType.CHARACTER}
        content={mockMetadata as any}
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
      <EntrySectionsEditor
        entryType={EntryType.CHARACTER}
        content={mockMetadata as any}
        onUpdateComponent={mockOnUpdate}
      />
    );

    const statusInput = screen.getByLabelText('Status');
    fireEvent.change(statusInput, { target: { value: 'Missing' } });

    expect(mockOnUpdate).toHaveBeenCalledWith(SectionType.BIO, expect.objectContaining({ status: 'Missing' }));
  });

  it('handles LOCATION entry specific tabs', () => {
    render(
      <EntrySectionsEditor
        entryType={EntryType.LOCATION}
        content={{ sections: [] }}
        onUpdateComponent={mockOnUpdate}
      />
    );

    expect(screen.getByText('Environment')).toBeInTheDocument();
    expect(screen.getByText('Occupants')).toBeInTheDocument();
  });
});
