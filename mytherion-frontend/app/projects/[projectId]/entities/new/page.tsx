'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntity } from '@/app/store/entitySlice';
import { fetchProject } from '@/app/store/projectSlice';
import { CreateEntityRequest } from '@/app/types/entity';
import EntityForm from '@/app/components/entities/EntityForm';
import DualSidebar from '@/app/components/DualSidebar';
import DashboardHeader from '@/app/components/DashboardHeader';

export default function NewEntityPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.projects);
  const { loading, error, currentEntity } = useAppSelector((state) => state.entities);
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

  // Redirect to entity detail page after successful creation
  useEffect(() => {
    if (currentEntity && !loading && !error) {
      router.push(`/projects/${projectId}/entities/${currentEntity.id}`);
    }
  }, [currentEntity, loading, error, projectId, router]);

  const handleSubmit = async (data: CreateEntityRequest) => {
    await dispatch(createEntity({ projectId, data }));
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}/entities`);
  };

  if (!currentProject) {
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
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-white mb-2">Create Entity</h1>
              <p className="text-slate-400">Add a new entity to {currentProject.name}</p>
            </div>

            {/* Form */}
            <div className="glass rounded-2xl p-8">
              <EntityForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
