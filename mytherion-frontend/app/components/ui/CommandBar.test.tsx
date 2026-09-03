import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CommandBar from "./CommandBar";

describe("CommandBar Component", () => {
  const defaultProps = {
    search: "",
    onSearchChange: jest.fn(),
    onSearchSubmit: jest.fn(),
    searchPlaceholder: "Search items...",
    sortBy: "date",
    sortOptions: [
      { value: "date", label: "Date" },
      { value: "name", label: "Name" },
    ],
    onSortChange: jest.fn(),
    selectedFilter: "all",
    filterOptions: [
      { value: "all", label: "All Items" },
      { value: "special", label: "Special" },
    ],
    filterLabel: "Filter Type",
    onFilterChange: jest.fn(),
    primaryAction: {
      label: "Add Item",
      onClick: jest.fn(),
      icon: "add",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input, sort, filter, and primary action button", () => {
    render(<CommandBar {...defaultProps} />);

    expect(screen.getByPlaceholderText("Search items...")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByTitle("Filter by Filter Type")).toBeInTheDocument();
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in search input", () => {
    render(<CommandBar {...defaultProps} />);

    const input = screen.getByPlaceholderText("Search items...");
    fireEvent.change(input, { target: { value: "Dragon" } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("Dragon");
  });

  it("calls onSearchSubmit when pressing Enter in search input", () => {
    render(<CommandBar {...defaultProps} />);

    const input = screen.getByPlaceholderText("Search items...");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(defaultProps.onSearchSubmit).toHaveBeenCalled();
  });

  it("opens sort popover and calls onSortChange on option click", () => {
    render(<CommandBar {...defaultProps} />);

    const sortButton = screen.getByTitle("Sort order");
    fireEvent.click(sortButton);

    const nameOption = screen.getByRole("button", { name: /name/i });
    fireEvent.click(nameOption);

    expect(defaultProps.onSortChange).toHaveBeenCalledWith("name");
  });

  it("opens filter popover and calls onFilterChange on option click", () => {
    render(<CommandBar {...defaultProps} />);

    const filterButton = screen.getByTitle("Filter by Filter Type");
    fireEvent.click(filterButton);

    const specialOption = screen.getByRole("button", { name: /special/i });
    fireEvent.click(specialOption);

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith("special");
  });

  it("calls primaryAction.onClick when primary button is clicked", () => {
    render(<CommandBar {...defaultProps} />);

    const button = screen.getByText("Add Item");
    fireEvent.click(button);

    expect(defaultProps.primaryAction.onClick).toHaveBeenCalledTimes(1);
  });

  it("renders view mode toggles and calls onViewChange when clicked", () => {
    const onViewChange = jest.fn();
    render(<CommandBar {...defaultProps} viewMode="grid" onViewChange={onViewChange} />);

    const gridBtn = screen.getByLabelText("Grid view");
    const listBtn = screen.getByLabelText("List view");

    expect(gridBtn).toBeInTheDocument();
    expect(listBtn).toBeInTheDocument();

    fireEvent.click(listBtn);
    expect(onViewChange).toHaveBeenCalledWith("list");

    fireEvent.click(gridBtn);
    expect(onViewChange).toHaveBeenCalledWith("grid");
  });

  it("applies active styles based on current viewMode", () => {
    const { rerender } = render(<CommandBar {...defaultProps} viewMode="grid" onViewChange={jest.fn()} />);

    const gridBtn = screen.getByLabelText("Grid view");
    expect(gridBtn.className).toContain("bg-primary");

    rerender(<CommandBar {...defaultProps} viewMode="list" onViewChange={jest.fn()} />);
    const listBtn = screen.getByLabelText("List view");
    expect(listBtn.className).toContain("bg-primary");
  });
});
