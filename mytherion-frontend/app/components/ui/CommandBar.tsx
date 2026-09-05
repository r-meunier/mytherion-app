"use client";

import { useState, useRef, useEffect } from "react";

export interface CommandBarOption {
  value: string;
  label: string;
}

export interface CommandBarPrimaryAction {
  label: string;
  onClick: () => void;
  icon?: string;
}

export interface CommandBarProps {
  search?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  searchPlaceholder?: string;

  sortBy?: string;
  sortOptions?: CommandBarOption[];
  onSortChange?: (sort: string) => void;

  selectedFilter?: string;
  filterOptions?: CommandBarOption[];
  filterLabel?: string;
  onFilterChange?: (filter: string) => void;

  secondarySelectedFilter?: string;
  secondaryFilterOptions?: CommandBarOption[];
  secondaryFilterLabel?: string;
  onSecondaryFilterChange?: (filter: string) => void;

  viewMode?: "grid" | "list";
  onViewChange?: (view: "grid" | "list") => void;

  primaryAction?: CommandBarPrimaryAction;
  className?: string;
}

export default function CommandBar({
  search = "",
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Filter...",
  sortBy,
  sortOptions,
  onSortChange,
  selectedFilter,
  filterOptions,
  filterLabel = "Filter",
  onFilterChange,
  secondarySelectedFilter,
  secondaryFilterOptions,
  secondaryFilterLabel = "Filter",
  onSecondaryFilterChange,
  viewMode = "grid",
  onViewChange,
  primaryAction,
  className = "",
}: CommandBarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSecondaryFilterOpen, setIsSecondaryFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const secondaryFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (secondaryFilterRef.current && !secondaryFilterRef.current.contains(event.target as Node)) {
        setIsSecondaryFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortSelect = (value: string) => {
    onSortChange?.(value);
    setIsSortOpen(false);
  };

  const handleFilterSelect = (value: string) => {
    onFilterChange?.(value);
    setIsFilterOpen(false);
  };

  const handleSecondaryFilterSelect = (value: string) => {
    onSecondaryFilterChange?.(value);
    setIsSecondaryFilterOpen(false);
  };

  const isFilterActive =
    selectedFilter &&
    selectedFilter !== "all" &&
    selectedFilter !== "none";

  const isSecondaryFilterActive =
    secondarySelectedFilter &&
    secondarySelectedFilter !== "all" &&
    secondarySelectedFilter !== "none";

  const currentSortLabel =
    sortOptions?.find((o) => o.value === sortBy)?.label || sortBy || "Sort";

  return (
    <div className={`flex items-center gap-3 w-full max-w-xl lg:ml-auto ${className}`}>
      {/* 2026 Floating Glass Command Bar */}
      <div className="glass-command flex items-center p-1.5 gap-2 w-full">
        {/* Search Field */}
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearchSubmit?.(search);
              }
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent border-none pl-12 pr-4 py-2.5 text-sm font-medium text-white placeholder:text-white/40 focus:ring-0 focus:outline-none transition-all"
          />
        </div>

        {/* Divider for Controls */}
        {(sortOptions || filterOptions) && (
          <div className="w-[1px] h-8 bg-white/10" />
        )}

        {/* Sort Menu */}
        {sortOptions && sortOptions.length > 0 && (
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5 whitespace-nowrap cursor-pointer"
              title="Sort order"
            >
              <span className="material-symbols-outlined text-[20px]">sort</span>
              <span>{currentSortLabel}</span>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-36 bg-[#1f1a23] backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150">
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSortSelect(opt.value)}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-primary/20 text-primary font-bold"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Filter Popover */}
        {filterOptions && filterOptions.length > 0 && (
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                isFilterActive || isFilterOpen
                  ? "text-primary bg-primary/10"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
              title={`Filter by ${filterLabel}`}
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 bg-[#1f1a23] backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <p className="px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {filterLabel}
                </p>
                {filterOptions.map((opt) => {
                  const isSelected = selectedFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterSelect(opt.value)}
                      className={`w-full text-left px-3 py-1.5 text-sm font-medium rounded-lg flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-primary/20 text-primary font-bold"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="capitalize">{opt.label}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Secondary Filter Popover — generic; currently no caller supplies it */}
        {secondaryFilterOptions && secondaryFilterOptions.length > 0 && (
          <div className="relative" ref={secondaryFilterRef}>
            <button
              type="button"
              onClick={() => setIsSecondaryFilterOpen(!isSecondaryFilterOpen)}
              className={`p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                isSecondaryFilterActive || isSecondaryFilterOpen
                  ? "text-primary bg-primary/10"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
              title={`Filter by ${secondaryFilterLabel}`}
              aria-label={`Filter by ${secondaryFilterLabel}`}
            >
              <span className="material-symbols-outlined text-[20px]">category</span>
            </button>

            {isSecondaryFilterOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 bg-[#1f1a23] backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                <p className="px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {secondaryFilterLabel}
                </p>
                {secondaryFilterOptions.map((opt) => {
                  const isSelected = secondarySelectedFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSecondaryFilterSelect(opt.value)}
                      className={`w-full text-left px-3 py-1.5 text-sm font-medium rounded-lg flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-primary/20 text-primary font-bold"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="capitalize truncate">{opt.label}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-sm shrink-0 ml-2">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* View Mode Toggle */}
        {onViewChange && (
          <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-[#2c0051] shadow-sm font-bold"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                viewMode === "list"
                  ? "bg-primary text-[#2c0051] shadow-sm font-bold"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
              title="List view"
              aria-label="List view"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        )}

        {/* Primary Action Button (Luminous Pill) */}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="bg-[#ddb7ff] text-[#2c0051] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#f0dbff] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(221,183,255,0.4)] active:scale-95 whitespace-nowrap ml-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {primaryAction.icon || "add"}
            </span>
            <span>{primaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
