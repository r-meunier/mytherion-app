"use client";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/authSlice";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-purple-500/10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6 text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mytherion
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Authenticated State */}
              <span className="text-sm text-purple-300/80">
                {user?.username}
              </span>
              <button className="px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors">
                Profile
              </button>
              <button className="px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors">
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Unauthenticated State */}
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
