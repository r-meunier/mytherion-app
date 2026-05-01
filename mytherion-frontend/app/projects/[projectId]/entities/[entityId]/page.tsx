'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchEntity, deleteEntity, clearCurrentEntity } from '@/app/store/entitySlice';
import { fetchProject } from '@/app/store/projectSlice';
import { entityTypeConfig } from '@/app/components/entities/EntityTypeSelector';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';
import Link from 'next/link';
import ComponentDispatcher from '@/app/components/entities/metadata/ComponentDispatcher';
import { EntityMetadata } from '@/app/types/entity';

export default function EntityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entityId = parseInt(params.entityId as string);
  const projectId = parseInt(params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentEntity, loading, error } = useAppSelector((state) => state.entities);
  const { currentProject } = useAppSelector((state) => state.projects);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    dispatch(fetchEntity(entityId));
    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, entityId, projectId, currentProject]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentEntity());
    };
  }, [dispatch]);

  const handleEdit = () => {
    router.push(`/projects/${projectId}/entities/${entityId}/edit`);
  };

  const handleDelete = async () => {
    await dispatch(deleteEntity(entityId));
    router.push(`/projects/${projectId}/entities`);
  };

  // Helper to normalize metadata (handles legacy strings or nulls)
  const normalizeMetadata = (meta: any): EntityMetadata => {
    if (!meta) return { components: [] };
    if (typeof meta === 'string') {
      try {
        const parsed = JSON.parse(meta);
        if (parsed && Array.isArray(parsed.components)) return parsed;
      } catch (e) { /* ignore parse error */ }
      return { components: [] };
    }
    if (meta && typeof meta === 'object' && Array.isArray(meta.components)) return meta;
    return { components: [] };
  };

  const projectNavItems = [
    { id: "overview", label: "Overview", href: `/projects/${projectId}` },
    { id: "entities", label: "Entities", href: `/projects/${projectId}/entities` },
    { id: "timeline", label: "Timeline", href: "#" },
    { id: "maps", label: "Maps", href: "#" },
  ];

  const managementItems = [
    { id: "settings", label: "Settings", href: "#" },
    { id: "export", label: "Export Codex", href: "#" },
  ];

  if (loading || !currentEntity || !currentProject) {
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

  if (error) {
    return (
      <div className="relative z-10 flex h-screen overflow-hidden">
        <DualSidebar activeSection="entities" activeIcon="projects" />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="glass rounded-xl p-6 border border-red-500/50">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const typeConfig = entityTypeConfig[currentEntity.type];
  const metadata = normalizeMetadata(currentEntity.metadata);

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
          {/* Back Link */}
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
          </div>

          {/* Header Section */}
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{typeConfig.icon}</span>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-display text-4xl">
                        {currentEntity.name}
                      </h1>
                      <span className={`px-3 py-1 rounded-lg text-micro-badge ${typeConfig.color} glass border border-white/10`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    {currentEntity.summary && (
                      <p className="text-slate-300 text-lg">{currentEntity.summary}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 glass hover:bg-primary hover:text-white border border-primary/30 rounded-lg transition-all flex items-center gap-2 text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 glass hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg transition-all flex items-center gap-2 text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete
                  </button>
                </div>
              </div>

              {/* Tags */}
              {currentEntity.tags && currentEntity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentEntity.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm border border-primary/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metadata Section */}
          {metadata.components && metadata.components.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-h2 text-xl mb-4 uppercase tracking-widest border-l-4 border-primary pl-4">
                Typed Metadata
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metadata.components.map((component, idx) => (
                  <div key={`${component.type}-${idx}`} className="glass rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                        {component.type} Component
                      </span>
                    </div>
                    <ComponentDispatcher
                      component={component}
                      onChange={() => {}} // Read-only
                      disabled={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          {currentEntity.description && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-h2 text-xl mb-4 uppercase tracking-widest border-l-4 border-primary pl-4">
                Description
              </h2>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {currentEntity.description}
              </p>
            </div>
          )}

          {/* Details Section */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-h2 text-xl mb-4 uppercase tracking-widest border-l-4 border-primary pl-4">
              Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <span className="text-card-title text-sm">Created</span>
                <p className="text-white font-medium mt-1">
                  {mounted ? new Date(currentEntity.createdAt).toLocaleString() : '...'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <span className="text-card-title text-sm">Last Updated</span>
                <p className="text-white font-medium mt-1">
                  {mounted ? new Date(currentEntity.updatedAt).toLocaleString() : '...'}
                </p>
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
                <h3 className="text-h3 text-xl mb-2">Delete Entity?</h3>
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
  );
}
