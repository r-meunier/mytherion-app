"use client";

import { useState } from "react";
import { Project } from "@/app/services/projectService";
import Link from "next/link";
import { useIsMounted } from "@/app/hooks/useIsMounted";

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCancelDelete?: () => void;
  isDeleteConfirm?: boolean;
}

export default function ProjectCard({ 
  project, 
  onEdit, 
  onDelete,
  onCancelDelete,
  isDeleteConfirm = false
}: ProjectCardProps) {
  const isMounted = useIsMounted();

  const formatDate = (dateString: string) => {
    if (!isMounted) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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

  const isPinned = false; // Placeholder for pinned behavior

  const idHash = hashId(project.id);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="project-card-base glass-panel rounded-2xl overflow-hidden group cursor-pointer flex flex-col relative shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
      {/* Click overlay */}
      <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10" />

      {/* Hero Image Section */}
      <div className="relative h-64 w-full overflow-hidden bg-black/40">
        <img 
          src={getPlaceholderImage(project.id)}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#16111B] via-transparent to-transparent opacity-80" />
        
        {/* Pinned Tag */}
        {isPinned && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-[#fbbf24]/10 backdrop-blur-xl px-3 py-1 rounded-lg text-[8px] font-black text-secondary border border-secondary/30 flex items-center gap-1.5 uppercase tracking-[0.2em]">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              Pinned
            </span>
          </div>
        )}

        {/* Quick Context Menu Button */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white drop-shadow-md transition-all hover:bg-black/60"
            title="World options"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-36 bg-[#1f1a23] backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(project.id);
                }}
                title="Edit project"
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 text-white/80 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Edit World</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(project.id);
                }}
                title="Delete project"
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title and Secondary Actions */}
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-section-header text-[18px] text-white group-hover:text-primary transition-colors duration-300 truncate pr-2">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(project.id); }}
                title="Edit project"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all relative z-20"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                title="Delete project"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all relative z-20"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3 font-medium">
              {project.description}
            </p>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="mt-2 space-y-3">
          <div className="flex justify-between items-center text-[11px] text-white/50 font-medium">
            <span>{formatDate(project.updatedAt || project.createdAt)}</span>
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-bold text-primary uppercase tracking-wider">
              {project.genre || "High Fantasy"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-bold text-white/30 uppercase tracking-[0.15em]">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] opacity-40">database</span>
              <span>{(project.entityCount || 0).toLocaleString()} Entities</span>
            </div>
          </div>
          
          {/* Progress Bar (Matching 2026 Design) */}
          <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              style={{ width: `${(idHash * 15 % 70) + 25}%` }}
              className="absolute inset-y-0 left-0 bg-primary/40 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            />
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Overlay (Arcane Style) */}
      {isDeleteConfirm && (
        <div className="absolute inset-0 z-30 bg-[#1A1625]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <span className="material-symbols-outlined text-red-400 text-[32px]">warning</span>
          </div>
          <h4 className="text-white font-bold text-lg mb-2">Delete this project?</h4>
          <p className="text-white/40 text-xs mb-6">This action cannot be undone.</p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={(e) => { e.stopPropagation(); onCancelDelete?.(); }}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-xs font-bold hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
