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

  const currentActiveSection = activeIcon || activeSection;

  const isItemActive = (itemId: string) => {
    if (currentActiveSection === itemId) return true;
    if (itemId === "codex" && currentActiveSection === "entities") return true;
    if (itemId === "entities" && currentActiveSection === "codex") return true;
    return false;
  };

  return (
    <div className="flex h-full shrink-0 relative z-40 border-r border-white/5">
      {/* Left Sidebar Rail (80px) */}
      <aside className="w-20 bg-[#0d0914] flex flex-col items-center py-6 gap-8 border-r border-white/5">
        {/* Navigation Rail */}
        <nav className="flex flex-col gap-5">
          {iconNavItems.map((item) => {
            const active = isItemActive(item.id);
            if (item.disabled) {
              return (
                <div
                  key={item.id}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white/30 cursor-not-allowed transition-all duration-300 relative group"
                  title={`${item.label} (${item.badge || 'Coming Soon'})`}
                >
                  <span className="material-symbols-outlined text-2xl opacity-40">
                    {item.icon}
                  </span>
                </div>
              );
            }
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_15px_rgba(221,183,255,0.2)]"
                    : "text-white/60 hover:bg-white/5 transition-colors hover:text-white"
                }`}
                title={item.label}
              >
                <span 
                  className="material-symbols-outlined text-2xl"
                  style={{fontVariationSettings: active ? "'FILL' 1, 'wght' 700" : "'FILL' 0, 'wght' 400"}}
                >
                  {item.icon}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Rail Section (Settings, Support) */}
        <div className="mt-auto flex flex-col gap-4 items-center w-full px-4 mb-2">
          {finalManagementItems.map((item) => {
            const active = isItemActive(item.id);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  active 
                    ? "text-primary bg-primary/15 border border-primary/20 shadow-[0_0_12px_rgba(221,183,255,0.2)]" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                title={item.label}
              >
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Inner Sidebar (256px / w-64) */}
      <aside className="w-64 bg-[#130d1c]/90 backdrop-blur-2xl flex flex-col pt-5 font-sans border-r border-white/5">
        {/* Contextual Branding (Project Specific) */}
        {isProjectMode && (
          <div className="px-5 mb-4 border-b border-white/5 pb-3 flex flex-col justify-center">
            {currentProject ? (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold tracking-tight text-white text-glow truncate leading-tight">
                  {currentProject.name}
                </h2>
              </div>
            ) : (
              <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Main Nav */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.25em] mb-2">
              Navigation
            </p>
            {currentNavItems.map((item) => {
              const active = isItemActive(item.id);
              if (item.disabled) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white/30 cursor-not-allowed transition-all select-none"
                    title={`${item.label} (${item.badge || 'Coming Soon'})`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="material-symbols-outlined text-[20px] opacity-40">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium tracking-tight truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                    active
                      ? "bg-primary/15 text-primary font-bold border border-primary/20 shadow-[0_0_12px_rgba(221,183,255,0.15)]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="material-symbols-outlined text-[20px] transition-all duration-300 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium tracking-tight truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Library Nav */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.25em] mb-3">
              Library
            </p>
            {currentLibraryItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                  isItemActive(item.id)
                    ? "bg-primary/15 text-primary font-bold border border-primary/20 shadow-[0_0_12px_rgba(221,183,255,0.15)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[20px] transition-all duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-sm font-medium tracking-tight truncate">{item.label}</span>
              </Link>
            ))}
          </div>

        <div className="px-2 mb-8 pt-2">
          {/* Contextual Actions */}
          <div className="flex flex-col gap-3">
            {isProjectMode && onCreateEntity && (
              <button
                onClick={onCreateEntity}
                className="bg-[#ddb7ff] text-[#2c0051] hover:bg-[#f0dbff] w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(221,183,255,0.4)] active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Create New Entity</span>
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
                isItemActive(item.id) 
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
