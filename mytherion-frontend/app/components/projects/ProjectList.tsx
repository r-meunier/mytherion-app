"use client";

import { useAppSelector } from "@/app/store/hooks";
import ProjectCard from "./ProjectCard";
import { Project } from "@/app/services/projectService";

interface ProjectListProps {
  onCreateClick: () => void;
  onEditClick: (id: string) => void;
}

export default function ProjectList({ onCreateClick, onEditClick }: ProjectListProps) {
  const { projects, loading, error, pagination } = useAppSelector((state) => state.projects);

  const handleDelete = (id: string) => {
    // Implement delete logic if needed
  };

  const handlePageChange = (newPage: number) => {
    // Implement pagination logic if needed
  };

  if (loading && projects.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-[24px]">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="glass-card rounded-2xl h-[420px] animate-pulse"
          >
            <div className="h-56 bg-white/5 w-full mb-4" />
            <div className="px-6 py-2 space-y-4">
              <div className="h-6 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
            </div>
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

      {/* Grid with exact design gutter (24px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[24px]">
        
        {/* Create New World Card (Exact Design Fidelity) */}
        <button 
          onClick={onCreateClick}
          className="project-card-base glass-card flex flex-col items-center justify-center gap-4 !border-dashed !border-2 border-white/20 group hover:border-primary/50 transition-all duration-300"
        >
          {/* Circular Icon with arc glow */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <span className="material-symbols-outlined text-3xl text-primary font-bold">add</span>
          </div>
          
          <div className="text-center px-4">
            {/* Semantic Typography from Design */}
            <h3 className="text-lg font-semibold text-white">Create New World</h3>
            <p className="text-xs text-white/40 mt-1 font-medium">Begin a new chronicle</p>
          </div>
        </button>

        {/* Existing Projects */}
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={onEditClick}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 0}
            className="px-4 py-2 glass text-white rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            Previous
          </button>
          <span className="text-white/60 font-medium">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1}
            className="px-4 py-2 glass text-white rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
