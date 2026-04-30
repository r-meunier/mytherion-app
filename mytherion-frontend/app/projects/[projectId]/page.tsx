'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, fetchProjectStats, clearCurrentProject } from '@/app/store/projectSlice';
import Link from 'next/link';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';
import { getProjectNavItems, getManagementItems } from '@/app/config/projectNavigation';

export default function ProjectDashboard() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { currentProject, stats, loading, error } = useAppSelector((state) => state.projects);
  const projectId = Number(params.projectId);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchProjectStats(projectId));
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [projectId, dispatch]);

  const projectNavItems = getProjectNavItems(projectId);
  const managementItems = getManagementItems();

  if (loading && !currentProject) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
          <Link
            href="/projects"
            className="text-primary hover:text-primary/80 transition-colors"
          >
             Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      {/* Dual Sidebar with Project Context */}
      <DualSidebar 
        activeSection="overview" 
        activeIcon="projects"
        navItems={projectNavItems}
        managementItems={managementItems}
        subTitle={`PROJECT: ${currentProject.name.toUpperCase()}`}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Page Title & Back Link */}
          <div>
             <Link href="/projects" className="inline-flex items-center text-primary text-sm font-semibold hover:text-primary/80 transition-colors mb-4 group">
                <span className="material-symbols-outlined text-sm mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to Worlds
             </Link>
             <h2 className="text-5xl font-serif font-bold text-gold tracking-wide">{currentProject.name}</h2>
          </div>

          {/* Project Overview Card */}
          <section className="glass rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             <div className="relative z-10">
                <h3 className="text-lg font-display font-bold text-white mb-8 uppercase tracking-widest border-l-4 border-primary pl-4">Project Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-1">Total Entities</p>
                      <p className="text-4xl font-display font-bold text-white">{stats?.entityCount || 0}</p>
                   </div>
                   <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-1">Characters</p>
                      <p className="text-4xl font-display font-bold text-white">{stats?.entityCountByType?.['Character'] || 0}</p>
                   </div>
                   <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-1">Locations</p>
                      <p className="text-4xl font-display font-bold text-white">{stats?.entityCountByType?.['Location'] || 0}</p>
                   </div>
                </div>
             </div>
          </section>

          {/* World Modules Section */}
          <section className="space-y-6">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">World Modules</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Codex Browser */}
                <Link href={`/projects/${projectId}/entities`} className="glass rounded-2xl p-6 border-primary/30 border-2 transition-all cursor-pointer bg-primary/5 hover:bg-primary/10 block">
                   <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                         <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
                      </div>
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">PRIMARY</span>
                   </div>
                   <h4 className="text-xl font-bold text-white mb-2">Codex Browser</h4>
                   <p className="text-slate-400 text-sm">Explore all entities, lore entries, and myths of {currentProject.name}.</p>
                </Link>

                {/* Timeline */}
                <div className="glass rounded-2xl p-6 transition-all cursor-not-allowed opacity-80 group">
                   <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-indigo-900/40 transition-colors">
                         <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-400 text-3xl">auto_graph</span>
                      </div>
                      <span className="bg-white/5 text-slate-500 text-[10px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-tighter">Coming Soon</span>
                   </div>
                   <h4 className="text-xl font-bold text-white mb-2">Timeline</h4>
                   <p className="text-slate-400 text-sm">Visualize the chronological history and major eras of your world.</p>
                </div>

                {/* Relationship Map */}
                <div className="glass rounded-2xl p-6 transition-all cursor-not-allowed opacity-80 group">
                   <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-amber-900/40 transition-colors">
                         <span className="material-symbols-outlined text-slate-400 group-hover:text-amber-400 text-3xl">hub</span>
                      </div>
                      <span className="bg-white/5 text-slate-500 text-[10px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-tighter">Coming Soon</span>
                   </div>
                   <h4 className="text-xl font-bold text-white mb-2">Relationship Map</h4>
                   <p className="text-slate-400 text-sm">Map out the intricate connections between characters and factions.</p>
                </div>

             </div>
          </section>

          {/* Quick Create Section */}
          <section className="pt-8 border-t border-white/5 pb-8">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Quick Create</h3>
             <div className="flex flex-wrap gap-4">
                <button className="flex items-center space-x-3 px-6 py-4 glass rounded-xl border-white/10 hover:border-primary/50 transition-all hover:bg-white/5 group">
                   <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">person_add</span>
                   <span className="font-semibold text-slate-200">New Character</span>
                </button>
                <button className="flex items-center space-x-3 px-6 py-4 glass rounded-xl border-white/10 hover:border-primary/50 transition-all hover:bg-white/5 group">
                   <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">add_location_alt</span>
                   <span className="font-semibold text-slate-200">New Location</span>
                </button>
                <button className="flex items-center space-x-3 px-6 py-4 glass rounded-xl border-white/10 hover:border-primary/50 transition-all hover:bg-white/5 group">
                   <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">history_edu</span>
                   <span className="font-semibold text-slate-200">New Lore Entry</span>
                </button>
             </div>
          </section>

        </div>
      </main>
    </div>
  );
}
