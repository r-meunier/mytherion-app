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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="glass-panel rounded-2xl h-[380px] animate-pulse overflow-hidden"
          >
            <div className="h-64 bg-white/5 w-full" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
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

      {/* Grid with 2026 design gap (32px / gap-8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        
        {/* Create New World Card (Exact 2026 Design Fidelity) */}
        <button 
          onClick={onCreateClick}
          className="project-card-base glass-panel rounded-2xl overflow-hidden flex flex-col group cursor-pointer relative border-dashed border-2 border-white/20 hover:border-solid hover:border-[#ddb7ff]/50 text-left transition-all duration-300"
        >
          {/* Top Interactive Area */}
          <div className="h-64 w-full bg-white/5 flex items-center justify-center relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <span className="material-symbols-outlined text-4xl text-primary font-bold">add</span>
            </div>
          </div>
          
          {/* Card Info Footer */}
          <div className="p-4 flex flex-col gap-1">
            <h3 className="font-section-header text-[18px] text-white group-hover:text-primary transition-colors">
              Create New World
            </h3>
            <span className="text-[11px] text-white/50 font-medium">
              Start a new journey
            </span>
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
