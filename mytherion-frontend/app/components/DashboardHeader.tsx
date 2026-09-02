"use client";

import { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logoutUser } from "../store/authSlice";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface DashboardHeaderProps {
  onCreateProject?: () => void;
}

export default function DashboardHeader({ onCreateProject }: DashboardHeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  const isProjectMode = pathname.startsWith("/projects/");
  const navItems = [
    { label: isProjectMode ? "Back to Worlds" : "Library", href: "/", active: pathname === "/" },
    { label: "Grimoire", href: "#", active: false },
    { label: "Chronicles", href: "#", active: false },
    { label: "Atlas", href: "#", active: false },
  ];

  // Helper to reset idle collapse timer when input is empty
  const resetSearchTimer = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchValue((current) => {
        if (!current || current.trim() === "") {
          setIsSearchOpen(false);
        }
        return current;
      });
    }, 3500);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!val.trim()) {
      resetSearchTimer();
    }
  };

  // Close when clicking outside if search is empty
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        if (!searchValue || searchValue.trim() === "") {
          setIsSearchOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchValue]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#231e27]/20 backdrop-blur-2xl shadow-2xl relative z-50">
      {/* Left Side: Branding & Navigation Tabs */}
      <div className="flex items-center gap-8 h-full">
        {/* Branding */}
        <Link href="/" className="group flex items-center gap-3 mr-2">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 transition-all duration-500 group-hover:scale-105 shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-display font-extrabold tracking-tight text-white text-glow leading-none">
              Mytherion
            </h2>
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.25em] mt-1">
              Archivist Level 4
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 h-full ml-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-link group/nav text-sm font-semibold h-full px-2 flex items-center transition-colors ${
                item.active 
                  ? "text-[#ddb7ff] active" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              {isProjectMode && item.href === "/" && (
                <span className="material-symbols-outlined text-[18px] mr-2 transition-transform group-hover/nav:-translate-x-1">
                  arrow_back
                </span>
              )}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {!isInitialized ? (
          <div className="h-10 w-24 bg-white/5 rounded-lg animate-pulse"></div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="glass-command flex items-center px-2 py-1 gap-1">
              {/* Leftmost Expanding Search Icon / Bar */}
              <div 
                ref={searchContainerRef}
                className={`flex items-center rounded-full transition-all duration-300 ${
                  isSearchOpen ? "bg-white/10 px-2 py-0.5" : "bg-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isSearchOpen) {
                      setIsSearchOpen(true);
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                      resetSearchTimer();
                    } else if (!searchValue.trim()) {
                      setIsSearchOpen(false);
                    }
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-[#ddb7ff] hover:bg-white/5 transition-colors shrink-0"
                  title="Search archives"
                  aria-label="Search archives"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </button>

                <div 
                  className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
                    isSearchOpen ? "w-44 sm:w-56 opacity-100 ml-1" : "w-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (!searchValue.trim()) resetSearchTimer();
                    }}
                    placeholder="Search archives..."
                    className="w-full bg-transparent border-none text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-0 py-1"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue("");
                        searchInputRef.current?.focus();
                        resetSearchTimer();
                      }}
                      className="text-white/40 hover:text-white p-1 text-[16px] material-symbols-outlined shrink-0"
                      title="Clear search"
                    >
                      close
                    </button>
                  )}
                </div>
              </div>

              {isAuthenticated && user && (
                <>
                  {/* Notifications */}
                  <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-[#ddb7ff] hover:bg-white/5 transition-colors shrink-0"
                    title="Notifications"
                  >
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                  </button>

                  <div className="w-[1px] h-5 bg-white/10 mx-1 shrink-0" />

                  {/* Profile Dropdown */}
                  <div 
                    className="relative shrink-0"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <button 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors p-0.5 border border-transparent hover:border-primary/50"
                      title="User Profile"
                    >
                      <span className="material-symbols-outlined text-[22px]">account_circle</span>
                    </button>

                    <div className={`absolute right-0 top-full mt-2 w-56 bg-[#1f1a23] backdrop-blur-3xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 origin-top-right z-50 ${
                      isDropdownOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'
                    }`}>
                      <div className="p-3 space-y-1">
                        <div className="px-3 py-2 border-b border-white/5 mb-1">
                          <p className="text-xs font-bold text-white truncate">{user.username || user.email}</p>
                          <p className="text-[10px] text-primary uppercase tracking-[0.2em] mt-0.5">
                            {user.role === 'ADMIN' ? 'Arbiter' : 'Verified User'} Level 4
                          </p>
                        </div>
                        <Link 
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">settings</span>
                          Settings
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400/80 hover:text-white hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          Log out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* New Project Action (Optional Header trigger) */}
            {onCreateProject && isAuthenticated && user && (
              <button 
                onClick={onCreateProject}
                className="bg-primary/20 text-primary border border-primary/30 px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-primary/30 transition-all active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center gap-1.5 whitespace-nowrap group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
                <span className="hidden xl:inline">New Project</span>
              </button>
            )}

            {!isAuthenticated && (
              <Link href="/login">
                <button className="bg-primary hover:bg-primary/80 text-[#2c0051] px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20">
                  Login
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
