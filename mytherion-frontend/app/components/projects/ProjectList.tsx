"use client";

import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { deleteProject, fetchProjects } from "@/app/store/projectSlice";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  onCreateClick: () => void;
  onEditClick: (id: string) => void;
  viewMode?: "grid" | "list";
  sortBy?: string;
  onPageChange?: (newPage: number) => void;
}

export default function ProjectList({ 
  onCreateClick, 
  onEditClick,
  viewMode = "grid",
  sortBy = "date",
  onPageChange
}: ProjectListProps) {
  const dispatch = useAppDispatch();
  const { projects = [], loading, error, pagination } = useAppSelector((state) => state.projects || {});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      dispatch(deleteProject(id));
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else if (pagination) {
      dispatch(fetchProjects({ page: newPage, size: pagination.size }));
    }
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // default: "date" (newest first)
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [projects, sortBy]);

  if (loading && projects.length === 0) {
    return (
      <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"}>
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className={`glass-panel rounded-2xl animate-pulse overflow-hidden ${viewMode === "list" ? "h-36" : "h-[380px]"}`}
          >
            <div className={viewMode === "list" ? "h-full bg-white/5 w-full" : "h-64 bg-white/5 w-full"} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 glass border border-red-500/50 rounded-xl text-red-400 flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {sortedProjects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[32px]">public_off</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No projects found</h3>
            <p className="text-white/40 text-sm max-w-sm">
              No creations match your current filters. Create a new project to begin.
            </p>
          </div>
          <button
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-primary text-[#2c0051] font-bold text-sm rounded-full hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(221,183,255,0.4)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"}>
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              variant={viewMode}
              onEdit={onEditClick}
              onDelete={handleDelete}
              onCancelDelete={() => setDeletingId(null)}
              isDeleteConfirm={deletingId === project.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 0}
            className="px-4 py-2 glass text-white rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-white/60 font-medium">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1}
            className="px-4 py-2 glass text-white rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
