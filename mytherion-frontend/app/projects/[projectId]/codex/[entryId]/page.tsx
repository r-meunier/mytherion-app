'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchEntry, deleteEntry, clearCurrentEntry } from '@/app/store/codexSlice';
import { fetchProject } from '@/app/store/projectSlice';
import { useEntryAutosave } from '@/app/hooks/useEntryAutosave';
import { normalizeContent } from '@/app/utils/entryContent';
import ProjectPageLayout from '@/app/components/ProjectPageLayout';
import PageHeader from '@/app/components/ui/PageHeader';
import EntryTypeBadge from '@/app/components/codex/EntryTypeBadge';
import EntrySidebar from '@/app/components/codex/EntrySidebar';
import EntryTabs from '@/app/components/codex/EntryTabs';
import SaveStatus from '@/app/components/codex/SaveStatus';
import InlineText from '@/app/components/codex/inline/InlineText';
import InlineChips from '@/app/components/codex/inline/InlineChips';
import routes from '@/app/config/routes';
import { projectTrail } from '@/app/config/breadcrumbs';

const requireName = (name: string) =>
  !name.trim() ? 'Name is required' : name.length > 255 ? 'Name must be 255 characters or less' : null;

/**
 * The entry page, which is also where the entry is edited (docs/codex-entry-model.md §2): click
 * a field to change it, and it saves when you leave it.
 */
export default function EntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = (params.entryId as string);
  const projectId = (params.projectId as string);

  const dispatch = useAppDispatch();
  const { currentEntry, error } = useAppSelector((state) => state.entries);
  const { currentProject } = useAppSelector((state) => state.projects);
  const { save, saveImage, state: saveState, error: saveError } = useEntryAutosave(projectId, currentEntry);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch once per entry. Not tied to the project: a refetch while editing would be wasted.
  useEffect(() => {
    dispatch(fetchEntry({ projectId, id: entryId }));
  }, [dispatch, entryId, projectId]);

  // The project name is only needed for the breadcrumbs.
  useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId, currentProject]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentEntry());
    };
  }, [dispatch]);

  const handleDelete = async () => {
    await dispatch(deleteEntry({ projectId, id: entryId }));
    router.push(routes.project(projectId).codex.index());
  };

  const project = routes.project(projectId);
  const content = normalizeContent(currentEntry?.content);

  return (
    <ProjectPageLayout
      projectId={projectId}
      activeSection="codex"
      loading={!currentEntry && !error}
      error={!currentEntry ? error : undefined}
    >
      {currentEntry && (
        <>
          <PageHeader
            title={
              <InlineText
                inline
                value={currentEntry.name}
                label="name"
                validate={requireName}
                maxLength={255}
                onSave={(name) => save({ name })}
              />
            }
            badge={<EntryTypeBadge type={currentEntry.type} />}
            breadcrumbs={projectTrail(
              projectId,
              currentProject?.name,
              { label: 'Codex', href: project.codex.index() },
              { label: currentEntry.name },
            )}
            subtitle={
              <div className="space-y-2 mt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white/40">Also known as:</span>
                  <InlineChips
                    items={currentEntry.aliases ?? []}
                    onSave={(aliases) => save({ aliases })}
                    itemLabel={{ singular: 'alias', plural: 'aliases' }}
                    maxLength={100}
                    chipClassName="chip normal-case tracking-normal text-xs font-medium text-white/70 bg-white/5 border-white/10"
                  />
                </div>
                <InlineChips
                  items={currentEntry.tags ?? []}
                  onSave={(tags) => save({ tags })}
                  itemLabel={{ singular: 'tag', plural: 'tags' }}
                />
              </div>
            }
          >
            <div className="flex items-center gap-2 lg:justify-end">
              <SaveStatus state={saveState} error={saveError} />
              <button onClick={() => setShowDeleteConfirm(true)} className="btn-pill btn-pill-danger">
                <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                <span>Delete</span>
              </button>
            </div>
          </PageHeader>

          {/* Two columns (docs/codex-entry-model.md): sidebar left, main right. On narrow
              screens the main column comes first. The New Entry form uses the same grid. */}
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 items-start">
            <div className="order-2 lg:order-1">
              <EntrySidebar
                entry={currentEntry}
                onDetailsChange={(details) => save({ content: { ...content, details } })}
                onImageChange={saveImage}
              />
            </div>

            <div className="order-1 lg:order-2 space-y-8 min-w-0">
              {/* Overview holds the description, Notes the private scratchpad. Relations and others come later. */}
              <EntryTabs
                tabs={[
                  {
                    id: 'overview',
                    label: 'Overview',
                    content: (
                      <div className="glass-panel rounded-2xl p-4">
                        <InlineText
                          multiline
                          value={currentEntry.description ?? ''}
                          label="description"
                          placeholder="Add a description: who or what is this?"
                          onSave={(description) => save({ description })}
                          className="text-white/70 text-sm leading-relaxed min-h-[3rem]"
                        />
                      </div>
                    ),
                  },
                  {
                    id: 'notes',
                    label: 'Notes',
                    content: (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                          <span className="material-symbols-outlined text-6xl text-amber-400">edit_note</span>
                        </div>
                        <h2 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">lock</span>
                          Private notes
                        </h2>
                        <div className="relative z-10">
                          <InlineText
                            multiline
                            value={currentEntry.notes ?? ''}
                            label="private notes"
                            placeholder="Add notes only you see: thoughts, secrets, reminders…"
                            onSave={(notes) => save({ notes })}
                            className="text-amber-200/80 italic text-sm leading-relaxed"
                            inputClassName="bg-amber-500/5 border-amber-500/20 focus:border-amber-400/50 text-amber-100"
                          />
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div role="dialog" aria-modal="true" aria-labelledby="delete-entry-title" className="glass-container p-6 max-w-md w-full mx-4 border border-white/15">
                <div className="flex items-start gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary text-[32px]" aria-hidden="true">warning</span>
                  <div>
                    <h2 id="delete-entry-title" className="font-display text-xl font-bold text-white mb-2">Delete Entry?</h2>
                    <p className="text-sm text-white/60">
                      Are you sure you want to delete <strong className="text-white">{currentEntry.name}</strong>? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={handleDelete} className="btn-pill btn-pill-danger">
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                    <span>Delete</span>
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="btn-pill btn-pill-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </ProjectPageLayout>
  );
}
