'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, clearCurrentProject } from '@/app/store/projectSlice';
import { fetchProjectDashboardStats } from '@/app/store/dashboardSlice';
import { EntryType } from '@/app/types/codex';
import Link from 'next/link';
import ArcaneModuleCard from '@/app/components/ui/ArcaneModuleCard';
import ProjectPageLayout from '@/app/components/ProjectPageLayout';
import EntryFilters from '@/app/components/codex/EntryFilters';
import PageHeader from '@/app/components/ui/PageHeader';
import routes from '@/app/config/routes';
import { projectTrail } from '@/app/config/breadcrumbs';

export default function ProjectDashboard() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentProject, error: projectError } = useAppSelector((state) => state.projects);
  const { stats, error: statsError } = useAppSelector((state) => state.dashboard);
  const projectId = (params.projectId as string);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [selectedType, setSelectedType] = useState<EntryType | undefined>(undefined);

  // Opens the new-entry page with the type already picked.
  const handleQuickCreate = (type: EntryType) => router.push(routes.project(projectId).codex.new(type));

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

  const loadError = projectError || statsError;

  return (
    <ProjectPageLayout
      projectId={projectId}
      activeSection="overview"
      activeIcon="overview"
      loading={!currentProject && !loadError}
      error={
        loadError ? (
          <>
            <p className="mb-4">{loadError}</p>
            <Link href={routes.home()} className="btn-pill btn-pill-primary">
              Back to Projects
            </Link>
          </>
        ) : undefined
      }
    >
      {currentProject && (
        <>
          {/* Header & Glass Command Bar Section (Exact same alignment as Your Projects) */}
          <PageHeader
            breadcrumbs={projectTrail(projectId, currentProject.name)}
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
              onCreateClick={() => handleQuickCreate(EntryType.CHARACTER)}
              placeholder="Search in project..."
            />
          </PageHeader>

          {/* Project Overview (Structural Parent Container - No Hover Glow) */}
          <section className="glass-container p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-heading flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Project Overview</span>
              </h2>
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
              <h2 className="section-heading flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Project Modules</span>
              </h2>
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
              <h2 className="section-heading flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Quick Create</span>
              </h2>
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
        </>
      )}
    </ProjectPageLayout>
  );
}
