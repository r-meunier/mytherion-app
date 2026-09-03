import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EntityList from './EntityList';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { categoryService } from '@/app/services/categoryService';
import { Entity, EntityType } from '@/app/types/entity';

// Mock Redux hooks
jest.mock('@/app/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

// Mock categoryService
jest.mock('@/app/services/categoryService', () => ({
  categoryService: {
    getCategories: jest.fn(),
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('EntityList Component', () => {
  const mockDispatch = jest.fn();
  const projectId = 'proj-123';

  const mockEntities: Entity[] = [
    {
      id: 'entity-1',
      projectId,
      name: 'Gandalf the Grey',
      type: EntityType.CHARACTER,
      categoryId: 'cat-1',
      description: 'A wandering wizard of Middle-earth.',
      tags: ['wizard', 'istari'],
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'entity-2',
      projectId,
      name: 'Rivendell',
      type: EntityType.LOCATION,
      categoryId: 'cat-2',
      description: 'The Last Homely House East of the Sea.',
      tags: ['elves', 'sanctuary'],
      version: 1,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockCategories = [
    { id: 'cat-1', projectId, name: 'Characters & People', description: 'People of the world' },
    { id: 'cat-2', projectId, name: 'Locations & Havens', description: 'Places of note' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (categoryService.getCategories as jest.Mock).mockResolvedValue(mockCategories);

    (useAppSelector as jest.Mock).mockReturnValue({
      entities: mockEntities,
      loading: false,
      error: null,
      filters: {
        type: undefined,
        categoryId: undefined,
        tags: [],
        search: '',
      },
      pagination: {
        page: 0,
        size: 20,
        totalPages: 1,
        totalElements: 2,
      },
    });
  });

  const renderEntityList = async (props = {}) => {
    const result = render(<EntityList projectId={projectId} {...props} />);
    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalledWith(projectId);
    });
    return result;
  };

  it('renders entity list and loads project categories', async () => {
    await renderEntityList({ projectName: "Middle-earth" });

    expect(screen.getByText('Gandalf the Grey')).toBeInTheDocument();
    expect(screen.getByText('Rivendell')).toBeInTheDocument();
  });

  it('opens delete confirmation modal and dismisses it on backdrop click', async () => {
    await renderEntityList();

    // Click delete on first entity card
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    // Modal should be visible
    expect(screen.getByText('Delete Entity?')).toBeInTheDocument();

    // Click on the backdrop
    const backdrop = screen.getByTestId('delete-modal-backdrop');
    fireEvent.click(backdrop);

    // Modal should be dismissed
    expect(screen.queryByText('Delete Entity?')).not.toBeInTheDocument();
  });

  it('does not dismiss delete modal when clicking inside the modal dialog body', async () => {
    await renderEntityList();

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Entity?')).toBeInTheDocument();

    // Click inside modal dialog text
    const modalHeading = screen.getByText('Delete Entity?');
    fireEvent.click(modalHeading);

    // Modal should remain open
    expect(screen.getByText('Delete Entity?')).toBeInTheDocument();
  });

  it('dismisses delete modal when pressing the Escape key', async () => {
    await renderEntityList();

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Entity?')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    // Modal should be dismissed
    expect(screen.queryByText('Delete Entity?')).not.toBeInTheDocument();
  });

  it('keeps entity cards mounted with reduced opacity during refetch without flashing', async () => {
    // When loading is true but entities already exist (background refetch on search)
    (useAppSelector as jest.Mock).mockReturnValue({
      entities: mockEntities,
      loading: true, // background loading
      error: null,
      filters: { search: 'Gandalf' },
      pagination: { page: 0, size: 20, totalPages: 1, totalElements: 1 },
    });

    const { container } = await renderEntityList();

    // Entities should NOT be unmounted or replaced with empty/skeleton screen
    expect(screen.getByText('Gandalf the Grey')).toBeInTheDocument();
    
    // Grid should have opacity-60 styling for smooth transition
    const grid = container.querySelector('.opacity-60');
    expect(grid).toBeInTheDocument();
  });
});
