import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EntryTabs from './EntryTabs';

const tabs = [
  { id: 'overview', label: 'Overview', content: <p>The description</p> },
  { id: 'notes', label: 'Notes', content: <p>The notes</p> },
];

describe('EntryTabs', () => {
  it('shows the first tab and keeps the others hidden', () => {
    render(<EntryTabs tabs={tabs} />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('The description');
    expect(screen.getByText('The notes')).not.toBeVisible();
  });

  it('switches panels on click', () => {
    render(<EntryTabs tabs={tabs} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Notes' }));

    expect(screen.getByRole('tab', { name: 'Notes' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Notes' })).toHaveTextContent('The notes');
    expect(screen.getByText('The description')).not.toBeVisible();
  });

  it('moves between tabs with the arrow keys, wrapping at the ends', () => {
    render(<EntryTabs tabs={tabs} />);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Overview' }), { key: 'ArrowLeft' });

    const notes = screen.getByRole('tab', { name: 'Notes' });
    expect(notes).toHaveAttribute('aria-selected', 'true');
    expect(notes).toHaveFocus();
  });

  it('does not submit a surrounding form', () => {
    const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <EntryTabs tabs={tabs} />
      </form>
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Notes' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
