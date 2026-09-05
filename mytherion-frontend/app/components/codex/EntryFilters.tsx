"use client";

import { EntryType } from "@/app/types/codex";
import CommandBar, { CommandBarOption } from "../ui/CommandBar";

export interface EntryFiltersProps {
  search: string;
  onSearchChange: (query: string) => void;
  sortBy: "date" | "name";
  onSortChange: (sort: "date" | "name") => void;
  selectedType?: EntryType;
  onTypeChange: (type?: EntryType) => void;
  onCreateClick?: () => void;
  placeholder?: string;
  onSubmit?: (query: string) => void;
}

const SORT_OPTIONS: CommandBarOption[] = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
];

const TYPE_OPTIONS: CommandBarOption[] = [
  { value: "all", label: "All Types" },
  ...Object.values(EntryType).map((t) => ({
    value: t,
    label: t.charAt(0) + t.slice(1).toLowerCase(),
  })),
];

export default function EntryFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedType,
  onTypeChange,
  onCreateClick,
  placeholder = "Filter entries...",
  onSubmit,
}: EntryFiltersProps) {
  return (
    <CommandBar
      search={search}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSubmit}
      searchPlaceholder={placeholder}
      sortBy={sortBy}
      sortOptions={SORT_OPTIONS}
      onSortChange={(s) => onSortChange(s as "date" | "name")}
      selectedFilter={selectedType || "all"}
      filterOptions={TYPE_OPTIONS}
      filterLabel="Type"
      onFilterChange={(val) => {
        onTypeChange(val === "all" ? undefined : (val as EntryType));
      }}
      primaryAction={
        onCreateClick
          ? {
              label: "Create Entry",
              icon: "add",
              onClick: onCreateClick,
            }
          : undefined
      }
    />
  );
}
