'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchEntity, deleteEntity, clearCurrentEntity } from '@/app/store/codexSlice';
import { fetchProject } from '@/app/store/projectSlice';
import { entityTypeConfig } from '@/app/components/codex/EntryTypeSelector';
import DualSidebar from '@/app/components/DualSidebar';
import AppHeader from '@/app/components/AppHeader';
import Link from 'next/link';
import EntrySectionsEditor from '@/app/components/codex/sections/EntrySectionsEditor';
import SectionDispatcher from '@/app/components/codex/sections/SectionDispatcher';
import { EntryContent } from '@/app/types/codex';
import { mediaService } from '@/app/services/mediaService';
import routes from '@/app/config/routes';

export default function EntityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = (params.entryId as string);
  const projectId = (params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentEntity, loading, error } = useAppSelector((state) => state.entries);
  const { currentProject } = useAppSelector((state) => state.projects);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    dispatch(fetchEntity({ projectId, id: entryId }));
    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, entryId, projectId, currentProject]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentEntity());
    };
  }, [dispatch]);

  const handleEdit = () => {
    router.push(routes.project(projectId).codex.edit(entryId));
  };

  const handleDelete = async () => {
    await dispatch(deleteEntity({ projectId, id: entryId }));
    router.push(routes.project(projectId).codex.index());
  };

  // Helper to normalize content (handles legacy strings or nulls)
  const normalizeMetadata = (meta: any): EntryContent => {
    if (!meta) return { sections: [] };
    if (typeof meta === 'string') {
      try {
        const parsed = JSON.parse(meta);
        if (parsed && Array.isArray(parsed.sections)) return parsed;
      } catch (e) { /* ignore parse error */ }
      return { sections: [] };
    }
    if (meta && typeof meta === 'object' && Array.isArray(meta.sections)) return meta;
    return { sections: [] };
  };

  if (loading || !currentEntity || !currentProject) {
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

  if (error) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden relative z-10">
          <DualSidebar activeSection="codex" projectId={projectId} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center">
              <div className="glass-panel rounded-2xl p-8 border border-red-500/30 text-center max-w-md">
                <span className="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const typeConfig = entityTypeConfig[currentEntity.type];
  const content = normalizeMetadata(currentEntity.content);

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
            {/* Back Link */}
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
            </div>

            {/* Header Section */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10">
                {/* Optional Hero Image Banner */}
                {currentEntity.thumbnail && (
                  <div className="relative w-full h-64 md:h-80 mb-6 rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaService.getThumbnailUrl(currentEntity.thumbnail) || ''}
                      alt={currentEntity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0710]/90 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl mt-1">{typeConfig.icon}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-white text-glow tracking-tight">
                          {currentEntity.name}
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeConfig.color} bg-primary/10 border border-primary/20`}>
                          {typeConfig.label}
                        </span>
                      </div>
                      {currentEntity.description && (
                        <p className="text-white/60 text-sm max-w-2xl leading-relaxed">{currentEntity.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-primary text-[#2c0051] font-bold rounded-full hover:bg-primary/90 transition-all flex items-center gap-1.5 text-xs shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-full transition-all flex items-center gap-1.5 text-xs font-semibold active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {currentEntity.tags && currentEntity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                    {currentEntity.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Lore */}
              <div className="lg:col-span-2 space-y-8">
                {/* Semantic Components Section - Tabbed */}
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Lore & Characteristics</span>
                  </h2>
                  <div className="glass-panel rounded-2xl p-5">
                    <EntrySectionsEditor 
                      entityType={currentEntity.type}
                      content={content}
                      readOnly={true}
                    />
                  </div>
                </div>

                {/* Description Section */}
                {currentEntity.description && (
                  <div className="glass-panel rounded-2xl p-6">
                    <h2 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Description</span>
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                      {currentEntity.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Meta & Notes */}
              <div className="space-y-8">
                {/* Private Notes Section */}
                {currentEntity.notes && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <span className="material-symbols-outlined text-6xl text-amber-400">edit_note</span>
                    </div>
                    <h2 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Private Scratchpad
                    </h2>
                    <p className="text-amber-200/80 italic whitespace-pre-wrap text-sm leading-relaxed relative z-10">
                      {currentEntity.notes}
                    </p>
                  </div>
                )}

                {/* Details Section */}
                <div className="glass-panel rounded-2xl p-6">
                  <h2 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Metadata</span>
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Created</span>
                      <p className="text-white font-medium text-sm mt-0.5">
                        {mounted ? new Date(currentEntity.createdAt).toLocaleString() : '...'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Last Updated</span>
                      <p className="text-white font-medium text-sm mt-0.5">
                        {mounted ? new Date(currentEntity.updatedAt).toLocaleString() : '...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20">
              <div className="flex items-start gap-3 mb-4">
                <span className="material-symbols-outlined text-secondary text-[32px]">warning</span>
                <div>
                  <h3 className="text-h3 text-xl mb-2">Delete Entry?</h3>
                  <p className="text-slate-400">
                    Are you sure you want to delete <strong className="text-white">{currentEntity.name}</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-600/20 transition-all font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 glass text-white rounded-lg hover:bg-white/10 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
