import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectPageLayout from './ProjectPageLayout';

jest.mock('./AppHeader', () => {
  const MockHeader = () => <header data-testid="mock-header" />;
  MockHeader.displayName = 'MockHeader';
  return MockHeader;
});

jest.mock('./DualSidebar', () => {
  const MockSidebar = ({ activeSection }: { activeSection: string }) => <nav data-testid="mock-sidebar" data-active={activeSection} />;
  MockSidebar.displayName = 'MockSidebar';
  return MockSidebar;
});

describe('ProjectPageLayout', () => {
  it('renders the content inside the header and project sidebar', () => {
    render(<ProjectPageLayout projectId="p1" activeSection="codex"><h1>Codex</h1></ProjectPageLayout>);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toHaveAttribute('data-active', 'codex');
    expect(screen.getByRole('heading', { name: 'Codex' })).toBeInTheDocument();
  });

  it('keeps the header and sidebar while loading, with a spinner in place of the content', () => {
    render(<ProjectPageLayout projectId="p1" activeSection="codex" loading><h1>Codex</h1></ProjectPageLayout>);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Codex' })).not.toBeInTheDocument();
  });

  it('shows an error in place of the content, even while loading', () => {
    render(<ProjectPageLayout projectId="p1" activeSection="codex" loading error="Entry not found"><h1>Codex</h1></ProjectPageLayout>);

    expect(screen.getByRole('alert')).toHaveTextContent('Entry not found');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
