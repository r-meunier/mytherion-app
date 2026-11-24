'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntry, clearCurrentEntry } from '@/app/store/codexSlice';
import { fetchProject } from '@/app/store/projectSlice';
import { CodexEntry, CreateEntryRequest, EntryType } from '@/app/types/codex';
import { mediaService } from '@/app/services/mediaService';
import EntryForm from '@/app/components/codex/EntryForm';
import ProjectPageLayout from '@/app/components/ProjectPageLayout';
import routes from '@/app/config/routes';
import { projectTrail } from '@/app/config/breadcrumbs';

export default function NewEntryPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = (params.projectId as string);
  // ?type=LOCATION from the dashboard's quick-create buttons; anything unknown falls back to the default.
  const requestedType = useSearchParams().get('type');
  const defaultType = Object.values(EntryType).find((t) => t === requestedType);
  
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.projects);
  const { loading, error } = useAppSelector((state) => state.entries);

  useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }

    return () => {
      dispatch(clearCurrentEntry());
    };
  }, [dispatch, projectId, currentProject]);

  // Open the new entry only once its image is stored, so its page shows the image straight away.
  // `saving` keeps the form disabled from submit until navigation; the form stays mounted throughout,
  // so a failed save keeps what the author typed.
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: CreateEntryRequest, image: File | null) => {
    setSaving(true);
    const result = await dispatch(createEntry({ projectId, data }));
    if (createEntry.fulfilled.match(result)) {
      const created = result.payload as CodexEntry;
      await mediaService.applyEntryThumbnailChange(projectId, created.id, { file: image, removed: false });
      router.push(routes.project(projectId).codex.detail(created.id));
    } else {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(routes.project(projectId).codex.index());
  };

  const project = routes.project(projectId);

  return (
    <ProjectPageLayout projectId={projectId} activeSection="codex" loading={!currentProject}>
      {currentProject && (
        <EntryForm
          projectId={projectId}
          defaultType={defaultType}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading || saving}
          error={error}
          title="New Entry"
          subtitle={`Add a character, location, organization or other entry to ${currentProject.name}.`}
          breadcrumbs={projectTrail(
            projectId,
            currentProject.name,
            { label: 'Codex', href: project.codex.index() },
            { label: 'New entry' },
          )}
        />
      )}
    </ProjectPageLayout>
  );
}
