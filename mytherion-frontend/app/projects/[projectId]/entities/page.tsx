'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, clearCurrentProject } from '@/app/store/projectSlice';
import { Entity } from '@/app/types/entity';
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
  const { currentProject, loading, error } = useAppSelector((state) => state.projects);
  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);

  useEffect(() => {
    if (isNaN(projectId)) return;

    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId, currentProject]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch]);

  const handleCreateClick = () => {
    setEditingEntity(null);
    setShowModal(true);
  };

  const handleEditClick = (entity: Entity) => {
    setEditingEntity(entity);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntity(null);
  };

  const projectNavItems = getProjectNavItems(projectId);
  const managementItems = getManagementItems();

  if (loading && !currentProject) {
    return (
      <div className="relative z-10 flex h-screen overflow-hidden">
        <DualSidebar activeSection="entities" activeIcon="projects" />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !currentProject) {
    return (
      <div className="relative z-10 flex h-screen overflow-hidden">
        <DualSidebar activeSection="entities" activeIcon="projects" />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="glass rounded-xl p-6 border border-red-500/50 max-w-md text-center">
              <span className="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
              <h3 className="text-xl font-bold text-white mb-2">Failed to Load Project</h3>
              <p className="text-red-400 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!currentProject) return null;

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
            <p className="text-page-subheader mt-2">
              Browse, search, and manage all entities in {currentProject.name}
            </p>
          </div>

          <EntityList 
            projectId={projectId} 
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
          />
        </div>
      </main>

      <EntityModal
        isOpen={showModal}
        onClose={handleCloseModal}
        projectId={projectId}
        entity={editingEntity}
      />
    </div>
  );
}
