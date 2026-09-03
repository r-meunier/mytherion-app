import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DualSidebar from './DualSidebar';
import { useAppSelector } from '../store/hooks';

jest.mock('../store/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('DualSidebar - Project Mode & Scoped Codex Navigation', () => {
  const mockProject = {
    id: 'proj-101',
    name: 'The Broken Empire',
    description: 'A dark fantasy realm',
    genre: 'FANTASY',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockUser = {
    id: 1,
    email: 'author@mytherion.dev',
    username: 'author',
    role: 'USER',
    emailVerified: true,
  };

  beforeEach(() => {
    (useAppSelector as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        projects: { currentProject: mockProject },
        auth: { user: mockUser },
      };
      return selector(state);
    });
  });

  it('renders Codex navigation link pointing to /projects/[id]/codex', () => {
    render(<DualSidebar activeSection="codex" projectId="proj-101" />);

    const codexLinks = screen.getAllByRole('link', { name: /codex/i });
    expect(codexLinks.length).toBeGreaterThan(0);
    
    // Middle bar link should point to /projects/proj-101/codex
    const mainCodexLink = codexLinks.find(link => link.getAttribute('href') === '/projects/proj-101/codex');
    expect(mainCodexLink).toBeDefined();
    expect(mainCodexLink).toHaveAttribute('href', '/projects/proj-101/codex');
  });

  it('highlights Codex when activeSection is "codex"', () => {
    const { container } = render(<DualSidebar activeSection="codex" projectId="proj-101" />);

    const activeLinks = container.querySelectorAll('.text-primary');
    expect(activeLinks.length).toBeGreaterThan(0);
  });

  it('highlights Codex backward-compatibly when legacy activeSection is "entities"', () => {
    const { container } = render(<DualSidebar activeSection="entities" projectId="proj-101" />);

    const activeLinks = container.querySelectorAll('.text-primary');
    expect(activeLinks.length).toBeGreaterThan(0);
  });

  it('renders future Novelist Studio modules (Story Planner, Manuscript) with Phase 2 badges', () => {
    render(<DualSidebar activeSection="codex" projectId="proj-101" />);

    expect(screen.getByText('Story Planner')).toBeInTheDocument();
    expect(screen.getByText('Manuscript')).toBeInTheDocument();

    const phase2Badges = screen.getAllByText('Phase 2');
    expect(phase2Badges.length).toBeGreaterThanOrEqual(2);
  });

  it('triggers onCreateEntity when the Create New Entity button is clicked', () => {
    const onCreateEntity = jest.fn();
    render(
      <DualSidebar 
        activeSection="codex" 
        projectId="proj-101" 
        onCreateEntity={onCreateEntity} 
      />
    );

    const createBtn = screen.getByRole('button', { name: /create new entity/i });
    fireEvent.click(createBtn);

    expect(onCreateEntity).toHaveBeenCalledTimes(1);
  });

  it('renders Admin Portal link with routes.admin.users() for admin in global mode', () => {
    (useAppSelector as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        projects: { currentProject: null },
        auth: { user: { ...mockUser, role: 'ADMIN' } },
      };
      return selector(state);
    });

    render(<DualSidebar />);

    const adminLink = screen.getByRole('link', { name: /admin portal/i });
    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute('href', '/admin/users');
  });
});
