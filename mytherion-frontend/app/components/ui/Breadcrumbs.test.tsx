import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Breadcrumbs from './Breadcrumbs';
import PageHeader from './PageHeader';
import { projectTrail } from '@/app/config/breadcrumbs';

describe('Breadcrumbs', () => {
  it('links every crumb but the last, which is marked as the current page', () => {
    render(<Breadcrumbs items={projectTrail('p1', 'Stellar Drift', { label: 'Codex', href: '/projects/p1/codex' }, { label: 'The Ark Council' })} />);

    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(trail).getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/');
    expect(within(trail).getByRole('link', { name: 'Stellar Drift' })).toHaveAttribute('href', '/projects/p1');
    expect(within(trail).getByRole('link', { name: 'Codex' })).toHaveAttribute('href', '/projects/p1/codex');
    expect(within(trail).queryByRole('link', { name: 'The Ark Council' })).not.toBeInTheDocument();
    expect(within(trail).getByText('The Ark Council')).toHaveAttribute('aria-current', 'page');
  });

  it('does not link the last crumb even when it has an href', () => {
    render(<Breadcrumbs items={projectTrail('p1', 'Stellar Drift')} />);

    expect(screen.queryByRole('link', { name: 'Stellar Drift' })).not.toBeInTheDocument();
    expect(screen.getByText('Stellar Drift')).toHaveAttribute('aria-current', 'page');
  });

  it('falls back to "Project" until the project name has loaded', () => {
    render(<Breadcrumbs items={projectTrail('p1', undefined, { label: 'Codex' })} />);

    expect(screen.getByRole('link', { name: 'Project' })).toHaveAttribute('href', '/projects/p1');
  });
});

describe('PageHeader with breadcrumbs and badge', () => {
  it('puts the breadcrumbs above the title and the badge next to it', () => {
    render(
      <PageHeader
        title="The Ark Council"
        breadcrumbs={[{ label: 'Codex', href: '/c' }, { label: 'The Ark Council' }]}
        badge={<span>Organization</span>}
      />
    );

    const heading = screen.getByRole('heading', { level: 1, name: 'The Ark Council' });
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(trail.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(heading.parentElement).toHaveTextContent('Organization');
  });
});
