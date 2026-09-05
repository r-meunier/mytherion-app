import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectList from './ProjectList';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { deleteProject, fetchProjects } from '@/app/store/projectSlice';
import { Project } from '@/app/services/projectService';

// Mock Next.js Link with displayName
jest.mock('next/link', () => {
  const MockLink = ({ children, href, 'aria-label': ariaLabel }: { children: React.ReactNode; href: string; 'aria-label'?: string }) => (
    <a href={href} aria-label={ariaLabel}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock useIsMounted
jest.mock('@/app/hooks/useIsMounted', () => ({
  useIsMounted: () => true,
}));

// Mock Redux hooks
jest.mock('@/app/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

// Mock projectSlice thunks
jest.mock('@/app/store/projectSlice', () => ({
  deleteProject: jest.fn((id: string) => ({ type: 'projects/deleteProject', payload: id })),
  fetchProjects: jest.fn((params: { page: number; size: number }) => ({ type: 'projects/fetchProjects', payload: params })),
}));

describe('ProjectList', () => {
  const mockDispatch = jest.fn();
  const mockOnCreateClick = jest.fn();
  const mockOnEditClick = jest.fn();
  const mockOnPageChange = jest.fn();

  const mockProjects: Project[] = [
    {
      id: 'p1',
      name: 'Chronicles of Eldoria',
      description: 'High fantasy epic.',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      genre: 'High Fantasy',
      entityCount: 15,
    },
    {
      id: 'p2',
      name: 'Aetheria Skies',
      description: 'Steampunk airborne world.',
      createdAt: '2024-01-15T12:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
      genre: 'Steampunk',
      entityCount: 42,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as jest.Mock).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
      pagination: {
        page: 0,
        size: 8,
        totalPages: 3,
        totalElements: 20,
      },
    });
  });

  it('renders all projects in grid layout by default', () => {
    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
      />
    );

    expect(screen.getByText('Chronicles of Eldoria')).toBeInTheDocument();
    expect(screen.getByText('Aetheria Skies')).toBeInTheDocument();
  });

  it('renders projects in list layout when viewMode="list"', () => {
    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        viewMode="list"
      />
    );

    expect(screen.getByText('Chronicles of Eldoria')).toBeInTheDocument();
    expect(screen.getByText('Aetheria Skies')).toBeInTheDocument();
  });

  it('sorts projects by name alphabetically when sortBy="name"', () => {
    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        sortBy="name"
      />
    );

    const projectNames = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    // 'Aetheria Skies' should come before 'Chronicles of Eldoria'
    expect(projectNames).toEqual(['Aetheria Skies', 'Chronicles of Eldoria']);
  });

  it('sorts projects by date descending when sortBy="date"', () => {
    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        sortBy="date"
      />
    );

    const projectNames = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    // 'Aetheria Skies' (Jan 15) before 'Chronicles of Eldoria' (Jan 10)
    expect(projectNames).toEqual(['Aetheria Skies', 'Chronicles of Eldoria']);
  });

  it('shows empty state when no projects match', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      projects: [],
      loading: false,
      error: null,
      pagination: { page: 0, size: 8, totalPages: 0, totalElements: 0 },
    });

    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
      />
    );

    expect(screen.getByText('No projects found')).toBeInTheDocument();
    const createBtn = screen.getByRole('button', { name: /create project/i });
    fireEvent.click(createBtn);
    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it('renders error banner when error is present in Redux state', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      projects: [],
      loading: false,
      error: 'Failed to load arcane records',
      pagination: { page: 0, size: 8, totalPages: 0, totalElements: 0 },
    });

    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
      />
    );

    expect(screen.getByText('Failed to load arcane records')).toBeInTheDocument();
  });

  it('handles state where projects is undefined without crashing', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      projects: undefined,
      loading: false,
      error: null,
      pagination: null,
    });

    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
      />
    );

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('opens delete confirmation overlay and confirms deletion', () => {
    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
      />
    );

    // Open options menu for the first project
    const menuButtons = screen.getAllByLabelText('Project options');
    fireEvent.click(menuButtons[0]);

    // Click Delete in dropdown
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Delete confirmation overlay should appear
    expect(screen.getByText('Delete this project?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();

    // Click Confirm Delete
    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
    fireEvent.click(confirmBtn);

    // p2 is the first project because default date sort orders newest (Jan 15) first
    expect(mockDispatch).toHaveBeenCalledWith(deleteProject('p2'));
  });

  it('cancels delete confirmation overlay', () => {
    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
      />
    );

    const menuButtons = screen.getAllByLabelText('Project options');
    fireEvent.click(menuButtons[0]);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete this project?')).toBeInTheDocument();

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText('Delete this project?')).not.toBeInTheDocument();
    expect(deleteProject).not.toHaveBeenCalled();
  });

  it('handles pagination next and previous clicks with onPageChange callback', () => {
    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('dispatches fetchProjects directly on page change when onPageChange is not provided', () => {
    render(
      <ProjectList
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    expect(mockDispatch).toHaveBeenCalledWith(fetchProjects({ page: 1, size: 8 }));
  });
});
