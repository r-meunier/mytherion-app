import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock Child Components to simplify
jest.mock('../components/AppHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock('../components/projects/ProjectList', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-project-list">Project List</div>,
}));

jest.mock('../components/projects/ProjectFilters', () => ({
  __esModule: true,
  default: ({ onCreateClick }: { onCreateClick?: () => void }) => (
    <div data-testid="mock-filters">
      <button onClick={onCreateClick}>Create World</button>
    </div>
  ),
}));

describe('Dashboard Page (Home)', () => {
  const mockDispatch = jest.fn();
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders the Dashboard identity correctly', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isInitialized: true,
    });

    render(<Home />);
    
    expect(screen.getByText('Your Worlds')).toBeInTheDocument();
    expect(screen.getByText(/Pick up where you left off/)).toBeInTheDocument();
  });

  it('redirects to login if not authenticated', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isInitialized: true,
    });

    render(<Home />);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('shows the ProjectModal when in-page Create World button is clicked', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isInitialized: true,
    });

    render(<Home />);
    
    const createButton = screen.getByText('Create World');
    fireEvent.click(createButton);
    
    // ProjectModal title should now be in the document
    expect(screen.getByText('Initiate New World')).toBeInTheDocument();
  });

  it('renders the filters and project list components', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isInitialized: true,
    });

    render(<Home />);
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
    expect(screen.getByTestId('mock-project-list')).toBeInTheDocument();
  });
});
