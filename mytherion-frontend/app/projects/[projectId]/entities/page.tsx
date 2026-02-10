'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, clearCurrentProject } from '@/app/store/projectSlice';
import EntityList from '@/app/components/entities/EntityList';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';
import Link from 'next/link';

export default function EntitiesPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject, loading } = useAppSelector((state) => state.projects);

  useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, projectId, currentProject]);

  const handleCreateClick = () => {
    router.push(`/projects/${projectId}/entities/new`);
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
    </div>
  );
}

