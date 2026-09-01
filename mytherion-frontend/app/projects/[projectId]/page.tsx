'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, clearCurrentProject } from '@/app/store/projectSlice';
import { fetchProjectDashboardStats } from '@/app/store/dashboardSlice';
import { EntityType } from '@/app/types/entity';
import Link from 'next/link';
import ArcaneModuleCard from '@/app/components/ui/ArcaneModuleCard';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';
import EntityModal from '@/app/components/entities/EntityModal';

export default function ProjectDashboard() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { currentProject, loading: projectLoading, error: projectError } = useAppSelector((state) => state.projects);
  const { stats, loading: statsLoading, error: statsError } = useAppSelector((state) => state.dashboard);
  const projectId = (params.projectId as string);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<EntityType>(EntityType.CHARACTER);

  const handleQuickCreate = (type: EntityType) => {
    setQuickCreateType(type);
    setShowCreateModal(true);
  };

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchProjectDashboardStats(projectId));
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [projectId, dispatch]);

  if ((projectLoading || statsLoading) && !currentProject) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projectError || statsError || !currentProject) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark">
        <div className="text-center">
          <p className="text-red-400 mb-4">{projectError || statsError || 'Project not found'}</p>
          <Link
            href="/"
            className="text-primary hover:text-primary/80 transition-colors"
          >
             Back to Projects
          </Link>
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

      {/* Header (Global Parent with Back to Worlds navigation) */}
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Dual Sidebar with Project Context */}
        <DualSidebar 
          activeSection="overview" 
          activeIcon="overview"
          projectId={projectId}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scroll-smooth relative z-10 custom-scrollbar">
          
          {/* Page Title */}
          <div>
            <h1 className="text-5xl font-serif font-bold text-[#D4AF37] tracking-wide">
              {currentProject.name}
            </h1>
            {currentProject.description && (
              <p className="text-white/50 text-sm mt-2 max-w-2xl leading-relaxed">
                {currentProject.description}
              </p>
            )}
          </div>

          {/* Project Overview (Live Metrics with nullish coalescing) */}
          <section className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] border-l-4 border-primary pl-3 mb-8">
                Project Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/30 transition-all">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Total Entities</p>
                  <p className="text-4xl font-bold text-white">
                    {stats?.totalEntities ?? 0}
                  </p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/30 transition-all">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Characters</p>
                  <p className="text-4xl font-bold text-white">
                    {stats?.entityCountByType?.['CHARACTER'] ?? 0}
                  </p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/30 transition-all">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Locations</p>
                  <p className="text-4xl font-bold text-white">
                    {stats?.entityCountByType?.['LOCATION'] ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* World Modules Section */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-[0.2em]">World Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ArcaneModuleCard 
                title="Codex Browser"
                description={`Explore all entities, lore entries, and myths of ${currentProject.name}.`}
                icon="menu_book"
                href={`/projects/${projectId}/entities`}
                badge="PRIMARY"
                isPrimary={true}
              />
              <ArcaneModuleCard 
                title="Timeline"
                description="Visualize the chronological history and major eras of your world."
                icon="auto_graph"
                badge="Coming Soon"
                disabled={true}
              />
              <ArcaneModuleCard 
                title="Relationship Map"
                description="Map out the intricate connections between characters and factions."
                icon="hub"
                badge="Coming Soon"
                disabled={true}
              />
            </div>
          </section>

          {/* Quick Create Section */}
          <section className="pt-8 border-t border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-[0.2em]">Quick Create</h3>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleQuickCreate(EntityType.CHARACTER)}
                className="flex items-center space-x-3 px-6 py-4 bg-white/[0.03] backdrop-blur-[12px] border border-white/10 rounded-xl hover:border-primary/50 transition-all hover:bg-white/5 group cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">person_add</span>
                <span className="font-semibold text-white/80 group-hover:text-white">New Character</span>
              </button>
              <button 
                onClick={() => handleQuickCreate(EntityType.LOCATION)}
                className="flex items-center space-x-3 px-6 py-4 bg-white/[0.03] backdrop-blur-[12px] border border-white/10 rounded-xl hover:border-primary/50 transition-all hover:bg-white/5 group cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">add_location_alt</span>
                <span className="font-semibold text-white/80 group-hover:text-white">New Location</span>
              </button>
              <button 
                onClick={() => handleQuickCreate(EntityType.ITEM)}
                className="flex items-center space-x-3 px-6 py-4 bg-white/[0.03] backdrop-blur-[12px] border border-white/10 rounded-xl hover:border-primary/50 transition-all hover:bg-white/5 group cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">history_edu</span>
                <span className="font-semibold text-white/80 group-hover:text-white">New Lore Entry</span>
              </button>
            </div>
          </section>
        </div>
      </main>
      </div>

      {/* Quick Create Entity Modal */}
      <EntityModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={projectId}
        defaultType={quickCreateType}
        onSuccess={() => {
          dispatch(fetchProjectDashboardStats(projectId));
        }}
      />
    </div>
  );
}
