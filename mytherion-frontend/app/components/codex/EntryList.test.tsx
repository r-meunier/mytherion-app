import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EntryList from './EntryList';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { CodexEntry, EntryType } from '@/app/types/codex';

// Mock Redux hooks
jest.mock('@/app/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
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

describe('EntryList Component', () => {
  const mockDispatch = jest.fn();
  const projectId = 'proj-123';

  const mockEntries: CodexEntry[] = [
    {
      id: 'entry-1',
      projectId,
      name: 'Gandalf the Grey',
      type: EntryType.CHARACTER,
      description: 'A wandering wizard of Middle-earth.',
      tags: ['wizard', 'istari'],
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'entry-2',
      projectId,
      name: 'Rivendell',
      type: EntryType.LOCATION,
      description: 'The Last Homely House East of the Sea.',
      tags: ['elves', 'sanctuary'],
      version: 1,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];


  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useAppSelector as jest.Mock).mockReturnValue({
      entries: mockEntries,
      loading: false,
      error: null,
      filters: {
        type: undefined,
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

  const renderEntryList = async (props = {}) => {
    const result = render(<EntryList projectId={projectId} {...props} />);
    await waitFor(() => {
    });
    return result;
  };

  it('renders entry list', async () => {
    await renderEntryList({ projectName: "Middle-earth" });

    expect(screen.getByText('Gandalf the Grey')).toBeInTheDocument();
    expect(screen.getByText('Rivendell')).toBeInTheDocument();
  });

  it('opens delete confirmation modal and dismisses it on backdrop click', async () => {
    await renderEntryList();

    // Click delete on first entry card
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    // Modal should be visible
    expect(screen.getByText('Delete Entry?')).toBeInTheDocument();

    // Click on the backdrop
    const backdrop = screen.getByTestId('delete-modal-backdrop');
    fireEvent.click(backdrop);

    // Modal should be dismissed
    expect(screen.queryByText('Delete Entry?')).not.toBeInTheDocument();
  });

  it('does not dismiss delete modal when clicking inside the modal dialog body', async () => {
    await renderEntryList();

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Entry?')).toBeInTheDocument();

    // Click inside modal dialog text
    const modalHeading = screen.getByText('Delete Entry?');
    fireEvent.click(modalHeading);

    // Modal should remain open
    expect(screen.getByText('Delete Entry?')).toBeInTheDocument();
  });

  it('dismisses delete modal when pressing the Escape key', async () => {
    await renderEntryList();

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Entry?')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    // Modal should be dismissed
    expect(screen.queryByText('Delete Entry?')).not.toBeInTheDocument();
  });

  it('keeps entry cards mounted with reduced opacity during refetch without flashing', async () => {
    // When loading is true but entries already exist (background refetch on search)
    (useAppSelector as jest.Mock).mockReturnValue({
      entries: mockEntries,
      loading: true, // background loading
      error: null,
      filters: { search: 'Gandalf' },
      pagination: { page: 0, size: 20, totalPages: 1, totalElements: 1 },
    });

    const { container } = await renderEntryList();

    // Entries should NOT be unmounted or replaced with empty/skeleton screen
    expect(screen.getByText('Gandalf the Grey')).toBeInTheDocument();
    
    // Grid should have opacity-60 styling for smooth transition
    const grid = container.querySelector('.opacity-60');
    expect(grid).toBeInTheDocument();
  });

      it('immediately flushes search on Enter without waiting for debounce', async () => {
    await renderEntryList();

    const searchInput = screen.getByPlaceholderText('Filter entries...');
    fireEvent.change(searchInput, { target: { value: 'InstantSearch' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'entries/setFilters',
        payload: expect.objectContaining({
          search: 'InstantSearch',
        }),
      })
    );
  });
});
