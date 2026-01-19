'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntity } from '@/app/store/entitySlice';
import { fetchProject } from '@/app/store/projectSlice';
import { CreateEntityRequest } from '@/app/types/entity';
import EntityForm from '@/app/components/entities/EntityForm';
import Navbar from '@/app/components/Navbar';

export default function NewEntityPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.projects);
  const { loading, error, currentEntity } = useAppSelector((state) => state.entities);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId, currentProject, user, router]);

  // Redirect to entity detail page after successful creation
  useEffect(() => {
    if (currentEntity && !loading && !error) {
      router.push(`/projects/${projectId}/entities/${currentEntity.id}`);
    }
  }, [currentEntity, loading, error, projectId, router]);

  const handleSubmit = async (data: CreateEntityRequest) => {
    await dispatch(createEntity({ projectId, data }));
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}/entities`);
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

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
                  {currentProject.name}
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
                <span className="ml-1 text-white font-medium">New</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Entity</h1>
          <p className="text-gray-400">Add a new entity to {currentProject.name}</p>
        </div>

        {/* Form */}
        <div className="backdrop-blur-sm bg-gray-800/30 border border-gray-700 rounded-2xl p-8">
          <EntityForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
