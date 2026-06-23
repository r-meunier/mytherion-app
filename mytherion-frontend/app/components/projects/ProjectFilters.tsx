"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface GlassSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  minWidth?: string;
}

function GlassSelect({ label, value, options, onChange, minWidth = "140px" }: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">
        {label}:
      </label>
      <div className="relative" style={{ minWidth }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white transition-all hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary/40 ${isOpen ? 'ring-1 ring-primary/40' : ''}`}
        >
          <span className="truncate">{selectedOption?.label}</span>
          <span className={`material-symbols-outlined text-[20px] text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50 bg-[#16111B]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                    option.value === value 
                      ? 'bg-primary/10 text-primary font-semibold' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {option.label}
                  {option.value === value && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProjectFiltersProps {
  onSearchChange?: (query: string) => void;
  onSortChange?: (sort: string) => void;
  onGenreChange?: (genre: string) => void;
  onViewChange?: (view: "grid" | "list") => void;
}

export default function ProjectFilters({
  onSearchChange,
  onSortChange,
  onGenreChange,
  onViewChange
}: ProjectFiltersProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("date");
  const [genre, setGenre] = useState("none");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewToggle = (newView: "grid" | "list") => {
    setView(newView);
    onViewChange?.(newView);
  };

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "series", label: "Series" },
    { value: "date", label: "Date" }
  ];

  const genreOptions = [
    { value: "none", label: "All Genres" },
    { value: "Fantasy", label: "Fantasy" },
    { value: "Sci-Fi", label: "Sci-Fi" },
    { value: "Cyberpunk", label: "Cyberpunk" },
    { value: "Steampunk", label: "Steampunk" },
    { value: "Historical", label: "Historical" },
    { value: "Horror", label: "Horror" },
    { value: "Mystery", label: "Mystery" },
    { value: "Romance", label: "Romance" },
    { value: "Other", label: "Other" }
  ];

  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* Search / Filter */}
      <div className="flex flex-col gap-1.5 min-w-[280px]">
        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">
          Search/Filter:
        </label>
        <div className="flex items-center gap-0 relative" ref={filterRef}>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search world/project..."
              className="w-full bg-white/5 border border-white/10 border-r-0 rounded-l-lg px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-[38px] px-3 border border-white/10 rounded-r-lg transition-all flex items-center justify-center ${
              isFilterOpen || showArchived 
                ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                : "bg-white/5 text-white/30 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">filter_alt</span>
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[180px] z-50 bg-[#16111B]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="py-1">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <span>Archived</span>
                  {showArchived && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                  )}
                </button>
                
                <div className="h-px bg-white/5 my-1"></div>
                
                <button
                  onClick={() => {
                    setShowArchived(false);
                    setIsFilterOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-colors uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sort By */}
      <GlassSelect
        label="Sort By"
        value={sortBy}
        options={sortOptions}
        onChange={(val) => {
          setSortBy(val);
          onSortChange?.(val);
        }}
      />

      {/* Genre */}
      <GlassSelect
        label="Genre"
        value={genre}
        options={genreOptions}
        onChange={(val) => {
          setGenre(val);
          onGenreChange?.(val);
        }}
      />

      {/* View As */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">
          View As:
        </label>
        <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-lg h-[38px]">
          <button 
            onClick={() => handleViewToggle("grid")}
            className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${
              view === "grid" 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-white/30 hover:text-white/60"
            }`}
          >
            Grid
          </button>
          <button 
            onClick={() => handleViewToggle("list")}
            className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${
              view === "list" 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-white/30 hover:text-white/60"
            }`}
          >
            List
          </button>
        </div>
      </div>
    </div>
  );
}
