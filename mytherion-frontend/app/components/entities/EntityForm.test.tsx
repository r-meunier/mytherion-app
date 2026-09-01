import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EntityForm from './EntityForm';
import { EntityType } from '@/app/types/entity';

// Mock child components that are not under test
jest.mock('./EntityTypeSelector', () => () => <div data-testid="type-selector" />);
jest.mock('./CategorySelector', () => () => <div data-testid="category-selector" />);
jest.mock('./TagInput', () => () => <div data-testid="tag-input" />);
jest.mock('./metadata/EntityMetadataEditor', () => () => <div data-testid="metadata-editor" />);

describe('EntityForm - Image Upload & Validation', () => {
  const defaultProps = {
    projectId: 'proj-1',
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost:3000/mock-image');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('rejects files with disallowed MIME types', () => {
    render(<EntityForm {...defaultProps} />);

    const fileInput = screen.getByLabelText(/Entity Image/i, { selector: 'input' });
    const invalidFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(
      screen.getByText('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
    ).toBeInTheDocument();
  });

  it('rejects files exceeding 5MB size limit', () => {
    render(<EntityForm {...defaultProps} />);

    const fileInput = screen.getByLabelText(/Entity Image/i, { selector: 'input' });
    // Create a 6MB file
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-portrait.png', {
      type: 'image/png',
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(screen.getByText('File size exceeds 5MB limit')).toBeInTheDocument();
  });

  it('accepts valid images (PNG <= 5MB) and shows preview and remove options', () => {
    render(<EntityForm {...defaultProps} />);

    const fileInput = screen.getByLabelText(/Entity Image/i, { selector: 'input' });
    const validFile = new File(['valid content'], 'character.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Expect preview image to be in the document
    const preview = screen.getByAltText('Entity preview');
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute('src', 'blob:http://localhost:3000/mock-image');

    // Click remove button
    const removeBtn = screen.getByTitle('Remove Image');
    fireEvent.click(removeBtn);

    // Input should be back
    expect(screen.getByLabelText(/Entity Image/i, { selector: 'input' })).toBeInTheDocument();
  });
});
