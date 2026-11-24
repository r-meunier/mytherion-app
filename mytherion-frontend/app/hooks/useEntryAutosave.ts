'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/app/store/hooks';
import { fetchEntry, updateEntry } from '@/app/store/codexSlice';
import { mediaService } from '@/app/services/mediaService';
import { CodexEntry, UpdateEntryRequest } from '@/app/types/codex';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** One field's change: everything an UpdateEntryRequest carries except the version. */
export type EntryPatch = Omit<UpdateEntryRequest, 'version'>;

/**
 * Saves an entry one field at a time, for editing on the entry page (docs/codex-entry-model.md §2).
 *
 * Saves run one after another. Each PATCH carries the entry's version for optimistic locking, and
 * every save bumps it, so two saves sent at once (blur one field, click into the next) would
 * otherwise collide. Each save resolves to whether it worked, so the field can reopen with the
 * author's text when it didn't.
 */
export function useEntryAutosave(projectId: string, entry: CodexEntry | null) {
  const dispatch = useAppDispatch();
  const entryId = entry?.id;
  const version = useRef(entry?.version ?? 0);
  // The entry as last saved. A patch built from it when its save runs, rather than when it was
  // queued, includes the changes of the saves queued before it (see `save`).
  const latest = useRef(entry);
  const trackedId = useRef(entry?.id);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const pending = useRef(0);
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Take the version from the store when it is newer: the first load, or a refetch. Another entry
  // starts over: its versions have nothing to do with the last one's.
  useEffect(() => {
    if (!entry) return;
    if (entry.id !== trackedId.current) {
      trackedId.current = entry.id;
      version.current = entry.version;
      latest.current = entry;
      return;
    }
    if (entry.version > version.current) version.current = entry.version;
    if (!latest.current || entry.version >= latest.current.version) latest.current = entry;
  }, [entry]);

  /** Queue a task; the status shows "saving" until the queue is empty. */
  const enqueue = useCallback((task: () => Promise<boolean>): Promise<boolean> => {
    pending.current += 1;
    setState('saving');
    setError(null);
    const run = queue.current.then(task).then((ok) => {
      pending.current -= 1;
      if (!ok) setState('error');
      else if (pending.current === 0) setState((s) => (s === 'error' ? s : 'saved'));
      return ok;
    });
    queue.current = run;
    return run;
  }, []);

  /**
   * Save one change. Pass a function when the change depends on the entry's current data (the
   * details list): it runs when this save's turn comes, with the entry as the previous save left it,
   * so two quick edits can't build from the same old list and undo each other.
   */
  const save = useCallback(
    (patch: EntryPatch | ((latest: CodexEntry) => EntryPatch)): Promise<boolean> => {
      if (!entryId) return Promise.resolve(false);
      return enqueue(async () => {
        const base = latest.current;
        if (typeof patch === 'function' && !base) return false;
        const data = typeof patch === 'function' ? patch(base as CodexEntry) : patch;
        const result = await dispatch(
          updateEntry({ projectId, id: entryId, data: { ...data, version: version.current } })
        );
        if (updateEntry.fulfilled.match(result)) {
          version.current = result.payload.version;
          latest.current = result.payload;
          return true;
        }
        // Reload the entry. If it is newer than the version this save sent, someone changed it
        // elsewhere (a 409): with the fresh version the reopened field can be saved again, instead of
        // every later save failing the same way.
        const sent = version.current;
        const fresh = await dispatch(fetchEntry({ projectId, id: entryId }));
        if (fetchEntry.fulfilled.match(fresh)) {
          version.current = fresh.payload.version;
          latest.current = fresh.payload;
          if (fresh.payload.version > sent) {
            setError('This entry was changed elsewhere. It now shows the latest version; save your change again.');
            return false;
          }
        }
        setError(result.error?.message ?? 'The change could not be saved.');
        return false;
      });
    },
    [dispatch, enqueue, entryId, projectId]
  );

  /** Upload a new image (file) or remove the current one (null), then reload the entry. */
  const saveImage = useCallback(
    (file: File | null): Promise<boolean> => {
      if (!entryId) return Promise.resolve(false);
      return enqueue(async () => {
        try {
          if (file) await mediaService.uploadEntryThumbnail(projectId, entryId, file);
          else await mediaService.deleteEntryThumbnail(projectId, entryId);
        } catch {
          setError('The image could not be saved.');
          return false;
        }
        // The image is stored apart from the entry: reload it for the new URL and version.
        const result = await dispatch(fetchEntry({ projectId, id: entryId }));
        if (fetchEntry.fulfilled.match(result)) {
          version.current = result.payload.version;
          latest.current = result.payload;
        }
        return true;
      });
    },
    [dispatch, enqueue, entryId, projectId]
  );

  // "Saved" is a confirmation, not a state to keep showing.
  useEffect(() => {
    if (state !== 'saved') return;
    const timer = setTimeout(() => setState('idle'), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  return { save, saveImage, state, error };
}
