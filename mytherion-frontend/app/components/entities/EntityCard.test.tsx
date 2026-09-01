import React from 'react';
import { render, screen } from '@testing-library/react';
import EntityCard from './EntityCard';
import { Entity, EntityType } from '@/app/types/entity';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockEntityWithoutImage: Entity = {
  id: 'entity-1',
  projectId: 'proj-1',
  type: EntityType.CHARACTER,
  name: 'Elrond',
  description: 'Lord of Rivendell',
  tags: ['elf', 'leader'],
  thumbnail: undefined,
  version: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockEntityWithImage: Entity = {
  ...mockEntityWithoutImage,
  id: 'entity-2',
  name: 'Galadriel',
  thumbnail: 'entities/entity-2/portrait.webp',
};

describe('EntityCard - Image display', () => {
  it('renders without an image or placeholder when thumbnail is undefined/null', () => {
    const { container } = render(<EntityCard entity={mockEntityWithoutImage} />);
    
    expect(screen.getByText('Elrond')).toBeInTheDocument();
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(0);
  });

  it('renders image when thumbnail is present', () => {
    render(<EntityCard entity={mockEntityWithImage} />);
    
    expect(screen.getByText('Galadriel')).toBeInTheDocument();
    const image = screen.getByAltText('Galadriel');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      'src',
      'http://localhost:9000/entities/entity-2/portrait.webp'
    );
  });
});
