import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectFilters from './ProjectFilters';

describe('ProjectFilters', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnSortChange = jest.fn();
  const mockOnGenreChange = jest.fn();
  const mockOnViewChange = jest.fn();
  const mockOnCreateClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with placeholder and create project button', () => {
    render(
      <ProjectFilters
        onSearchChange={mockOnSearchChange}
        onSortChange={mockOnSortChange}
        onGenreChange={mockOnGenreChange}
        viewMode="grid"
        onViewChange={mockOnViewChange}
        onCreateClick={mockOnCreateClick}
      />
    );

    expect(screen.getByPlaceholderText('Filter projects...')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in the search input', () => {
    render(
      <ProjectFilters
        onSearchChange={mockOnSearchChange}
        onSortChange={mockOnSortChange}
        onGenreChange={mockOnGenreChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Filter projects...');
    fireEvent.change(searchInput, { target: { value: 'Aetheria' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('Aetheria');
  });

  it('calls onSortChange when choosing a sort option', () => {
    render(
      <ProjectFilters
        onSortChange={mockOnSortChange}
      />
    );

    const sortButton = screen.getByTitle('Sort order');
    fireEvent.click(sortButton);

    const nameOption = screen.getByRole('button', { name: /name/i });
    fireEvent.click(nameOption);

    expect(mockOnSortChange).toHaveBeenCalledWith('name');
  });

  it('calls onGenreChange when choosing a genre filter option', () => {
    render(
      <ProjectFilters
        onGenreChange={mockOnGenreChange}
      />
    );

    const filterButton = screen.getByTitle('Filter by Genre');
    fireEvent.click(filterButton);

    const steampunkOption = screen.getByRole('button', { name: /steampunk/i });
    fireEvent.click(steampunkOption);

    expect(mockOnGenreChange).toHaveBeenCalledWith('Steampunk');
  });

  it('calls onViewChange when clicking grid and list view buttons', () => {
    render(
      <ProjectFilters
        viewMode="grid"
        onViewChange={mockOnViewChange}
      />
    );

    const listBtn = screen.getByLabelText('List view');
    fireEvent.click(listBtn);
    expect(mockOnViewChange).toHaveBeenCalledWith('list');

    const gridBtn = screen.getByLabelText('Grid view');
    fireEvent.click(gridBtn);
    expect(mockOnViewChange).toHaveBeenCalledWith('grid');
  });

  it('calls onCreateClick when clicking Create Project button', () => {
    render(
      <ProjectFilters
        onCreateClick={mockOnCreateClick}
      />
    );

    const createBtn = screen.getByRole('button', { name: /create project/i });
    fireEvent.click(createBtn);

    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });
});
