"use client";

import { useAppSelector } from "../store/hooks";
import Link from "next/link";

export default function DashboardHeader() {
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/10 bg-white/5 backdrop-blur-md">
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
            <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {user.username || user.email}
                </p>
                <p className="text-[11px] text-primary font-bold uppercase tracking-wider">
                  {user.emailVerified ? "Verified User" : "Unverified"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full ring-2 ring-primary/30 p-0.5 overflow-hidden">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">person</span>
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

