'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchEntity, deleteEntity, clearCurrentEntity } from '@/app/store/entitySlice';
import { entityTypeConfig } from '@/app/components/entities/EntityTypeSelector';
import Navbar from '@/app/components/Navbar';

export default function EntityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entityId = parseInt(params.entityId as string);
  const projectId = parseInt(params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentEntity, loading, error } = useAppSelector((state) => state.entities);
  const { user } = useAppSelector((state) => state.auth);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    dispatch(fetchEntity(entityId));

    return () => {
      dispatch(clearCurrentEntity());
    };
  }, [dispatch, entityId, user, router]);

  const handleEdit = () => {
    router.push(`/projects/${projectId}/entities/${entityId}/edit`);
  };

  const handleDelete = async () => {
    await dispatch(deleteEntity(entityId));
    router.push(`/projects/${projectId}/entities`);
  };

  if (loading || !currentEntity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-400 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  const typeConfig = entityTypeConfig[currentEntity.type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push('/projects')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Projects
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <button
                  onClick={() => router.push(`/projects/${projectId}`)}
                  className="ml-1 text-gray-400 hover:text-white transition-colors"
                >
                  Project
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <button
                  onClick={() => router.push(`/projects/${projectId}/entities`)}
                  className="ml-1 text-gray-400 hover:text-white transition-colors"
                >
                  Entities
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-white font-medium">{currentEntity.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header with Actions */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{typeConfig.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-4xl font-bold text-white">{currentEntity.name}</h1>
                <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.color} bg-gray-800/50 border border-gray-700`}>
                  {typeConfig.label}
                </span>
              </div>
              {currentEntity.summary && (
                <p className="text-gray-400 text-lg">{currentEntity.summary}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Description */}
          {currentEntity.description && (
            <div className="backdrop-blur-sm bg-gray-800/30 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{currentEntity.description}</p>
            </div>
          )}

          {/* Tags */}
          {currentEntity.tags && currentEntity.tags.length > 0 && (
            <div className="backdrop-blur-sm bg-gray-800/30 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {currentEntity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg text-sm border border-purple-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="backdrop-blur-sm bg-gray-800/30 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Created:</span>
                <span className="ml-2 text-white">
                  {new Date(currentEntity.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Updated:</span>
                <span className="ml-2 text-white">
                  {new Date(currentEntity.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Delete Entity?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <strong>{currentEntity.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
