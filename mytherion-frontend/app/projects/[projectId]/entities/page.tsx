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
  const projectId = (params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject, loading, error } = useAppSelector((state) => state.projects);
  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);

  useEffect(() => {
    if (!projectId) return;

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
      <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden relative z-10">
          <DualSidebar activeSection="entities" projectId={projectId} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !currentProject) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden relative z-10">
          <DualSidebar activeSection="entities" projectId={projectId} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center">
              <div className="glass-panel rounded-2xl p-8 border border-red-500/30 max-w-md text-center">
                <span className="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
                <h3 className="text-xl font-bold text-white mb-2">Failed to Load Project</h3>
                <p className="text-red-400 text-sm mb-6">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary text-[#2c0051] font-bold rounded-full hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!currentProject) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
      {/* Ambient Background with Floating Shards & Glows */}
      <div className="ambient-bg fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-shard w-32 h-32 top-20 left-10 opacity-20" />
        <div className="floating-shard w-48 h-48 bottom-40 right-20 opacity-10" style={{ animationDelay: "-5s", animationDuration: "25s" }} />
        <div className="floating-shard w-16 h-16 top-1/2 left-1/4 opacity-30" style={{ animationDelay: "-12s", animationDuration: "15s", borderRadius: "50%" }} />
      </div>

      {/* Header (Now Global Parent) */}
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <DualSidebar 
          activeSection="entities"
          projectId={projectId}
          onCreateEntity={handleCreateClick}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-10 space-y-10 scroll-smooth relative z-10 custom-scrollbar">
            <EntityList 
              projectId={projectId} 
              projectName={currentProject.name}
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
    </div>
  );
}
