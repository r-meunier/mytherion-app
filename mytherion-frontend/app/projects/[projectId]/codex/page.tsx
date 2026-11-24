'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, clearCurrentProject } from '@/app/store/projectSlice';
import EntryList from '@/app/components/codex/EntryList';
import ProjectPageLayout from '@/app/components/ProjectPageLayout';
import routes from '@/app/config/routes';

export default function CodexPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params.projectId as string);
  
  const dispatch = useAppDispatch();
  const { currentProject, error } = useAppSelector((state) => state.projects);
  useEffect(() => {
    if (!projectId) return;

    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId, currentProject]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch]);

  // Creating has its own page; editing happens on the entry page.
  const handleCreateClick = () => router.push(routes.project(projectId).codex.new());

  return (
    <ProjectPageLayout
      projectId={projectId}
      activeSection="codex"
      onCreateEntry={handleCreateClick}
      loading={!currentProject && !error}
      error={
        !currentProject && error ? (
          <>
            <h2 className="text-xl font-bold text-white mb-2">Failed to Load Project</h2>
            <p className="mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-pill btn-pill-primary">
              Retry
            </button>
          </>
        ) : undefined
      }
    >
      {currentProject && (
        <EntryList
          projectId={projectId}
          projectName={currentProject.name}
          onCreateClick={handleCreateClick}
        />
      )}
    </ProjectPageLayout>
  );
}
