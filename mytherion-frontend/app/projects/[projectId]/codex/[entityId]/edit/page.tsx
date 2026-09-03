'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchEntity, updateEntity, clearCurrentEntity } from '@/app/store/entitySlice';
import { UpdateEntityRequest, CreateEntityRequest } from '@/app/types/entity';
import EntityForm from '@/app/components/codex/EntityForm';
import AppHeader from '@/app/components/AppHeader';
import routes from '@/app/config/routes';

export default function EditEntityPage() {
  const router = useRouter();
  const params = useParams();
  const entityId = (params.entityId as string);
  const projectId = (params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentEntity, loading, error } = useAppSelector((state) => state.entities);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!currentEntity || currentEntity.id !== entityId) {
      dispatch(fetchEntity({ projectId, id: entityId }));
    }

    return () => {
      dispatch(clearCurrentEntity());
    };
  }, [dispatch, entityId, projectId, currentEntity, user, router]);

  const handleSubmit = async (data: CreateEntityRequest | UpdateEntityRequest) => {
    const result = await dispatch(updateEntity({ projectId, id: entityId, data: data as UpdateEntityRequest }));
    if (updateEntity.fulfilled.match(result)) {
      router.push(routes.project(projectId).codex.detail(entityId));
    }
  };

  const handleCancel = () => {
    router.push(routes.project(projectId).codex.detail(entityId));
  };

  if (loading || !currentEntity) {
    return (
      <div className="min-h-screen bg-[#0b0710] flex flex-col">
        <AppHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0710] flex flex-col">
      {/* Ambient Background with Floating Shards & Glows */}
      <div className="ambient-bg fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-shard w-32 h-32 top-20 left-10 opacity-20" />
        <div className="floating-shard w-48 h-48 bottom-40 right-20 opacity-10" style={{ animationDelay: "-5s", animationDuration: "25s" }} />
        <div className="floating-shard w-16 h-16 top-1/2 left-1/4 opacity-30" style={{ animationDelay: "-12s", animationDuration: "15s", borderRadius: "50%" }} />
      </div>

      <AppHeader />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2 text-xs font-semibold text-white/40">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push(routes.home())}
                className="hover:text-white transition-colors"
              >
                Worlds
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] text-white/20 mx-1">chevron_right</span>
                <button
                  onClick={() => router.push(routes.project(projectId).root)}
                  className="hover:text-white transition-colors"
                >
                  World
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] text-white/20 mx-1">chevron_right</span>
                <button
                  onClick={() => router.push(routes.project(projectId).codex.index())}
                  className="hover:text-white transition-colors"
                >
                  Codex
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] text-white/20 mx-1">chevron_right</span>
                <button
                  onClick={() => router.push(routes.project(projectId).codex.detail(entityId))}
                  className="hover:text-white transition-colors truncate max-w-[140px]"
                >
                  {currentEntity.name}
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] text-white/20 mx-1">chevron_right</span>
                <span className="text-primary font-bold">Edit</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-white text-glow tracking-tight">
            Edit {currentEntity.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1 font-medium">Update entity information</p>
        </div>

        {/* Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <EntityForm
            entity={currentEntity}
            projectId={projectId}
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
