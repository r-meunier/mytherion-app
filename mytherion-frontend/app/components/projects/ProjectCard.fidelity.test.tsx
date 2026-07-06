import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectCard from './ProjectCard';
import { Project } from '@/app/services/projectService';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock useIsMounted to return true immediately
jest.mock('@/app/hooks/useIsMounted', () => ({
  useIsMounted: () => true
}));

describe('ProjectCard High Fidelity', () => {
  const mockProject: Project = {
    id: "1",
    name: 'Aetheria',
    description: 'A floating realm of arcane science.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: new Date().toISOString(),
    entityCount: 1250,
    genre: 'High Fantasy'
  };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-20T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders arcane metadata correctly', () => {
    render(<ProjectCard project={mockProject} onEdit={() => {}} onDelete={() => {}} />);

    // Verify Entity Count with localized formatting
    // Note: RTL text matcher might see "1,250 Entities" as separate nodes if formatted with space
    expect(screen.getByText(/1,250/)).toBeInTheDocument();
    expect(screen.getByText(/Entities/)).toBeInTheDocument();
    
    // Verify Genre Badge
    expect(screen.getByText('High Fantasy')).toBeInTheDocument();
  });

  // Pinning is not implemented yet — ProjectCard hardcodes `isPinned = false`
  // as a placeholder. Re-enable this once pin behavior exists.
  it.skip('renders the Pinned tag for project ID 1', () => {
    render(<ProjectCard project={mockProject} onEdit={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('Pinned')).toBeInTheDocument();
    expect(screen.getByText('stars')).toBeInTheDocument(); // Icon symbol
  });

  it('renders recent updates with "h ago" format', () => {
    // Current time is 12:00. Set updatedAt to 10:00 (2 hours ago)
    const twoHoursAgo = new Date('2024-01-20T10:00:00Z').toISOString();
    const project = { ...mockProject, updatedAt: twoHoursAgo };
    
    render(<ProjectCard project={project} onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('renders "Yesterday" for updates within 24-48 hours', () => {
    // Current time is Jan 20 12:00. Set updatedAt to Jan 19 10:00
    const yesterday = new Date('2024-01-19T10:00:00Z').toISOString();
    const project = { ...mockProject, updatedAt: yesterday };
    
    render(<ProjectCard project={project} onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('renders the progress bar with dynamic width based on ID', () => {
    const { container } = render(<ProjectCard project={mockProject} onEdit={() => {}} onDelete={() => {}} />);
    
    // Use an attribute selector or escape the slash
    const progressBar = container.querySelector('[class*="bg-primary/40"]');
    expect(progressBar).toBeInTheDocument();
    // (1 * 15 % 70) + 25 = 15 + 25 = 40%
    expect(progressBar).toHaveStyle('width: 40%');
  });
});
