"use client";

import { useState } from "react";
import CommandBar, { CommandBarOption } from "../ui/CommandBar";

interface ProjectFiltersProps {
  onSearchChange?: (query: string) => void;
  onSortChange?: (sort: string) => void;
  onGenreChange?: (genre: string) => void;
  viewMode?: "grid" | "list";
  onViewChange?: (view: "grid" | "list") => void;
  onCreateClick?: () => void;
}

const GENRE_OPTIONS: CommandBarOption[] = [
  { value: "none", label: "All Genres" },
  { value: "High Fantasy", label: "High Fantasy" },
  { value: "Sci-Fi", label: "Sci-Fi" },
  { value: "Grimdark", label: "Grimdark" },
  { value: "Steampunk", label: "Steampunk" },
  { value: "Cyberpunk", label: "Cyberpunk" },
  { value: "Other", label: "Other" },
];

const SORT_OPTIONS: CommandBarOption[] = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
];

export default function ProjectFilters({
  onSearchChange,
  onSortChange,
  onGenreChange,
  viewMode = "grid",
  onViewChange,
  onCreateClick,
}: ProjectFiltersProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [genre, setGenre] = useState("none");

  return (
    <CommandBar
      search={search}
      onSearchChange={(q) => {
        setSearch(q);
        onSearchChange?.(q);
      }}
      searchPlaceholder="Filter projects..."
      sortBy={sortBy}
      sortOptions={SORT_OPTIONS}
      onSortChange={(s) => {
        setSortBy(s);
        onSortChange?.(s);
      }}
      selectedFilter={genre}
      filterOptions={GENRE_OPTIONS}
      filterLabel="Genre"
      onFilterChange={(g) => {
        setGenre(g);
        onGenreChange?.(g);
      }}
      viewMode={viewMode}
      onViewChange={onViewChange}
      primaryAction={
        onCreateClick
          ? {
              label: "Create Project",
              icon: "add",
              onClick: onCreateClick,
            }
          : undefined
      }
    />
  );
}
