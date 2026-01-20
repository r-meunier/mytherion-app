'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject } from '@/app/store/projectSlice';
import EntityList from '@/app/components/entities/EntityList';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';

export default function EntitiesPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject, loading } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId, currentProject, user, router]);

  const handleCreateClick = () => {
    router.push(`/projects/${projectId}/entities/new`);
  };

  if (loading || !currentProject) {
    return (
      <div className="relative z-10 flex h-screen overflow-hidden">
        <DualSidebar activeSection="projects" />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-xl">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      <DualSidebar activeSection="projects" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-white mb-2">Entities</h1>
              <p className="text-slate-400">
                Manage characters, locations, organizations, and more for {currentProject.name}
              </p>
            </div>

            {/* Entity List */}
            <div className="glass rounded-2xl p-6">
              <EntityList projectId={projectId} onCreateClick={handleCreateClick} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

