import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import EntryForm from './EntryForm';

// Mock child sections that are not under test
jest.mock('./EntryTypeSelector', () => ({
  __esModule: true,
  default: () => <div data-testid="type-selector" />,
  entryTypeConfig: jest.requireActual('./EntryTypeSelector').entryTypeConfig,
}));
jest.mock('./TagInput', () => () => <div data-testid="tag-input" />);
jest.mock('./details/DetailsEditor', () => () => <div data-testid="details-editor" />);
jest.mock('@/app/services/codexService', () => ({
  codexService: { getTemplates: jest.fn().mockResolvedValue([]) },
}));

describe('EntryForm - Image Upload & Validation', () => {
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
    render(<EntryForm {...defaultProps} />);

    const fileInput = screen.getByLabelText(/Entry image/i, { selector: 'input' });
    const invalidFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(
      screen.getByText('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
    ).toBeInTheDocument();
  });

  it('rejects files exceeding 5MB size limit', () => {
    render(<EntryForm {...defaultProps} />);

    const fileInput = screen.getByLabelText(/Entry image/i, { selector: 'input' });
    // Create a 6MB file
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-portrait.png', {
      type: 'image/png',
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(screen.getByText('File size exceeds 5MB limit')).toBeInTheDocument();
  });

  it('accepts valid images (PNG <= 5MB) and shows preview and remove options', () => {
    render(<EntryForm {...defaultProps} />);

    const fileInput = screen.getByLabelText(/Entry image/i, { selector: 'input' });
    const validFile = new File(['valid content'], 'character.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Expect preview image to be in the document
    const preview = screen.getByAltText('Entry preview');
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute('src', 'blob:http://localhost:3000/mock-image');

    // Click remove button
    const removeBtn = screen.getByTitle('Remove Image');
    fireEvent.click(removeBtn);

    // Input should be back
    expect(screen.getByLabelText(/Entry image/i, { selector: 'input' })).toBeInTheDocument();
  });

  it('allows changing an existing preview image via the Change button', () => {
    render(<EntryForm {...defaultProps} />);

    const fileInput = screen.getByLabelText(/Entry image/i, { selector: 'input' });
    const file1 = new File(['first content'], 'first.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file1] } });

    expect(screen.getByAltText('Entry preview')).toBeInTheDocument();

    const changeBtn = screen.getByTitle('Change Image');
    expect(changeBtn).toBeInTheDocument();

    const clickSpy = jest.spyOn(fileInput, 'click');
    fireEvent.click(changeBtn);
    expect(clickSpy).toHaveBeenCalled();

    // Selecting a second image updates the preview
    const file2 = new File(['second content'], 'second.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file2] } });
    expect(screen.getByAltText('Entry preview')).toBeInTheDocument();
  });
});

describe('EntryForm - layout and submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost:3000/mock-image');
    global.URL.revokeObjectURL = jest.fn();
  });

  const renderForm = (onSubmit = jest.fn()) =>
    render(
      <EntryForm
        projectId="proj-1"
        onSubmit={onSubmit}
        onCancel={jest.fn()}
        title="New Entry"
        breadcrumbs={[{ label: 'Codex', href: '/c' }, { label: 'New entry' }]}
      />
    );

  it('puts the image and details in the sidebar, and description and notes in tabs', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Entry image/i, { selector: 'input' }), {
      target: { files: [new File(['img'], 'mira.png', { type: 'image/png' })] },
    });

    const sidebar = screen.getByRole('complementary', { name: 'Entry details' });
    expect(within(sidebar).getByTestId('details-editor')).toBeInTheDocument();
    expect(within(sidebar).getByAltText('Entry preview')).toBeInTheDocument();

    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toContainElement(screen.getByLabelText('Description'));
    fireEvent.click(screen.getByRole('tab', { name: 'Notes' }));
    expect(screen.getByRole('tabpanel', { name: 'Notes' })).toContainElement(screen.getByLabelText(/Private notes/));
  });

  it('renders the page header with Create and Cancel on the right, like Delete on the entry page', () => {
    renderForm();

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('heading', { level: 1, name: 'New Entry' })).toBeInTheDocument();
    expect(within(header).getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(within(header).getByRole('button', { name: 'Create Entry' })).toHaveAttribute('type', 'submit');
    expect(within(header).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('hands over the chosen image with the entry, or null when there is none', () => {
    const onSubmit = jest.fn();
    renderForm(onSubmit);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Mira Vell' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Entry' }));
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Mira Vell' }), null);

    const file = new File(['new'], 'new.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/Entry image/i, { selector: 'input' }), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Entry' }));
    expect(onSubmit).toHaveBeenLastCalledWith(expect.anything(), file);
  });

  it('does not hand over an image that was chosen and then removed', () => {
    const onSubmit = jest.fn();
    renderForm(onSubmit);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Mira Vell' } });
    fireEvent.change(screen.getByLabelText(/Entry image/i, { selector: 'input' }), {
      target: { files: [new File(['img'], 'mira.png', { type: 'image/png' })] },
    });

    fireEvent.click(screen.getByTitle('Remove Image'));
    fireEvent.click(screen.getByRole('button', { name: 'Create Entry' }));

    expect(onSubmit).toHaveBeenLastCalledWith(expect.anything(), null);
  });
});
