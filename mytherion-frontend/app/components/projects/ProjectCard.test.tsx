import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectCard from './ProjectCard';
import { Project } from '@/app/services/projectService';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock FontAwesome icons
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => <span data-testid="icon">{icon.iconName}</span>,
}));

describe('ProjectCard', () => {
  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnCancelDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== Rendering Tests ====================

  it('should render project information correctly', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render without description if not provided', () => {
    const projectWithoutDesc = { ...mockProject, description: null };
    render(
      <ProjectCard
        project={projectWithoutDesc}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Created Jan 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Updated Jan 20, 2024/)).toBeInTheDocument();
  });

  it('should link to project detail page', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/1');
  });

  // ==================== Edit Button Tests ====================

  it('should call onEdit with correct ID when edit button is clicked', () => {
    const { container } = render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = container.querySelector('button[title="Edit project"]');
    expect(editButton).toBeInTheDocument();
    
    fireEvent.click(editButton!);
    expect(mockOnEdit).toHaveBeenCalledWith(1);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  // ==================== Delete Confirmation Tests ====================

  it('should show confirmation overlay when delete button is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onCancelDelete={mockOnCancelDelete}
        isDeleteConfirm={true}
      />
    );

    expect(screen.getByText('Delete this project?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should not show confirmation overlay by default', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Delete this project?')).not.toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    const { container } = render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = container.querySelector('button[title="Delete project"]');
    expect(deleteButton).toBeInTheDocument();
    
    fireEvent.click(deleteButton!);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('should call onDelete when confirm button is clicked in overlay', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onCancelDelete={mockOnCancelDelete}
        isDeleteConfirm={true}
      />
    );

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(1);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should call onCancelDelete when cancel button is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onCancelDelete={mockOnCancelDelete}
        isDeleteConfirm={true}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancelDelete).toHaveBeenCalledTimes(1);
  });

  it('should prevent event propagation when clicking overlay buttons', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onCancelDelete={mockOnCancelDelete}
        isDeleteConfirm={true}
      />
    );

    const confirmButton = screen.getByText('Confirm Delete');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent(confirmButton, clickEvent);
    
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
