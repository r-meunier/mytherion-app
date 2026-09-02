"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface ProjectFiltersProps {
  onSearchChange?: (query: string) => void;
  onSortChange?: (sort: string) => void;
  onGenreChange?: (genre: string) => void;
  onViewChange?: (view: "grid" | "list") => void;
  onCreateClick?: () => void;
}

export default function ProjectFilters({
  onSearchChange,
  onSortChange,
  onGenreChange,
  onViewChange,
  onCreateClick
}: ProjectFiltersProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [genre, setGenre] = useState("none");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortSelect = (type: "date" | "name") => {
    setSortBy(type);
    setIsSortOpen(false);
    onSortChange?.(type);
  };

  const handleGenreSelect = (g: string) => {
    setGenre(g);
    setIsFilterOpen(false);
    onGenreChange?.(g);
  };

  const genreOptions = [
    { value: "none", label: "All Genres" },
    { value: "High Fantasy", label: "High Fantasy" },
    { value: "Sci-Fi", label: "Sci-Fi" },
    { value: "Grimdark", label: "Grimdark" },
    { value: "Steampunk", label: "Steampunk" },
    { value: "Cyberpunk", label: "Cyberpunk" },
    { value: "Other", label: "Other" }
  ];

  return (
    <div className="flex items-center gap-3 w-full max-w-xl">
      {/* Modern Glass Command Bar */}
      <div className="glass-command flex items-center p-1.5 gap-2 w-full">
        {/* Search Field */}
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            placeholder="Filter worlds..."
            className="w-full bg-transparent border-none pl-12 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:ring-0 focus:outline-none transition-all"
          />
        </div>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-white/10" />

        {/* Sort Menu */}
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
            title="Sort order"
          >
            <span className="material-symbols-outlined text-[18px]">sort</span>
            <span>{sortBy.toUpperCase()}</span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-36 bg-[#1f1a23] backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => handleSortSelect("date")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between ${
                  sortBy === "date" ? "bg-primary/20 text-primary" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>Date</span>
                {sortBy === "date" && <span className="material-symbols-outlined text-sm">check</span>}
              </button>
              <button
                onClick={() => handleSortSelect("name")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between ${
                  sortBy === "name" ? "bg-primary/20 text-primary" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>Name</span>
                {sortBy === "name" && <span className="material-symbols-outlined text-sm">check</span>}
              </button>
            </div>
          )}
        </div>

        {/* Genre Filter Popover Button */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-full transition-all flex items-center justify-center ${
              genre !== "none" || isFilterOpen
                ? "text-primary bg-primary/10"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
            title="Filter by Genre"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 bg-[#1f1a23] backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <p className="px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Filter Genre</p>
              {genreOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleGenreSelect(opt.value)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between ${
                    genre === opt.value ? "bg-primary/20 text-primary font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {genre === opt.value && <span className="material-symbols-outlined text-sm">check</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* + NEW Button */}
        {onCreateClick && (
          <button
            type="button"
            onClick={onCreateClick}
            className="bg-[#ddb7ff] text-[#2c0051] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#f0dbff] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(221,183,255,0.4)] active:scale-95 whitespace-nowrap ml-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>NEW</span>
          </button>
        )}
      </div>
    </div>
  );
}
