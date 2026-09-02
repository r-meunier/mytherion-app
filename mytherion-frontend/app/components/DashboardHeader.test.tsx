import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardHeader from './DashboardHeader';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../store/authSlice';

// Mock the hooks
jest.mock('../store/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const mockPush = jest.fn();
const mockPathname = jest.fn(() => '/');
const mockUseRouter = jest.fn(() => ({
  push: mockPush,
  prefetch: jest.fn(),
  replace: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockPathname(),
}));

jest.mock('../store/authSlice', () => ({
  logoutUser: jest.fn(() => ({ type: 'auth/logout' })),
}));

describe('DashboardHeader', () => {
  const mockDispatch = jest.fn();
  const mockPush = jest.fn();
  
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    role: 'USER',
    emailVerified: true,
  };

  const mockAdminUser = {
    ...mockUser,
    role: 'ADMIN',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockPathname.mockReturnValue('/');
  });

  it('renders loading skeleton when not initialized', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isInitialized: false,
      isAuthenticated: false,
      user: null,
    });

    render(<DashboardHeader />);
    expect(screen.getByRole('banner').querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders login button when not authenticated', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isInitialized: true,
      isAuthenticated: false,
      user: null,
    });

    render(<DashboardHeader />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders user information when authenticated', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      user: mockUser,
    });

    render(<DashboardHeader />);
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(/Verified User/i)).toBeInTheDocument();
    expect(screen.queryByText('Arbiter')).not.toBeInTheDocument();
  });

  it('renders Arbiter badge for admin users', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      user: mockAdminUser,
    });

    render(<DashboardHeader />);
    expect(screen.getByText(/Arbiter/i)).toBeInTheDocument();
  });

  it('does not render a "Create Project" or "New Project" button', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      user: mockUser,
    });

    render(<DashboardHeader />);
    expect(screen.queryByText(/New Project/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Create Project/i)).not.toBeInTheDocument();
  });

  it('shows dropdown menu on hover and hides on mouse leave', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      user: mockAdminUser,
    });

    render(<DashboardHeader />);
    
    const profileSection = screen.getByText(mockAdminUser.username).closest('.relative');
    if (!profileSection) throw new Error('Profile section not found');

    // Initially dropdown items should be invisible/hidden
    const dropdown = screen.getByText('Settings').closest('.absolute');
    expect(dropdown).toHaveClass('invisible');

    // Hover
    fireEvent.mouseEnter(profileSection);
    expect(dropdown).toHaveClass('visible');

    // Mouse leave
    fireEvent.mouseLeave(profileSection);
    expect(dropdown).toHaveClass('invisible');
  });

  it('dispatches logout and redirects on logout click', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      user: mockUser,
    });

    mockDispatch.mockResolvedValue({ type: 'auth/logout/fulfilled' });

    render(<DashboardHeader />);
    
    const logoutButton = screen.getByText('Log out');
    fireEvent.click(logoutButton);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/logout' });
    // Wait for the async part
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
