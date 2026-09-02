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
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
      {/* Ambient Background with Floating Shards & Glows */}
      <div className="ambient-bg">
        <div className="floating-shard w-32 h-32 top-20 left-10 opacity-20" />
        <div className="floating-shard w-48 h-48 bottom-40 right-20 opacity-10" style={{ animationDelay: "-5s", animationDuration: "25s" }} />
        <div className="floating-shard w-16 h-16 top-1/2 left-1/4 opacity-30" style={{ animationDelay: "-12s", animationDuration: "15s", borderRadius: "50%" }} />
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
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth relative z-10 custom-scrollbar">
          
          {/* Page Title */}
          <div>
            <h1 className="font-display-lg text-3xl sm:text-4xl font-bold text-white text-glow tracking-tight">
              {currentProject.name}
            </h1>
            {currentProject.description && (
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 max-w-2xl font-medium leading-relaxed">
                {currentProject.description}
              </p>
            )}
          </div>

          {/* Project Overview (Live Metrics with nullish coalescing) */}
          <section className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(221,183,255,0.8)]" />
                <span>Project Overview</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 glass-panel rounded-xl border border-white/5 hover:border-primary/40 transition-all">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">Total Entities</p>
                  <p className="text-3xl font-bold text-white text-glow">
                    {stats?.totalEntities ?? 0}
                  </p>
                </div>
                <div className="p-5 glass-panel rounded-xl border border-white/5 hover:border-primary/40 transition-all">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">Characters</p>
                  <p className="text-3xl font-bold text-white text-glow">
                    {stats?.entityCountByType?.['CHARACTER'] ?? 0}
                  </p>
                </div>
                <div className="p-5 glass-panel rounded-xl border border-white/5 hover:border-primary/40 transition-all">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">Locations</p>
                  <p className="text-3xl font-bold text-white text-glow">
                    {stats?.entityCountByType?.['LOCATION'] ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* World Modules Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">World Modules</h3>
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
          <section className="pt-6 border-t border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">Quick Create</h3>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleQuickCreate(EntityType.CHARACTER)}
                className="glass-panel rounded-xl px-5 py-3 hover:border-primary/40 hover:bg-white/5 transition-all text-sm font-semibold text-white/80 hover:text-white flex items-center gap-3 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
                <span>New Character</span>
              </button>
              <button 
                onClick={() => handleQuickCreate(EntityType.LOCATION)}
                className="glass-panel rounded-xl px-5 py-3 hover:border-primary/40 hover:bg-white/5 transition-all text-sm font-semibold text-white/80 hover:text-white flex items-center gap-3 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">add_location_alt</span>
                <span>New Location</span>
              </button>
              <button 
                onClick={() => handleQuickCreate(EntityType.ITEM)}
                className="glass-panel rounded-xl px-5 py-3 hover:border-primary/40 hover:bg-white/5 transition-all text-sm font-semibold text-white/80 hover:text-white flex items-center gap-3 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                <span>New Lore Entry</span>
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
