"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logoutUser } from "../store/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardHeader() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/10 bg-white/5 backdrop-blur-md relative z-50">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '20px' }}>
            search
          </span>
          <input
            className="pl-10 pr-4 py-2 bg-white/5 border-none focus:ring-1 focus:ring-primary rounded-full text-sm w-80 text-slate-200 placeholder:text-slate-500"
            placeholder="Search the multiverse..."
            type="text"
          />
        </div>
      </div>

      {/* Right Side - Conditional based on auth state */}
      <div className="flex items-center space-x-6">
        {!isInitialized ? (
          /* Loading Skeleton - Matches dimensions of content to prevent shift */
          <div className="h-11 w-24 bg-white/5 rounded-lg animate-pulse"></div>
        ) : isAuthenticated && user ? (
          <>
            {/* Notification Button */}
            <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-background-dark"></span>
            </button>

            {/* User Profile */}
            <div 
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="flex items-center space-x-3 pl-6 border-l border-white/10 cursor-pointer py-2">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {user.username || user.email}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-0.5">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                      {user.emailVerified ? "Verified User" : "Unverified"}
                    </p>
                    {user.role === 'ADMIN' && (
                      <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-tighter border border-amber-500/30">
                        Arbiter
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full ring-2 ring-primary/30 p-0.5 overflow-hidden transition-transform group-hover:scale-105">
                  <div className="w-full h-full rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px]">person</span>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-slate-500 text-[18px] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </div>

              {/* Dropdown Menu */}
              <div className={`absolute right-0 top-full mt-1 w-48 bg-[#0f0f23] backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 origin-top-right z-50 ${
                isDropdownOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'
              }`}>
                <div className="p-2 space-y-1">
                  <Link 
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-primary transition-colors">
                      settings
                    </span>
                    Settings
                  </Link>
                  
                  {user.role === 'ADMIN' && (
                    <Link 
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-amber-500 transition-colors">
                        shield_person
                      </span>
                      Admin Portal
                    </Link>
                  )}

                  <div className="h-px bg-white/5 my-1 mx-2" />

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all group"
                  >
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                      logout
                    </span>
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Login Button for unauthenticated users */
          <Link href="/login">
            <button className="bg-primary hover:bg-primary/80 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span className="font-semibold">Login</span>
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}

