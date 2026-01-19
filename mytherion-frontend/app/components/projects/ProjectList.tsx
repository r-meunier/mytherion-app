'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProjects, deleteProject } from '@/app/store/projectSlice';
import ProjectCard from './ProjectCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ProjectListProps {
  onCreateClick: () => void;
  onEditClick: (id: number) => void;
}

export default function ProjectList({ onCreateClick, onEditClick }: ProjectListProps) {
  const dispatch = useAppDispatch();
  const { projects, loading, error, pagination } = useAppSelector((state) => state.projects);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetches in development mode (React Strict Mode)
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    dispatch(fetchProjects({})).then(() => setHasFetched(true));
  }, [dispatch]);

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      // Actually delete the project
      await dispatch(deleteProject(id));
      setDeleteConfirm(null);
    } else {
      // Show confirmation overlay
      setDeleteConfirm(id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchProjects({ page: newPage, size: pagination.size }));
  };

  // Loading skeleton - show on initial load
  if (!hasFetched || (loading && projects.length === 0)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-700" />
              <div className="flex-1">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state - only show after fetching
  if (hasFetched && !loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-6">
          <FontAwesomeIcon icon={faPlus} className="w-12 h-12 text-purple-400" />
        </div>
        <h3 className="text-2xl font-semibold text-purple-100 mb-2">No Projects Yet</h3>
        <p className="text-gray-400 text-center mb-6 max-w-md">
          Create your first project to start organizing your lore entities
        </p>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create Your First Project
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={onEditClick}
            onDelete={handleDelete}
            onCancelDelete={handleCancelDelete}
            isDeleteConfirm={deleteConfirm === project.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 0}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
