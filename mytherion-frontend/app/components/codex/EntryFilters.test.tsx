import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EntryFilters from './EntryFilters';
import { EntryType } from '@/app/types/codex';

describe('EntryFilters Component', () => {
  const defaultProps = {
    search: '',
    onSearchChange: jest.fn(),
    sortBy: 'date' as const,
    onSortChange: jest.fn(),
    selectedType: undefined,
    onTypeChange: jest.fn(),
    onCreateClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input, sort trigger, type filter trigger, and create button', () => {
    render(<EntryFilters {...defaultProps} />);

    expect(screen.getByPlaceholderText('Filter entries...')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByTitle('Filter by Type')).toBeInTheDocument();
    expect(screen.getByText('Create Entry')).toBeInTheDocument();
  });

  it('calls onSearchChange when user types in search field', () => {
    render(<EntryFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Filter entries...');
    fireEvent.change(searchInput, { target: { value: 'Shadow' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('Shadow');
  });

  it('opens sort popover and calls onSortChange when selecting a sort option', () => {
    render(<EntryFilters {...defaultProps} />);

    const sortButton = screen.getByTitle('Sort order');
    fireEvent.click(sortButton);

    const nameOption = screen.getByRole('button', { name: /name/i });
    fireEvent.click(nameOption);

    expect(defaultProps.onSortChange).toHaveBeenCalledWith('name');
  });

  it('opens filter popover and calls onTypeChange when selecting a type', () => {
    render(<EntryFilters {...defaultProps} />);

    const filterButton = screen.getByTitle('Filter by Type');
    fireEvent.click(filterButton);

    const characterOption = screen.getByRole('button', { name: /character/i });
    fireEvent.click(characterOption);

    expect(defaultProps.onTypeChange).toHaveBeenCalledWith(EntryType.CHARACTER);
  });

  it('calls onCreateClick when Create Entry button is clicked', () => {
    render(<EntryFilters {...defaultProps} />);

    const createButton = screen.getByText('Create Entry');
    fireEvent.click(createButton);

    expect(defaultProps.onCreateClick).toHaveBeenCalledTimes(1);
  });

    });
