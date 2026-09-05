import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useRouter } from 'next/navigation';

// Mock Hooks
jest.mock('../store/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock projectSlice thunks
jest.mock('../store/projectSlice', () => {
  const actual = jest.requireActual('../store/projectSlice');
  return {
    ...actual,
    fetchProjects: jest.fn((params: Record<string, unknown>) => ({ type: 'projects/fetchProjects', payload: params })),
  };
});

// Mock Child Components
jest.mock('../components/AppHeader', () => {
  const MockHeader = () => <div data-testid="mock-header">Header</div>;
  MockHeader.displayName = 'MockHeader';
  return MockHeader;
});

jest.mock('../components/projects/ProjectList', () => {
  const MockProjectList = ({
    onCreateClick,
    onEditClick,
    onPageChange,
    sortBy,
    viewMode,
  }: {
    onCreateClick?: () => void;
    onEditClick?: (id: string) => void;
    onPageChange?: (page: number) => void;
    sortBy?: string;
    viewMode?: string;
  }) => (
    <div data-testid="mock-project-list" data-sort={sortBy} data-view={viewMode}>
      <button onClick={onCreateClick}>List Create Button</button>
      <button onClick={() => onEditClick?.('p1')}>Edit Project p1</button>
      <button onClick={() => onPageChange?.(1)}>Go To Page 2</button>
    </div>
  );
  MockProjectList.displayName = 'MockProjectList';
  return MockProjectList;
});

jest.mock('../components/projects/ProjectFilters', () => {
  const MockFilters = ({
    onSearchChange,
    onSortChange,
    onGenreChange,
    onViewChange,
    onCreateClick,
    viewMode,
  }: {
    onSearchChange?: (q: string) => void;
    onSortChange?: (s: string) => void;
    onGenreChange?: (g: string) => void;
    onViewChange?: (v: 'grid' | 'list') => void;
    onCreateClick?: () => void;
    viewMode?: string;
  }) => (
    <div data-testid="mock-filters" data-view={viewMode}>
      <button onClick={onCreateClick}>Create Project</button>
      <button onClick={() => onSearchChange?.('Aetheria')}>Search Aetheria</button>
      <button onClick={() => onSortChange?.('name')}>Sort Name</button>
      <button onClick={() => onGenreChange?.('Steampunk')}>Genre Steampunk</button>
      <button onClick={() => onViewChange?.('list')}>Switch to List</button>
    </div>
  );
  MockFilters.displayName = 'MockFilters';
  return MockFilters;
});

describe('Dashboard Page (Home)', () => {
  const mockDispatch = jest.fn();
  const mockRouter = { push: jest.fn() };

  const mockProjects = [
    {
      id: 'p1',
      name: 'Chronicles of Eldoria',
      description: 'High fantasy epic world.',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      genre: 'High Fantasy',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        auth: { isAuthenticated: true, isInitialized: true },
        dashboard: { stats: null, loading: false },
        projects: {
          projects: mockProjects,
          loading: false,
          pagination: { page: 0, size: 8, totalPages: 2, totalElements: 10 },
        },
      };
      return selector(state);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the Dashboard identity correctly', () => {
    render(<Home />);
    
    expect(screen.getByText('Your Projects')).toBeInTheDocument();
    expect(screen.getByText(/Pick up where you left off/)).toBeInTheDocument();
  });

  it('redirects to login if not authenticated', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        auth: { isAuthenticated: false, isInitialized: true },
        dashboard: { stats: null, loading: false },
        projects: { projects: [], loading: false, pagination: null },
      };
      return selector(state);
    });

    render(<Home />);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('shows the ProjectModal in creation mode when Create Project button is clicked', () => {
    render(<Home />);
    
    const createButton = screen.getByText('Create Project');
    fireEvent.click(createButton);
    
    expect(screen.getByText('Initiate New Project')).toBeInTheDocument();
  });

  it('opens ProjectModal in edit mode with pre-filled project data when onEditClick is triggered', () => {
    render(<Home />);

    const editBtn = screen.getByText('Edit Project p1');
    fireEvent.click(editBtn);

    // Edit Project modal should appear with pre-filled title
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Chronicles of Eldoria')).toBeInTheDocument();
  });

  it('resets page to 0 and triggers project fetch when sorting is changed', () => {
    render(<Home />);

    const sortBtn = screen.getByText('Sort Name');
    fireEvent.click(sortBtn);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'projects/fetchProjects',
      payload: expect.objectContaining({
        page: 0,
        sortBy: 'name',
        sortDir: 'asc',
      }),
    });
  });

  it('debounces search input changes before dispatching fetchProjects', () => {
    render(<Home />);
    mockDispatch.mockClear();

    const searchBtn = screen.getByText('Search Aetheria');
    fireEvent.click(searchBtn);

    // Should not dispatch immediately due to 300ms debounce
    expect(mockDispatch).not.toHaveBeenCalled();

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'projects/fetchProjects',
      payload: expect.objectContaining({
        search: 'Aetheria',
      }),
    });
  });

  it('handles page changes from ProjectList pagination', () => {
    render(<Home />);
    mockDispatch.mockClear();

    const pageBtn = screen.getByText('Go To Page 2');
    fireEvent.click(pageBtn);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'projects/fetchProjects',
      payload: expect.objectContaining({
        page: 1,
      }),
    });
  });
});
