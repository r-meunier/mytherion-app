'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/app/store/hooks';
import { checkAuth } from '@/app/store/authSlice';
import ProjectList from '../components/projects/ProjectList';
import ProjectModal from '../components/projects/ProjectModal';
import DualSidebar from '../components/DualSidebar';
import DashboardHeader from '../components/DashboardHeader';

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleEditClick = (id: number) => {
    // For now, just open create modal - can be enhanced later for editing
    setShowCreateModal(true);
  };

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
              <button
                onClick={handleCreateClick}
                className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-primary/20 scale-105 hover:scale-110"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span className="font-semibold">Create New Project</span>
              </button>
            </div>

            {/* Project List */}
            <ProjectList 
              onCreateClick={handleCreateClick}
              onEditClick={handleEditClick}
            />
          </div>
        </div>
      </main>

      {/* Create Project Modal */}
      <ProjectModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}

