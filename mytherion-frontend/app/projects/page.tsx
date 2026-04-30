'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { checkAuth } from '@/app/store/authSlice';
import ProjectList from '../components/projects/ProjectList';
import ProjectModal from '../components/projects/ProjectModal';
import DualSidebar from '../components/DualSidebar';
import DashboardHeader from '../components/DashboardHeader';

import { Project } from '@/app/services/projectService';

export default function ProjectsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { projects, loading: projectsLoading, error: projectsError } = useAppSelector((state) => state.projects);
  const { isAuthenticated, isInitialized, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  // Check authentication status on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !authLoading) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, authLoading, router]);

  const handleCreateClick = () => {
    setEditingProject(undefined);
    setShowCreateModal(true);
  };

  const handleEditClick = (id: number) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setEditingProject(project);
      setShowCreateModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProject(undefined);
  };

  const showTopCreateButton = projects.length > 0 || projectsLoading || projectsError;

  // Show loading state while checking auth
  if (!isInitialized || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      {/* Dual Sidebar */}
      <DualSidebar activeSection="projects" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-display font-bold text-white">My Worlds</h2>
                <p className="text-slate-400 mt-1">Manage and explore your active creative projects.</p>
              </div>
              {showTopCreateButton && (
                <button
                  onClick={handleCreateClick}
                  className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-primary/20 scale-105 hover:scale-110"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span className="font-semibold">Create New Project</span>
                </button>
              )}
            </div>

            {/* Project List */}
            <ProjectList 
              onCreateClick={handleCreateClick}
              onEditClick={handleEditClick}
            />
          </div>
        </div>
      </main>

      {/* Create/Edit Project Modal */}
      <ProjectModal 
        isOpen={showCreateModal} 
        onClose={handleCloseModal}
        project={editingProject}
      />
    </div>
  );
}

