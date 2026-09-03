"use client";

import { EntityType } from "@/app/types/entity";
import CommandBar, { CommandBarOption } from "../ui/CommandBar";

export interface EntityFiltersProps {
  search: string;
  onSearchChange: (query: string) => void;
  sortBy: "date" | "name";
  onSortChange: (sort: "date" | "name") => void;
  selectedType?: EntityType;
  onTypeChange: (type?: EntityType) => void;
  categories?: { id: string; name: string }[];
  selectedCategoryId?: string;
  onCategoryChange?: (categoryId?: string) => void;
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
  ...Object.values(EntityType).map((t) => ({
    value: t,
    label: t.charAt(0) + t.slice(1).toLowerCase(),
  })),
];

export default function EntityFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedType,
  onTypeChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onCreateClick,
  placeholder = "Filter entities...",
  onSubmit,
}: EntityFiltersProps) {
  const categoryOptions: CommandBarOption[] = [
    { value: "all", label: "All Categories" },
    ...(categories || []).map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

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
        onTypeChange(val === "all" ? undefined : (val as EntityType));
      }}
      secondarySelectedFilter={selectedCategoryId || "all"}
      secondaryFilterOptions={categories && categories.length > 0 ? categoryOptions : undefined}
      secondaryFilterLabel="Category"
      onSecondaryFilterChange={(val) => {
        onCategoryChange?.(val === "all" ? undefined : val);
      }}
      primaryAction={
        onCreateClick
          ? {
              label: "Create Entity",
              icon: "add",
              onClick: onCreateClick,
            }
          : undefined
      }
    />
  );
}
