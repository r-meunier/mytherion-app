'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, clearCurrentProject } from '@/app/store/projectSlice';
import { fetchProjectDashboardStats } from '@/app/store/dashboardSlice';
import { EntityType } from '@/app/types/entity';
import Link from 'next/link';
import ArcaneModuleCard from '@/app/components/ui/ArcaneModuleCard';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';
import EntityModal from '@/app/components/entities/EntityModal';
import EntityFilters from '@/app/components/entities/EntityFilters';
import PageHeader from '@/app/components/ui/PageHeader';

export default function ProjectDashboard() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentProject, loading: projectLoading, error: projectError } = useAppSelector((state) => state.projects);
  const { stats, loading: statsLoading, error: statsError } = useAppSelector((state) => state.dashboard);
  const projectId = (params.projectId as string);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<EntityType>(EntityType.CHARACTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [selectedType, setSelectedType] = useState<EntityType | undefined>(undefined);

  const handleQuickCreate = (type: EntityType) => {
    setQuickCreateType(type);
    setShowCreateModal(true);
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/projects/${projectId}/entities?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleTypeChange = (type?: EntityType) => {
    setSelectedType(type);
    if (type) {
      router.push(`/projects/${projectId}/entities?type=${type}`);
    } else {
      router.push(`/projects/${projectId}/entities`);
    }
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
      <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden relative z-10">
          <DualSidebar activeSection="overview" projectId={projectId} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (projectError || statsError || !currentProject) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
        <DashboardHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center glass-panel rounded-2xl p-8 max-w-md">
            <p className="text-red-400 mb-4">{projectError || statsError || 'Project not found'}</p>
            <Link
              href="/"
              className="inline-flex px-6 py-2 bg-primary text-[#2c0051] font-bold rounded-full hover:bg-primary/80 transition-all text-sm"
            >
              Back to Projects
            </Link>
          </div>
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
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-10 space-y-10 scroll-smooth relative z-10 custom-scrollbar">
          
          {/* Header & Glass Command Bar Section (Exact same alignment as Your Worlds) */}
          <PageHeader
            title={currentProject.name}
            subtitle={currentProject.description || "Overview and management hub for this universe."}
          >
            {/* Unified Glass Command Bar locked to the right */}
            <EntityFilters 
              search={searchQuery}
              onSearchChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              sortBy={sortBy}
              onSortChange={setSortBy}
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              onCreateClick={() => {
                setQuickCreateType(EntityType.CHARACTER);
                setShowCreateModal(true);
              }}
              placeholder="Search in world..."
            />
          </PageHeader>

          {/* Project Overview (Structural Parent Container - No Hover Glow) */}
          <section className="glass-container p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Project Overview</span>
              </h3>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Live Metrics</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="child-panel p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Total Entities</span>
                  <span className="material-symbols-outlined text-white/20 text-[20px]">dataset</span>
                </div>
                <p className="text-3xl font-bold text-white text-glow">
                  {stats?.totalEntities ?? 0}
                </p>
              </div>
              <div className="child-panel p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Characters</span>
                  <span className="material-symbols-outlined text-white/20 text-[20px]">group</span>
                </div>
                <p className="text-3xl font-bold text-white text-glow">
                  {stats?.entityCountByType?.['CHARACTER'] ?? 0}
                </p>
              </div>
              <div className="child-panel p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Locations</span>
                  <span className="material-symbols-outlined text-white/20 text-[20px]">location_on</span>
                </div>
                <p className="text-3xl font-bold text-white text-glow">
                  {stats?.entityCountByType?.['LOCATION'] ?? 0}
                </p>
              </div>
            </div>
          </section>

          {/* World Modules (Structural Parent Container) */}
          <section className="glass-container p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>World Modules</span>
              </h3>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Core Tools</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Quick Create (Structural Parent Container) */}
          <section className="glass-container p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Quick Create</span>
              </h3>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Actions</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleQuickCreate(EntityType.CHARACTER)}
                className="child-panel-interactive px-4 py-2.5 text-xs font-bold text-white/80 hover:text-white flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">person_add</span>
                <span>New Character</span>
              </button>
              <button 
                onClick={() => handleQuickCreate(EntityType.LOCATION)}
                className="child-panel-interactive px-4 py-2.5 text-xs font-bold text-white/80 hover:text-white flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">add_location_alt</span>
                <span>New Location</span>
              </button>
              <button 
                onClick={() => handleQuickCreate(EntityType.ITEM)}
                className="child-panel-interactive px-4 py-2.5 text-xs font-bold text-white/80 hover:text-white flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">history_edu</span>
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
