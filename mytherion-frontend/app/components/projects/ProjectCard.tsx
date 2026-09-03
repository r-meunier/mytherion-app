"use client";

import { useState, useRef, useEffect } from "react";
import { Project } from "@/app/services/projectService";
import Link from "next/link";
import { useIsMounted } from "@/app/hooks/useIsMounted";
import routes from "@/app/config/routes";

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCancelDelete?: () => void;
  isDeleteConfirm?: boolean;
  variant?: "grid" | "list";
}

interface CardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

function CardMenu({ onEdit, onDelete, className = "" }: CardMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  return (
    <div ref={menuRef} className={`relative z-20 shrink-0 ${className}`}>
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all shadow-md group-hover:border-white/20 cursor-pointer"
        title="World options"
        aria-label="World options"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>

      <div 
        role="menu"
        aria-orientation="vertical"
        className={`absolute right-0 top-10 w-36 bg-[#1f1a23]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] p-1.5 transition-all duration-200 origin-top-right z-30 ${
          menuOpen ? "opacity-100 scale-100 visible pointer-events-auto" : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
      >
        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(false);
            onEdit();
          }}
          title="Edit project"
          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">edit</span>
          <span>Edit World</span>
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(false);
            onDelete();
          }}
          title="Delete project"
          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

interface DeleteConfirmationOverlayProps {
  onCancel?: () => void;
  onConfirm: () => void;
  maxWidth?: string;
}

function DeleteConfirmationOverlay({ onCancel, onConfirm, maxWidth = "max-w-xs" }: DeleteConfirmationOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 bg-[#1A1625]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
        <span className="material-symbols-outlined text-red-400 text-[32px]">warning</span>
      </div>
      <h4 className="text-white font-bold text-lg mb-2">Delete this project?</h4>
      <p className="text-white/40 text-xs mb-6">This action cannot be undone.</p>
      <div className={`flex gap-3 w-full ${maxWidth}`}>
        <button 
          type="button"
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            onCancel?.(); 
          }}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            onConfirm(); 
          }}
          className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors cursor-pointer"
        >
          Confirm Delete
        </button>
      </div>
    </div>
  );
}

// Deterministic hash of a UUID string so the placeholder image and progress
// width stay stable per project without relying on a numeric id.
const hashId = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(31, hash) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

// Placeholder images based on project ID
const getPlaceholderImage = (id: string) => {
  const images = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCF1oUEVgWsE7erK_ShruATA4wV1-2bleXiAreToITou3C8wZLMBXu7YQ6Ff07csHL90tWQ5aYlGhGlLEeeFrdW_sYvYX3dMtFdsFfwTktUJhe4tCkRv_Qo7O0xk5tv5uhHwVRUOWXldYanoSn-LG5ikF0zjAoPGoqyIrawpqQg0xstt_qvyPuYUILeeWg5YS8mKRM50fTB5RsSabJUhZlplOPg9HgsUJ3dZzPGQ2aNN8XGhwI87gCyNenSzILQeS0EMMCNbc2ip6yn",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAGwCD-6H2m3-0h8SfHigQrcJqVzvDuBZDezE0TvhYuYPl_AcveQQSspn8p0HwfK1FNNdqj1RnYMW0RcYYDKzN8brVvQeWFQGsTecUdRkY9LbrdfDl5tjMdrNhHlIucFmuasfgqHouNp399DCP8C6Gz6oArDgF4u9jI4tzHMxY8t48FgIwWMeCMYHEapdk3A2M1y8p0muFVKUQiNuJNtHetiwJ2hagI_pY0PbWMIE2apNminIKMTJQ8f2bwLTcMrE5H0JfNMeBA78EU",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBH5ibpqCunIHb1VauBGb_FJlrq3B83OhHchAuPVLO-TkT5ANpGl8_GtcctUJpqIblxE7gLX6GGVhqmgruNEvY33gr2dWjwz-wfq3eys-yl0njlmalJ5AKoUGqlRf1Pd-GOlFynbRX5qWvq64BtjJor8ZFxk8ytrLMo7Cp6uDykEyQFe5tkzjcC2g45IL8caeP5eIRfRcEohtPDj1XAWxJMT_YEfhoXmioBIZdQiIlk_eIgS76QyV0suSRVIFTl4738131J4_0SnMzJ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCwEG8oCeMUKDVgdy2IsWwf9ZYN2uyQoEowHkmn7FKO5QF4SWvDJIdPSq7keiHQxc4Vn2o1DUBsxKfAaeP-F9WNXgHZrqUgXNpYA5qF2YNDMTKbH7WV4XeruwoNnL9MMbG07w8oGH0FHW3tDvp1_WO86Of0ztpgefQQkrmFtemTcv9XgejHSzJg4FZa2b-mkEYr3BrQXs6iemewW6P1WwvlmNWoRvmEocJdQyxtNwTWo3X06GH-9I17wqOWwpyJmBbM7vGfxfQ90JjU"
  ];
  return images[hashId(id) % images.length];
};

export default function ProjectCard({ 
  project, 
  onEdit, 
  onDelete,
  onCancelDelete,
  isDeleteConfirm = false,
  variant = "grid",
}: ProjectCardProps) {
  const isMounted = useIsMounted();

  const formatDate = (dateString?: string | null) => {
    if (!isMounted || !dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown date";

    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    if (date.getFullYear() !== now.getFullYear()) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isPinned = false; // Placeholder for pinned behavior

  if (variant === "list") {
    return (
      <div className="glass-panel rounded-2xl overflow-hidden group cursor-pointer flex flex-col sm:flex-row relative shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-primary/40">
        {/* Click overlay */}
        <Link 
          href={routes.project(project.id).root} 
          className="absolute inset-0 z-10" 
          aria-label={`Open project ${project.name}`}
        />

        {/* Thumbnail */}
        <div className="relative h-44 sm:h-auto sm:w-64 shrink-0 overflow-hidden bg-black/40 rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl will-change-transform transform-gpu">
          <img 
            src={getPlaceholderImage(project.id)}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#1b1522] via-transparent to-transparent opacity-90 pointer-events-none" />
          
          {isPinned && (
            <div className="absolute top-3 left-3 z-20">
              <span className="bg-[#fbbf24]/10 backdrop-blur-xl px-3 py-1 rounded-lg text-[8px] font-black text-secondary border border-secondary/30 flex items-center gap-1.5 uppercase tracking-[0.2em]">
                <span className="material-symbols-outlined text-[14px]">stars</span>
                Pinned
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-section-header text-lg font-bold text-white group-hover:text-primary transition-colors duration-300 truncate">
                  {project.name}
                </h3>
                <span className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-bold text-primary uppercase tracking-wider shrink-0">
                  {project.genre || "High Fantasy"}
                </span>
              </div>
              {project.description ? (
                <p className="text-white/50 text-xs leading-relaxed line-clamp-2 font-medium min-h-[2rem]">
                  {project.description}
                </p>
              ) : (
                <div className="min-h-[2rem]" />
              )}
            </div>

            {/* Menu */}
            <CardMenu 
              onEdit={() => onEdit(project.id)} 
              onDelete={() => onDelete(project.id)} 
            />
          </div>

          {/* Metadata Footer */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">
              <span className="material-symbols-outlined text-[14px] mr-1.5 text-primary/70">database</span>
              <span>{(project.entityCount || 0).toLocaleString()} Entities</span>
            </div>
            <span className="text-white/40 font-medium text-[11px]">
              {formatDate(project.updatedAt || project.createdAt)}
            </span>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {isDeleteConfirm && (
          <DeleteConfirmationOverlay 
            onCancel={onCancelDelete} 
            onConfirm={() => onDelete(project.id)} 
            maxWidth="max-w-xs"
          />
        )}
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden group cursor-pointer flex flex-col relative shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-primary/40">
      {/* Click overlay */}
      <Link 
        href={routes.project(project.id).root} 
        className="absolute inset-0 z-10" 
        aria-label={`Open project ${project.name}`}
      />

      {/* Hero Image Section */}
      <div className="relative h-60 w-full overflow-hidden bg-black/40 rounded-t-2xl will-change-transform transform-gpu">
        <img 
          src={getPlaceholderImage(project.id)}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1522] via-transparent to-transparent opacity-90 pointer-events-none" />
        
        {/* Pinned Tag */}
        {isPinned && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-[#fbbf24]/10 backdrop-blur-xl px-3 py-1 rounded-lg text-[8px] font-black text-secondary border border-secondary/30 flex items-center gap-1.5 uppercase tracking-[0.2em]">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              Pinned
            </span>
          </div>
        )}

        {/* Standardized Vertical Hamburger Menu (Top-Right) */}
        <CardMenu 
          onEdit={() => onEdit(project.id)} 
          onDelete={() => onDelete(project.id)} 
          className="absolute top-3 right-3"
        />
      </div>

      {/* Standardized Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Title */}
          <h3 className="font-section-header text-lg font-bold text-white group-hover:text-primary transition-colors duration-300 truncate">
            {project.name}
          </h3>

          {/* Description */}
          {project.description ? (
            <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mt-1.5 font-medium min-h-[2rem]">
              {project.description}
            </p>
          ) : (
            <div className="min-h-[2rem]" />
          )}
        </div>

        {/* Standardized Metadata Footer */}
        <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/40 font-medium text-[11px]">
              {formatDate(project.updatedAt || project.createdAt)}
            </span>
            <span className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-bold text-primary uppercase tracking-wider">
              {project.genre || "High Fantasy"}
            </span>
          </div>

          <div className="flex items-center text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">
            <span className="material-symbols-outlined text-[14px] mr-1.5 text-primary/70">database</span>
            <span>{(project.entityCount || 0).toLocaleString()} Entities</span>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Overlay (Arcane Style) */}
      {isDeleteConfirm && (
        <DeleteConfirmationOverlay 
          onCancel={onCancelDelete} 
          onConfirm={() => onDelete(project.id)} 
          maxWidth="max-w-xs"
        />
      )}
    </div>
  );
}
