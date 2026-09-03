import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EntityFilters from './EntityFilters';
import { EntityType } from '@/app/types/entity';

describe('EntityFilters Component', () => {
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
    render(<EntityFilters {...defaultProps} />);

    expect(screen.getByPlaceholderText('Filter entities...')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByTitle('Filter by Type')).toBeInTheDocument();
    expect(screen.getByText('Create Entity')).toBeInTheDocument();
  });

  it('calls onSearchChange when user types in search field', () => {
    render(<EntityFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Filter entities...');
    fireEvent.change(searchInput, { target: { value: 'Shadow' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('Shadow');
  });

  it('opens sort popover and calls onSortChange when selecting a sort option', () => {
    render(<EntityFilters {...defaultProps} />);

    const sortButton = screen.getByTitle('Sort order');
    fireEvent.click(sortButton);

    const nameOption = screen.getByRole('button', { name: /name/i });
    fireEvent.click(nameOption);

    expect(defaultProps.onSortChange).toHaveBeenCalledWith('name');
  });

  it('opens filter popover and calls onTypeChange when selecting a type', () => {
    render(<EntityFilters {...defaultProps} />);

    const filterButton = screen.getByTitle('Filter by Type');
    fireEvent.click(filterButton);

    const characterOption = screen.getByRole('button', { name: /character/i });
    fireEvent.click(characterOption);

    expect(defaultProps.onTypeChange).toHaveBeenCalledWith(EntityType.CHARACTER);
  });

  it('calls onCreateClick when Create Entity button is clicked', () => {
    render(<EntityFilters {...defaultProps} />);

    const createButton = screen.getByText('Create Entity');
    fireEvent.click(createButton);

    expect(defaultProps.onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('renders category filter and calls onCategoryChange when category selected', () => {
    const onCategoryChange = jest.fn();
    const categories = [
      { id: 'cat-1', name: 'Magic & Lore' },
      { id: 'cat-2', name: 'Factions' },
    ];

    render(
      <EntityFilters
        {...defaultProps}
        categories={categories}
        selectedCategoryId="cat-1"
        onCategoryChange={onCategoryChange}
      />
    );

    const categoryButton = screen.getByTitle('Filter by Category');
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton);

    expect(screen.getByText('Magic & Lore')).toBeInTheDocument();
    expect(screen.getByText('Factions')).toBeInTheDocument();

    const factionsOption = screen.getByText('Factions');
    fireEvent.click(factionsOption);

    expect(onCategoryChange).toHaveBeenCalledWith('cat-2');
  });

  it('calls onCategoryChange with undefined when "All Categories" is selected', () => {
    const onCategoryChange = jest.fn();
    const categories = [{ id: 'cat-1', name: 'Magic & Lore' }];

    render(
      <EntityFilters
        {...defaultProps}
        categories={categories}
        selectedCategoryId="cat-1"
        onCategoryChange={onCategoryChange}
      />
    );

    const categoryButton = screen.getByTitle('Filter by Category');
    fireEvent.click(categoryButton);

    const allCategoriesOption = screen.getByText('All Categories');
    fireEvent.click(allCategoriesOption);

    expect(onCategoryChange).toHaveBeenCalledWith(undefined);
  });
});
