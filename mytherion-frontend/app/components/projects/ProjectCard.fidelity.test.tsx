import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectCard from './ProjectCard';
import { Project } from '@/app/services/projectService';

// Mock Next.js Link component with displayName for ESLint compliance
jest.mock('next/link', () => {
  const MockLink = ({ children, href, 'aria-label': ariaLabel }: { children: React.ReactNode; href: string; 'aria-label'?: string }) => {
    return <a href={href} aria-label={ariaLabel}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
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
    entryCount: 1250,
    genre: 'High Fantasy'
  };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-20T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders arcane content correctly', () => {
    render(<ProjectCard project={mockProject} onEdit={() => {}} onDelete={() => {}} />);

    // Verify CodexEntry Count with localized formatting
    expect(screen.getByText(/1,250/)).toBeInTheDocument();
    expect(screen.getByText(/Entries/)).toBeInTheDocument();
    
    // Verify Genre Badge
    expect(screen.getByText('High Fantasy')).toBeInTheDocument();
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

  it('renders "Just now" for brand-new updates under 1 minute', () => {
    // Current time is 12:00:00. Set updatedAt to 11:59:45 (15 seconds ago)
    const justNow = new Date('2024-01-20T11:59:45Z').toISOString();
    const project = { ...mockProject, updatedAt: justNow };
    
    render(<ProjectCard project={project} onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('Just now')).toBeInTheDocument();
    expect(screen.queryByText('1h ago')).not.toBeInTheDocument();
  });

  it('renders "5m ago" for updates 5 minutes ago', () => {
    // Current time is 12:00. Set updatedAt to 11:55 (5 minutes ago)
    const fiveMinutesAgo = new Date('2024-01-20T11:55:00Z').toISOString();
    const project = { ...mockProject, updatedAt: fiveMinutesAgo };
    
    render(<ProjectCard project={project} onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('5m ago')).toBeInTheDocument();
    expect(screen.queryByText('1h ago')).not.toBeInTheDocument();
  });

  it('renders "3d ago" for updates 3 days ago', () => {
    // Current time is Jan 20 12:00. Set updatedAt to Jan 17 12:00 (3 days ago)
    const threeDaysAgo = new Date('2024-01-17T12:00:00Z').toISOString();
    const project = { ...mockProject, updatedAt: threeDaysAgo };
    
    render(<ProjectCard project={project} onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('3d ago')).toBeInTheDocument();
  });

  it('renders date with year for updates from a previous year', () => {
    // Current year is 2024. Set updatedAt to May 10, 2022
    const pastYearDate = '2022-05-10T10:00:00Z';
    const project = { ...mockProject, updatedAt: pastYearDate };

    render(<ProjectCard project={project} onEdit={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('May 10, 2022')).toBeInTheDocument();
  });

  it('handles invalid date strings gracefully without rendering NaN or crashing', () => {
    const project = { ...mockProject, updatedAt: 'not-a-valid-date', createdAt: 'invalid' };

    render(<ProjectCard project={project} onEdit={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('Unknown date')).toBeInTheDocument();
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
  });

  it('renders correctly in list variant layout with accessible link label', () => {
    render(<ProjectCard project={mockProject} variant="list" onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('Aetheria')).toBeInTheDocument();
    expect(screen.getByText('High Fantasy')).toBeInTheDocument();
    expect(screen.getByText(/1,250/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open project aetheria/i })).toBeInTheDocument();
  });
});
