"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAppSelector } from "../store/hooks";
import { 
  getGlobalIconItems, 
  getProjectIconItems, 
  getGlobalNavItems, 
  getGlobalLibraryItems,
  getGlobalManagementItems,
  getProjectNavItems, 
  getManagementItems,
  NavItem 
} from "../config/projectNavigation";

interface DualSidebarProps {
  activeSection?: string;
  activeIcon?: string;
  projectId?: string;
  navItems?: NavItem[];
  libraryItems?: NavItem[];
  managementItems?: NavItem[];
  title?: string;
  subTitle?: string;
  onCreateProject?: () => void;
  onCreateEntity?: () => void;
}

export default function DualSidebar({
  activeSection = "projects",
  activeIcon,
  projectId,
  navItems: customNavItems,
  libraryItems: customLibraryItems,
  managementItems: customManagementItems,
  title: customTitle,
  subTitle: customSubTitle,
  onCreateProject,
  onCreateEntity,
}: DualSidebarProps) {
  const { currentProject } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  // Determine Navigation Mode
  const isProjectMode = !!projectId;
  const activeProjectId = projectId || currentProject?.id;

  // Icon Navigation (Left Rail)
  const iconNavItems = useMemo(() => {
    if (isProjectMode && activeProjectId) {
      return getProjectIconItems(activeProjectId);
    }
    return getGlobalIconItems();
  }, [isProjectMode, activeProjectId]);

  // Main Navigation (Middle Bar)
  const currentNavItems = useMemo(() => {
    if (customNavItems) return customNavItems;
    if (isProjectMode && activeProjectId) {
      return getProjectNavItems(activeProjectId);
    }
    return getGlobalNavItems();
  }, [customNavItems, isProjectMode, activeProjectId]);

  // Library Items
  const currentLibraryItems = useMemo(() => {
    if (customLibraryItems) return customLibraryItems;
    return getGlobalLibraryItems();
  }, [customLibraryItems]);

  // Management Items
  const finalManagementItems = useMemo(() => {
    if (customManagementItems) return customManagementItems;
    const items = isProjectMode && activeProjectId 
      ? getManagementItems(activeProjectId) 
      : getGlobalManagementItems();
    
    if (isAdmin && !isProjectMode) {
      const adminItem = { id: 'admin', label: 'Admin Portal', href: '/admin/users', icon: 'admin_panel_settings' };
      if (!items.some(i => i.id === 'admin')) {
        return [items[0], adminItem, ...items.slice(1)];
      }
    }
    return items;
  }, [customManagementItems, isProjectMode, activeProjectId, isAdmin]);

  const displayTitle = customTitle || (isProjectMode ? currentProject?.name : "Mytherion") || "Mytherion";
  const displaySubTitle = customSubTitle || (isProjectMode ? "ACTIVE WORLD" : "Archivist Level 4");

  const currentActiveSection = activeIcon || activeSection;

  return (
    <div className="flex h-full shrink-0 relative z-40 border-r border-white/5">
      {/* Left Sidebar Rail (80px) */}
      <aside className="w-20 bg-[#0F0F23] flex flex-col items-center py-6 gap-8">
        {/* Navigation Rail */}
        <nav className="flex flex-col gap-6">
          {iconNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group ${
                currentActiveSection === item.id
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-primary hover:bg-white/5 transition-colors hover:text-white"
              }`}
              title={item.label}
            >
              <span 
                className="material-symbols-outlined text-2xl"
                style={{fontVariationSettings: currentActiveSection === item.id ? "'FILL' 1, 'wght' 700" : "'FILL' 0, 'wght' 400"}}
              >
                {item.icon}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom Rail Section (Settings, Support, User) */}
        <div className="mt-auto flex flex-col gap-6 items-center w-full px-4 mb-2">
          {finalManagementItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                currentActiveSection === item.id ? "text-primary bg-primary/10" : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
              title={item.label}
            >
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            </Link>
          ))}
          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors mt-2 ring-2 ring-white/5">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </aside>

      {/* Inner Sidebar (256px / w-64) */}
      <aside className="w-64 bg-[#16111B]/80 backdrop-blur-2xl flex flex-col pt-8 font-display">
        {/* Contextual Branding (Project Specific) */}
        {isProjectMode && (
          <div className="px-8 mb-10 min-h-[64px] flex flex-col justify-center">
            {currentProject ? (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold tracking-tighter text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.3)] truncate leading-tight">
                  {currentProject.name}
                </h2>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">
                  ACTIVE WORLD
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-7 w-32 bg-white/5 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-10 overflow-y-auto custom-scrollbar">
          {/* Main Nav */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">
              Navigation
            </p>
            {currentNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  currentActiveSection === item.id
                    ? "sidebar-item-active"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[20px] transition-all duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-sm font-semibold tracking-tight truncate">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Library Nav */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">
              Library
            </p>
            {currentLibraryItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  currentActiveSection === item.id
                    ? "sidebar-item-active"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[20px] transition-all duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-sm font-semibold tracking-tight truncate">{item.label}</span>
              </Link>
            ))}
          </div>

        <div className="px-4 mb-8">
          {/* Contextual Actions */}
          <div className="flex flex-col gap-3">
            {isProjectMode && onCreateEntity && (
              <button
                onClick={onCreateEntity}
                className="btn-glass w-full py-3"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Create New Entity
              </button>
            )}
          </div>
        </div>
        </nav>

        {/* Management (Settings/Support with labels) */}
        <div className="mt-auto p-4 space-y-1">
          {finalManagementItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                currentActiveSection === item.id 
                  ? "sidebar-item-active" 
                  : "text-white/70 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] transition-all duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="text-sm font-semibold tracking-tight truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
