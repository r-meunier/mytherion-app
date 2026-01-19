"use client";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserCircle, faGear, faRightFromBracket, faRightToBracket } from '@fortawesome/free-solid-svg-icons';

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

          {/* Logo and Title - Clickable Home Link */}
          <Link 
            href="/" 
            className="flex items-center gap-3 select-none cursor-pointer group"
          >
            <Image
              src="/mytherion_logo_transparent_128x128.png"
              alt="Mytherion Logo"
              width={40}
              height={40}
              className="w-10 h-10 transition-transform group-hover:scale-110"
              draggable={false}
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-[family-name:var(--font-montserrat)] transition-all group-hover:from-purple-300 group-hover:to-blue-300">
              Mytherion
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <Link
              href="/projects"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Projects</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Authenticated State */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <FontAwesomeIcon icon={faUser} className="text-purple-400" size="sm" />
                <span className="text-sm text-purple-300/80">
                  {user?.username}
                </span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors">
                <FontAwesomeIcon icon={faUserCircle} size="sm" />
                <span>Profile</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors">
                <FontAwesomeIcon icon={faGear} size="sm" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors"
              >
                <FontAwesomeIcon icon={faRightFromBracket} size="sm" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Unauthenticated State */}
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors"
              >
                <FontAwesomeIcon icon={faRightToBracket} size="sm" />
                <span>Login</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
