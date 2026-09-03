import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppHeader from './AppHeader';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useRouter, usePathname } from 'next/navigation';

// Mock Redux hooks
jest.mock('../store/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('AppHeader High Fidelity', () => {
  const mockUser = {
    id: 1,
    username: 'Alistair Thorne',
    role: 'ADMIN',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      isInitialized: true,
    });
  });

  it('hides the top search on the Worlds page (pathname === "/")', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<AppHeader />);
    
    expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
  });

  it('renders the Search input with correct placeholder inside projects', () => {
    (usePathname as jest.Mock).mockReturnValue('/projects/1');
    render(<AppHeader />);
    
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText('search')).toBeInTheDocument(); // Icon symbol
  });

  it('renders the notifications button', () => {
    render(<AppHeader />);
    
    expect(screen.getByText('notifications')).toBeInTheDocument();
  });

  it('renders "Projects" navigation link when on the home page', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<AppHeader />);
    
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('transforms link to "Back to Projects" when in project mode', () => {
    (usePathname as jest.Mock).mockReturnValue('/projects/1');
    
    render(<AppHeader />);
    
    expect(screen.getByText('Back to Projects')).toBeInTheDocument();
    expect(screen.getByText('arrow_back')).toBeInTheDocument(); // Back icon
  });

  it('renders the Arbiter status in the profile dropdown (hidden by default)', () => {
    render(<AppHeader />);
    
    // The text should be in the document (hidden by CSS/Opacity)
    expect(screen.getByText('Arbiter Level 4')).toBeInTheDocument();
  });

  it('renders "Archivist Level 4" sub-branding in the header', () => {
    render(<AppHeader />);
    
    expect(screen.getByText('Archivist Level 4')).toBeInTheDocument();
  });
});
