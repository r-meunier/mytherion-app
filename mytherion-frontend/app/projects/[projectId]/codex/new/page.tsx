'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntity, clearCurrentEntity } from '@/app/store/codexSlice';
import { fetchProject } from '@/app/store/projectSlice';
import { CreateEntryRequest, UpdateEntryRequest } from '@/app/types/codex';
import EntryForm from '@/app/components/codex/EntryForm';
import DualSidebar from '@/app/components/DualSidebar';
import AppHeader from '@/app/components/AppHeader';
import Link from 'next/link';
import routes from '@/app/config/routes';

export default function NewEntityPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = (params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.projects);
  const { loading, error, currentEntity } = useAppSelector((state) => state.entries);

  useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }

    return () => {
      dispatch(clearCurrentEntity());
    };
  }, [dispatch, projectId, currentProject]);

  // Redirect to entry detail page after successful creation
  useEffect(() => {
    if (currentEntity && !loading && !error) {
      router.push(routes.project(projectId).codex.detail(currentEntity.id));
    }
  }, [currentEntity, loading, error, projectId, router]);

  const handleSubmit = async (data: CreateEntryRequest | UpdateEntryRequest) => {
    await dispatch(createEntity({ projectId, data: data as CreateEntryRequest }));
  };

  const handleCancel = () => {
    router.push(routes.project(projectId).codex.index());
  };

  if (loading || !currentProject) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden relative z-10">
          <DualSidebar activeSection="codex" projectId={projectId} />
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
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
      {/* Ambient Background with Floating Shards & Glows */}
      <div className="ambient-bg fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-shard w-32 h-32 top-20 left-10 opacity-20" />
        <div className="floating-shard w-48 h-48 bottom-40 right-20 opacity-10" style={{ animationDelay: "-5s", animationDuration: "25s" }} />
        <div className="floating-shard w-16 h-16 top-1/2 left-1/4 opacity-30" style={{ animationDelay: "-12s", animationDuration: "15s", borderRadius: "50%" }} />
      </div>

      {/* Header (Global Parent) */}
      <AppHeader />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <DualSidebar 
          activeSection="codex"
          projectId={projectId}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Page Title & Back Link */}
            <div>
              <Link
                href={routes.project(projectId).codex.index()}
                className="inline-flex items-center text-primary text-xs font-bold uppercase tracking-wider hover:text-white transition-colors mb-4 group"
              >
                <span className="material-symbols-outlined text-base mr-1.5 group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Back to CodexCodex
              </Link>
              <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-white text-glow tracking-tight">
                Create CodexEntry
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-lg font-medium tracking-wide">
                Add a new character, location, organization, or other entry to {currentProject.name}
              </p>
            </div>

            {/* Form */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-4xl">
              <EntryForm
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
    </div>
  );
}
