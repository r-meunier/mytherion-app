'use client';

import { Project } from '@/app/services/projectService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faFolder } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faFolder} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-100 group-hover:text-purple-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400">
                Created {formatDate(project.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {project.description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}
      </Link>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
        <span className="text-xs text-gray-400">
          Updated {formatDate(project.updatedAt)}
        </span>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(project.id);
            }}
            className="p-2 rounded-lg bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white transition-colors"
            title="Edit project"
          >
            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(project.id);
            }}
            className="p-2 rounded-lg bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-colors"
            title="Delete project"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
