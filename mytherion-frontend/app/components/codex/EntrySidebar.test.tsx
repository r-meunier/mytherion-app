import React from 'react';
import { render, screen } from '@testing-library/react';
import EntrySidebar from './EntrySidebar';
import { CodexEntry, EntryType } from '@/app/types/codex';

const entry: CodexEntry = {
  id: 'e1',
  projectId: 'p1',
  type: EntryType.CHARACTER,
  name: 'Mira Vell',
  tags: [],
  content: {
    templateId: 'character-basic',
    details: [
      { id: 'a', label: 'Pronouns', value: 'she/her' },
      { id: 'b', label: 'Voice', value: null, hint: 'How do they talk?' },
    ],
  },
  version: 1,
  createdAt: '2026-10-08T10:00:00Z',
  updatedAt: '2026-10-08T11:00:00Z',
};

describe('EntrySidebar', () => {
  it('shows the thumbnail when the entry has one', () => {
    render(<EntrySidebar entry={{ ...entry, thumbnail: 'https://cdn.example/mira.png' }} />);

    expect(screen.getByRole('img', { name: 'Mira Vell' })).toHaveAttribute('src', 'https://cdn.example/mira.png');
  });

  it('shows a placeholder instead of an image when there is no thumbnail', () => {
    render(<EntrySidebar entry={entry} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('lists only the details that have a value', () => {
    render(<EntrySidebar entry={entry} />);

    expect(screen.getByText('Pronouns')).toBeInTheDocument();
    expect(screen.getByText('she/her')).toBeInTheDocument();
    expect(screen.queryByText('Voice')).not.toBeInTheDocument();
  });

  it('reads content saved before details existed as no details', () => {
    render(<EntrySidebar entry={{ ...entry, content: { sections: [] } as unknown as CodexEntry['content'] }} />);

    expect(screen.getByText('No details yet.')).toBeInTheDocument();
  });
});
