'use client';

import { useState } from 'react';
import { Project } from '@/app/services/projectService';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(project.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  // Placeholder image - in production this would come from project data
  const projectImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop';
  const genre = 'High Fantasy'; // This would come from project data

  return (
    <div className={`project-card glass rounded-3xl overflow-hidden border border-white/10 transition-all cursor-pointer shadow-xl relative ${
      showDeleteConfirm ? '' : 'group hover:border-primary/40'
    }`}>
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl z-20 flex items-center justify-center p-6 rounded-3xl border-2 border-red-500/50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <span className="material-symbols-outlined text-red-400 text-[32px]">warning</span>
            </div>
            <h3 className="text-xl font-display font-bold text-white">Delete Project?</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2.5 glass text-white rounded-lg hover:bg-white/10 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-600/20 transition-all font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <Link href={`/projects/${project.id}`}>
          <img 
            src={projectImage}
            alt={project.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              showDeleteConfirm ? 'grayscale-[20%]' : 'grayscale-[20%] group-hover:grayscale-0'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-80" />
          
          {/* Genre Badge */}
          <div className="absolute bottom-4 left-6">
            <span className="px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
              {genre}
            </span>
          </div>
        </Link>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <h3 className={`text-2xl font-display font-bold text-white transition-colors ${
              showDeleteConfirm ? '' : 'group-hover:text-primary'
            }`}>
              {project.name}
            </h3>
            {project.description && (
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </Link>
          
          {/* More Menu Button */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="material-symbols-outlined text-xs mr-1 text-slate-500">group</span>
              0 Characters
            </span>
            <span className="flex items-center">
              <span className="material-symbols-outlined text-xs mr-1 text-slate-500">location_on</span>
              0 Locations
            </span>
          </div>
          <span className="text-slate-600">Updated {formatDate(project.updatedAt)}</span>
        </div>
      </div>

      {/* Action buttons - shown on hover */}
      {!showDeleteConfirm && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(project.id);
            }}
            className="p-2 rounded-lg glass hover:bg-primary hover:text-white transition-all backdrop-blur-md"
            title="Edit Project"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-lg glass hover:bg-red-600 hover:text-white transition-all backdrop-blur-md"
            title="Delete Project"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

