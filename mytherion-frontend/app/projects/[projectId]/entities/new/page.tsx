'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntity, clearCurrentEntity } from '@/app/store/entitySlice';
import { fetchProject } from '@/app/store/projectSlice';
import { CreateEntityRequest, UpdateEntityRequest } from '@/app/types/entity';
import EntityForm from '@/app/components/entities/EntityForm';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';
import Link from 'next/link';

export default function NewEntityPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = (params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.projects);
  const { loading, error, currentEntity } = useAppSelector((state) => state.entities);

  useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }

    return () => {
      dispatch(clearCurrentEntity());
    };
  }, [dispatch, projectId, currentProject]);

  // Redirect to entity detail page after successful creation
  useEffect(() => {
    if (currentEntity && !loading && !error) {
      router.push(`/projects/${projectId}/entities/${currentEntity.id}`);
    }
  }, [currentEntity, loading, error, projectId, router]);

  const handleSubmit = async (data: CreateEntityRequest | UpdateEntityRequest) => {
    await dispatch(createEntity({ projectId, data: data as CreateEntityRequest }));
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}/entities`);
  };


  if (!currentProject) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#16111B]">
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#16111B]">
      {/* Background Ley Lines - Exact Design Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0F0F23]">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[100%] bg-[#a855f7]/15 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[70%] bg-[#fbbf24]/5 rounded-full blur-[160px]" />
      </div>

      {/* Header (Global Parent) */}
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <DualSidebar 
          activeSection="entities"
          projectId={projectId}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Page Title & Back Link */}
          <div>
            <Link
              href={`/projects/${projectId}/entities`}
              className="inline-flex items-center text-primary text-sm font-semibold hover:text-primary/80 transition-colors mb-4 group"
            >
              <span className="material-symbols-outlined text-sm mr-2 group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Back to Entity Codex
            </Link>
            <h2 className="text-5xl font-serif font-bold text-gold tracking-wide">
              Create Entity
            </h2>
            <p className="text-slate-400 mt-2">
              Add a new character, location, organization, or other entity to {currentProject.name}
            </p>
          </div>

          {/* Form */}
          <div className="glass rounded-2xl p-8 max-w-4xl">
            <EntityForm
              projectId={projectId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
