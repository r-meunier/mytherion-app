import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProjectForm from './ProjectForm';
import { Project } from '@/app/services/projectService';

// Mock FontAwesome icons
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => <span data-testid="icon">{icon.iconName}</span>,
}));

describe('ProjectForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const mockProject: Project = {
    id: 1,
    name: 'Existing Project',
    description: 'Existing Description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  // ==================== Rendering Tests ====================

  it('should render empty form for create mode', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    const descInput = screen.getByLabelText(/Description/i);

    expect(nameInput).toHaveValue('');
    expect(descInput).toHaveValue('');
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('should render pre-filled form for edit mode', () => {
    render(
      <ProjectForm
        project={mockProject}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    const descInput = screen.getByLabelText(/Description/i);

    expect(nameInput).toHaveValue('Existing Project');
    expect(descInput).toHaveValue('Existing Description');
    expect(screen.getByText('Update Project')).toBeInTheDocument();
  });

  it('should update form when project prop changes', () => {
    const { rerender } = render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    expect(nameInput).toHaveValue('');

    rerender(
      <ProjectForm
        project={mockProject}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(nameInput).toHaveValue('Existing Project');
  });

  // ==================== Validation Tests ====================

  it('should show error when name is empty', async () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Create Project');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show error when name exceeds 255 characters', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    const longName = 'a'.repeat(256);
    
    await user.type(nameInput, longName);
    
    const submitButton = screen.getByText('Create Project');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Project name must be less than 255 characters')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show character count', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('0/255 characters')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Project Name/i);
    await user.type(nameInput, 'Test');

    expect(screen.getByText('4/255 characters')).toBeInTheDocument();
  });

  // ==================== Form Submission Tests ====================

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    const descInput = screen.getByLabelText(/Description/i);

    await user.type(nameInput, 'New Project');
    await user.type(descInput, 'New Description');

    const submitButton = screen.getByText('Create Project');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'New Description',
      });
    });
  });

  it('should trim whitespace from inputs', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    const descInput = screen.getByLabelText(/Description/i);

    await user.type(nameInput, '  Trimmed Name  ');
    await user.type(descInput, '  Trimmed Desc  ');

    const submitButton = screen.getByText('Create Project');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Trimmed Name',
        description: 'Trimmed Desc',
      });
    });
  });

  it('should submit with undefined description if empty', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    await user.type(nameInput, 'Project Without Description');

    const submitButton = screen.getByText('Create Project');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Project Without Description',
        description: undefined,
      });
    });
  });

  // ==================== Cancel Button Tests ====================

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  // ==================== Loading State Tests ====================

  it('should disable inputs when loading', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    const descInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByText(/Saving.../i);

    expect(nameInput).toBeDisabled();
    expect(descInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should show saving state when loading', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
