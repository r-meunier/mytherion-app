"use client";

import { useState } from "react";

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#190525] to-slate-900">
      {/* Animated background overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#190525]/20 via-transparent to-blue-900/20 pointer-events-none"></div>
      
      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-purple-500/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Mytherion
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors">
              Profile
            </button>
            <button className="px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-100 transition-colors">
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="flex relative">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarCollapsed ? "w-0" : "w-64"
          } min-h-[calc(100vh-73px)] bg-slate-900/60 backdrop-blur-md border-r border-purple-500/20 transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <div className="p-4 w-64">
            <h2 className="text-lg font-semibold text-purple-200 mb-4">
              Navigation
            </h2>
            
            <nav className="space-y-2">
              <a
                href="#"
                className="block px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-purple-100 font-medium shadow-lg shadow-purple-500/20 border border-purple-400/30"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="block px-4 py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 hover:text-purple-100 transition-all"
              >
                Characters
              </a>
              <a
                href="#"
                className="block px-4 py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 hover:text-purple-100 transition-all"
              >
                Locations
              </a>
              <a
                href="#"
                className="block px-4 py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 hover:text-purple-100 transition-all"
              >
                Timeline
              </a>
              <a
                href="#"
                className="block px-4 py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 hover:text-purple-100 transition-all"
              >
                Notes
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 transition-all duration-300 ease-in-out relative">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-6">
              Welcome to Mytherion
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Placeholder Card 1 */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg shadow-xl shadow-[#190525]/30 p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all hover:shadow-purple-500/40">
                <h3 className="text-xl font-semibold text-purple-200 mb-2">
                  Card Title 1
                </h3>
                <p className="text-purple-300/80">
                  This is a placeholder card. Replace with your actual content.
                </p>
              </div>

              {/* Placeholder Card 2 */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg shadow-xl shadow-[#190525]/30 p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all hover:shadow-purple-500/40">
                <h3 className="text-xl font-semibold text-purple-200 mb-2">
                  Card Title 2
                </h3>
                <p className="text-purple-300/80">
                  This is a placeholder card. Replace with your actual content.
                </p>
              </div>

              {/* Placeholder Card 3 */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg shadow-xl shadow-[#190525]/30 p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all hover:shadow-purple-500/40">
                <h3 className="text-xl font-semibold text-purple-200 mb-2">
                  Card Title 3
                </h3>
                <p className="text-purple-300/80">
                  This is a placeholder card. Replace with your actual content.
                </p>
              </div>
            </div>

            {/* Placeholder Content Section */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg shadow-xl shadow-[#190525]/30 p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-purple-200 mb-4">
                Main Content Section
              </h2>
              <p className="text-purple-300/80 mb-4">
                This is the main content area where you can add your lore tracking and management features.
              </p>
              <p className="text-purple-300/80">
                The layout includes:
              </p>
              <ul className="list-disc list-inside text-purple-300/80 mt-2 space-y-1">
                <li>A sticky navbar at the top</li>
                <li>A collapsible sidebar for navigation</li>
                <li>A flexible main content area</li>
                <li>Mysterious space-themed design</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

