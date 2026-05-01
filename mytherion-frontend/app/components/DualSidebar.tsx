"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "../store/hooks";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string; // Optional icon override if needed
}

interface DualSidebarProps {
  activeSection?: string;
  activeIcon?: string;
  navItems?: NavItem[];
  libraryItems?: NavItem[];
  managementItems?: NavItem[];
  title?: string;
  subTitle?: string;
}

export default function DualSidebar({
  activeSection = "dashboard",
  activeIcon,
  navItems,
  libraryItems: customLibraryItems,
  managementItems,
  title = "Mytherion",
  subTitle,
}: DualSidebarProps) {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  const iconNavItems = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard", href: "/" },
    { id: "projects", icon: "folder_special", label: "Projects", href: "/projects" },
    {
      id: "characters",
      icon: "group",
      label: "Characters",
      href: "#characters",
    },
    {
      id: "locations",
      icon: "explore",
      label: "Locations",
      href: "#locations",
    },
    {
      id: "timeline",
      icon: "history_edu",
      label: "Timeline",
      href: "#timeline",
    },
    {
      id: "artifacts",
      icon: "deployed_code",
      label: "Artifacts",
      href: "#artifacts",
    },
    { id: "notes", icon: "description", label: "Notes", href: "#notes" },
  ];

  const defaultLibraryItems = [
    { id: "bestiary", icon: "menu_book", label: "Bestiary", href: "#bestiary" },
  ];

  const defaultNavItems = [
    { id: "dashboard", label: "Dashboard", href: "/" },
    { id: "projects", label: "Projects", href: "/projects" },
    { id: "characters", label: "Characters", href: "#characters" },
    { id: "locations", label: "Locations", href: "#locations" },
    { id: "timeline", label: "Timeline", href: "#timeline" },
    { id: "artifacts", label: "Artifacts", href: "#artifacts" },
    { id: "notes", label: "Notes", href: "#notes" },
  ];

  const currentNavItems = navItems || defaultNavItems;
  const currentLibraryItems = customLibraryItems || defaultLibraryItems;

  // Automatically add Admin Portal to management items if user is admin
  const baseManagementItems = managementItems || [];
  const finalManagementItems = [...baseManagementItems];
  
  if (isAdmin && !finalManagementItems.some(item => item.id === 'admin')) {
    finalManagementItems.push({ 
      id: 'admin', 
      label: 'Admin Portal', 
      href: '/admin',
      icon: 'shield_person'
    });
  }

  return (
    <div className="flex h-full shrink-0">
      {/* Icon Sidebar - Left */}
      <aside className="w-20 bg-black/40 border-r border-white/5 flex flex-col items-center py-6 space-y-8 backdrop-blur-xl">
        {/* Logo */}
        {/* Logo */}
        <Link href="/" className="group">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-white">
              auto_awesome
            </span>
          </div>
        </Link>

        {/* Icon Navigation */}
        <div className="flex flex-col space-y-6">
          {iconNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`${
                (activeIcon || activeSection) === item.id
                  ? "text-primary"
                  : "text-slate-500 hover:text-white"
              } transition-colors`}
              onMouseEnter={() => setHoveredIcon(item.id)}
              onMouseLeave={() => setHoveredIcon(null)}
              title={item.label}
            >
              <span 
                className="material-symbols-outlined text-[24px]"
                style={{fontVariationSettings: (activeIcon || activeSection) === item.id ? "'FILL' 1, 'wght' 700" : "'FILL' 0, 'wght' 400"}}
              >
                {item.icon}
              </span>
            </Link>
          ))}

          {/* Divider */}
          <div className="pt-6 border-t border-white/10">
            {currentLibraryItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-slate-500 hover:text-white transition-colors block mb-4 last:mb-0"
                title={item.label}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {item.icon || "menu_book"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Navigation Sidebar - Middle */}
      <aside className="w-56 bg-black/20 border-r border-white/10 flex flex-col backdrop-blur-md">
        {/* Header */}
        <div className="p-6">
          <Link href="/">
            <h1 className="text-logo text-xl !text-white hover:!text-primary transition-colors cursor-pointer">
              {title}
            </h1>
          </Link>
          {subTitle && (
            <p className="text-subtitle-label mt-1.5">
              {subTitle}
            </p>
          )}
        </div>

        {/* Navigation */}
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
          <p className="px-4 text-sidebar-nav-header mb-4">
            Navigation
          </p>

          {currentNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
                activeSection === item.id
                  ? "sidebar-item-active"
                  : "text-slate-400 hover:bg-white/10"
              }`}
            >
              <span
                className={`font-medium ${
                  activeSection === item.id ? "" : "group-hover:text-white"
                } transition-colors`}
              >
                {item.label}
              </span>
            </Link>
          ))}

          {/* Library Section */}
          <div className="pt-10">
            <p className="px-4 text-sidebar-nav-header mb-4">
              Library
            </p>
            {currentLibraryItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-white/10 rounded-lg transition-all group"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon || "menu_book"}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Management Section */}
          {finalManagementItems && finalManagementItems.length > 0 && (
            <div className="pt-10">
              <p className="px-4 text-sidebar-nav-header mb-4">
                Management
              </p>
              {finalManagementItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
                    activeSection === item.id
                      ? "sidebar-item-active"
                      : "text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {item.icon && (
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                  )}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Storage Indicator */}
        <div className="p-4 border-t border-white/10">
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-micro-badge text-primary">
                Storage
              </span>
              <span className="text-micro-badge text-slate-500">82%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[82%] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
