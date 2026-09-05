import React from 'react';
import { render, screen } from '@testing-library/react';
import EntryCard from './EntryCard';
import { CodexEntry, EntryType } from '@/app/types/codex';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockEntityWithoutImage: CodexEntry = {
  id: 'entry-1',
  projectId: 'proj-1',
  type: EntryType.CHARACTER,
  name: 'Elrond',
  description: 'Lord of Rivendell',
  tags: ['elf', 'leader'],
  thumbnail: undefined,
  version: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockEntityWithImage: CodexEntry = {
  ...mockEntityWithoutImage,
  id: 'entry-2',
  name: 'Galadriel',
  thumbnail: 'entries/entry-2/portrait.webp',
};

describe('EntryCard - Image display', () => {
  it('renders without an image or placeholder when thumbnail is undefined/null', () => {
    const { container } = render(<EntryCard entry={mockEntityWithoutImage} />);
    
    expect(screen.getByText('Elrond')).toBeInTheDocument();
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(0);
  });

  it('renders image when thumbnail is present', () => {
    render(<EntryCard entry={mockEntityWithImage} />);
    
    expect(screen.getByText('Galadriel')).toBeInTheDocument();
    const image = screen.getByAltText('Galadriel');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      'src',
      'http://localhost:9000/entries/entry-2/portrait.webp'
    );
  });
});
