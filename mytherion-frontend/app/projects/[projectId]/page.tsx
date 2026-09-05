'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, clearCurrentProject } from '@/app/store/projectSlice';
import { fetchProjectDashboardStats } from '@/app/store/dashboardSlice';
import { EntryType } from '@/app/types/codex';
import Link from 'next/link';
import ArcaneModuleCard from '@/app/components/ui/ArcaneModuleCard';
import DualSidebar from '@/app/components/DualSidebar';
import AppHeader from '@/app/components/AppHeader';
import EntryModal from '@/app/components/codex/EntryModal';
import EntryFilters from '@/app/components/codex/EntryFilters';
import PageHeader from '@/app/components/ui/PageHeader';
import routes from '@/app/config/routes';

export default function ProjectDashboard() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentProject, loading: projectLoading, error: projectError } = useAppSelector((state) => state.projects);
  const { stats, loading: statsLoading, error: statsError } = useAppSelector((state) => state.dashboard);
  const projectId = (params.projectId as string);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<EntryType>(EntryType.CHARACTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [selectedType, setSelectedType] = useState<EntryType | undefined>(undefined);

  const handleQuickCreate = (type: EntryType) => {
    setQuickCreateType(type);
    setShowCreateModal(true);
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(routes.project(projectId).codex.index({ search: query }));
    }
  };

  const handleTypeChange = (type?: EntryType) => {
    setSelectedType(type);
    if (type) {
      router.push(routes.project(projectId).codex.index({ type }));
    } else {
      router.push(routes.project(projectId).codex.index());
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
        <AppHeader />
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
        <AppHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center glass-panel rounded-2xl p-8 max-w-md">
            <p className="text-red-400 mb-4">{projectError || statsError || 'Project not found'}</p>
            <Link
              href={routes.home()}
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

      {/* Header (Global Parent with Back to Projects navigation) */}
      <AppHeader />

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
          
          {/* Header & Glass Command Bar Section (Exact same alignment as Your Projects) */}
          <PageHeader
            title={currentProject.name}
            subtitle={currentProject.description || "Overview and management hub for this universe."}
          >
            {/* Unified Glass Command Bar locked to the right */}
            <EntryFilters 
              search={searchQuery}
              onSearchChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              sortBy={sortBy}
              onSortChange={setSortBy}
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              onCreateClick={() => {
                setQuickCreateType(EntryType.CHARACTER);
                setShowCreateModal(true);
              }}
              placeholder="Search in project..."
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
                  <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Total Entries</span>
                  <span className="material-symbols-outlined text-white/20 text-[20px]">dataset</span>
                </div>
                <p className="text-3xl font-bold text-white text-glow">
                  {stats?.totalEntries ?? 0}
                </p>
              </div>
              <div className="child-panel p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Characters</span>
                  <span className="material-symbols-outlined text-white/20 text-[20px]">group</span>
                </div>
                <p className="text-3xl font-bold text-white text-glow">
                  {stats?.entryCountByType?.['CHARACTER'] ?? 0}
                </p>
              </div>
              <div className="child-panel p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Locations</span>
                  <span className="material-symbols-outlined text-white/20 text-[20px]">location_on</span>
                </div>
                <p className="text-3xl font-bold text-white text-glow">
                  {stats?.entryCountByType?.['LOCATION'] ?? 0}
                </p>
              </div>
            </div>
          </section>

          {/* Project Modules (Structural Parent Container) */}
          <section className="glass-container p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Project Modules</span>
              </h3>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Core Tools</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ArcaneModuleCard 
                title="Codex Browser"
                description={`Explore all entries, lore entries, and myths of ${currentProject.name}.`}
                icon="menu_book"
                href={routes.project(projectId).codex.index()}
                badge="PRIMARY"
                isPrimary={true}
              />
              <ArcaneModuleCard 
                title="Story Planner"
                description="Structure acts, narrative beats, and character arcs for your novel."
                icon="schema"
                badge="Phase 2"
                disabled={true}
              />
              <ArcaneModuleCard 
                title="Manuscript Studio"
                description="Distraction-free chapter and scene drafting with real-time codex context."
                icon="edit_note"
                badge="Phase 2"
                disabled={true}
              />
              <ArcaneModuleCard 
                title="Timeline"
                description="Visualize the chronological history and major eras of your world."
                icon="auto_graph"
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
                onClick={() => handleQuickCreate(EntryType.CHARACTER)}
                className="child-panel-interactive px-4 py-2.5 text-xs font-bold text-white/80 hover:text-white flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">person_add</span>
                <span>New Character</span>
              </button>
              <button 
                onClick={() => handleQuickCreate(EntryType.LOCATION)}
                className="child-panel-interactive px-4 py-2.5 text-xs font-bold text-white/80 hover:text-white flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">add_location_alt</span>
                <span>New Location</span>
              </button>
              <button 
                onClick={() => handleQuickCreate(EntryType.ITEM)}
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

      {/* Quick Create CodexEntry Modal */}
      <EntryModal 
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
