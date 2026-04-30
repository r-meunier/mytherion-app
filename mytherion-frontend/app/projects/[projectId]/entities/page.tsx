'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, clearCurrentProject } from '@/app/store/projectSlice';
import EntityList from '@/app/components/entities/EntityList';
import EntityModal from '@/app/components/entities/EntityModal';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';
import Link from 'next/link';
import { getProjectNavItems, getManagementItems } from '@/app/config/projectNavigation';

export default function EntitiesPage() {
  const params = useParams();
  const projectId = parseInt(params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject, loading } = useAppSelector((state) => state.projects);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, projectId]);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const projectNavItems = getProjectNavItems(projectId);
  const managementItems = getManagementItems();

  if (loading || !currentProject) {
    return (
      <div className="relative z-10 flex h-screen overflow-hidden">
        <DualSidebar 
          activeSection="entities" 
          activeIcon="projects"
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      <DualSidebar 
        activeSection="entities"
        activeIcon="projects"
        navItems={projectNavItems}
        managementItems={managementItems}
        subTitle={`PROJECT: ${currentProject.name.toUpperCase()}`}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Page Title & Back Link */}
          <div>
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center text-primary text-sm font-semibold hover:text-primary/80 transition-colors mb-4 group"
            >
              <span className="material-symbols-outlined text-sm mr-2 group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Back to {currentProject.name}
            </Link>
            <h2 className="text-5xl font-serif font-bold text-gold tracking-wide">
              Entity Codex
            </h2>
            <p className="text-slate-400 mt-2">
              Browse, search, and manage all entities in {currentProject.name}
            </p>
          </div>

          {/* Entity List */}
          <EntityList projectId={projectId} onCreateClick={handleCreateClick} />
        </div>
      </main>

      {/* Create Entity Modal */}
      <EntityModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        projectId={projectId}
      />
    </div>
  );
}

