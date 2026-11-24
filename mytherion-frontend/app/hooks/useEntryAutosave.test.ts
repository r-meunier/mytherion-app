import { renderHook, act } from '@testing-library/react';
import { useEntryAutosave } from './useEntryAutosave';
import { useAppDispatch } from '@/app/store/hooks';
import { updateEntry } from '@/app/store/codexSlice';
import { mediaService } from '@/app/services/mediaService';
import { CodexEntry, EntryType } from '@/app/types/codex';

jest.mock('@/app/store/hooks', () => ({ useAppDispatch: jest.fn() }));

jest.mock('@/app/store/codexSlice', () => ({
  updateEntry: Object.assign(
    jest.fn((args: unknown) => ({ type: 'entries/updateEntry', args })),
    { fulfilled: { match: (a: { type: string }) => a.type === 'entries/updateEntry/fulfilled' } }
  ),
  fetchEntry: Object.assign(
    jest.fn((args: unknown) => ({ type: 'entries/fetchEntry', args })),
    { fulfilled: { match: (a: { type: string }) => a.type === 'entries/fetchEntry/fulfilled' } }
  ),
}));

jest.mock('@/app/services/mediaService', () => ({
  mediaService: { uploadEntryThumbnail: jest.fn(), deleteEntryThumbnail: jest.fn() },
}));

const entry: CodexEntry = {
  id: 'e1',
  projectId: 'p1',
  type: EntryType.CHARACTER,
  name: 'Mira Vell',
  tags: [],
  version: 4,
  createdAt: '2026-10-08T10:00:00Z',
  updatedAt: '2026-10-08T11:00:00Z',
};

describe('useEntryAutosave', () => {
  let serverVersion: number;
  let failNext: boolean;
  const dispatch = jest.fn(async (action: { type: string; args?: { data?: { version: number } } }) => {
    if (action.type === 'entries/updateEntry') {
      if (failNext) {
        failNext = false;
        return { type: 'entries/updateEntry/rejected', error: { message: 'Network Error' } };
      }
      // The server only accepts the current version, as optimistic locking does.
      if (action.args?.data?.version !== serverVersion) {
        return { type: 'entries/updateEntry/rejected', error: { message: 'Version conflict' } };
      }
      serverVersion += 1;
      return { type: 'entries/updateEntry/fulfilled', payload: { ...entry, version: serverVersion } };
    }
    // A reload returns what is stored; it never changes the version itself.
    if (action.type === 'entries/fetchEntry') {
      return { type: 'entries/fetchEntry/fulfilled', payload: { ...entry, version: serverVersion } };
    }
    return action;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    serverVersion = 4;
    failNext = false;
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    // Storing an image bumps the entry's version, as the backend does.
    (mediaService.uploadEntryThumbnail as jest.Mock).mockImplementation(async () => {
      serverVersion += 1;
    });
  });

  it('runs saves fired together one after another, each with the version the previous one returned', async () => {
    const { result } = renderHook(() => useEntryAutosave('p1', entry));

    let outcomes: boolean[] = [];
    await act(async () => {
      outcomes = await Promise.all([
        result.current.save({ name: 'Mira' }),
        result.current.save({ description: 'A cartographer.' }),
      ]);
    });

    expect(outcomes).toEqual([true, true]);
    expect((updateEntry as unknown as jest.Mock).mock.calls.map(([a]) => a.data)).toEqual([
      { name: 'Mira', version: 4 },
      { description: 'A cartographer.', version: 5 },
    ]);
    expect(result.current.state).toBe('saved');
  });

  it('builds a function patch from the entry the previous save returned, so quick edits keep each other', async () => {
    // Server echoes what it stored, as the real PATCH does.
    let stored: CodexEntry = { ...entry, content: { templateId: null, details: [{ id: 'a', label: 'Size', value: '12' }, { id: 'b', label: 'Voice', value: null }] } };
    const echo = async (action: { type: string; args?: { data?: object } }) => {
      stored = { ...stored, ...action.args!.data, version: stored.version + 1 };
      return { type: 'entries/updateEntry/fulfilled', payload: stored };
    };
    // Once per save, so the shared mock is back to normal for the next test.
    dispatch.mockImplementationOnce(echo as never).mockImplementationOnce(echo as never);
    const { result } = renderHook(() => useEntryAutosave('p1', stored));
    const setDetail = (id: string, value: string) => (latest: CodexEntry) => ({
      content: { ...latest.content!, details: latest.content!.details.map((d) => (d.id === id ? { ...d, value } : d)) },
    });

    // Both queued before either has run, like blurring one detail and then the next.
    await act(async () => {
      await Promise.all([result.current.save(setDetail('a', '13')), result.current.save(setDetail('b', 'Clipped'))]);
    });

    expect(stored.content!.details.map((d) => d.value)).toEqual(['13', 'Clipped']);
  });

  it('reports a failed save so the field can reopen, with the reason', async () => {
    failNext = true;
    const { result } = renderHook(() => useEntryAutosave('p1', entry));

    let ok = true;
    await act(async () => {
      ok = await result.current.save({ name: 'Mira' });
    });

    expect(ok).toBe(false);
    expect(result.current.state).toBe('error');
    expect(result.current.error).toBe('Network Error');
  });

  it('after a conflict (changed elsewhere), loads the latest version so the retry succeeds', async () => {
    serverVersion = 6; // saved twice in another tab since this page loaded version 4
    const { result } = renderHook(() => useEntryAutosave('p1', entry));

    let first = true;
    await act(async () => {
      first = await result.current.save({ name: 'Mira' });
    });
    expect(first).toBe(false);
    expect(result.current.error).toMatch(/changed elsewhere/);

    let retry = false;
    await act(async () => {
      retry = await result.current.save({ name: 'Mira' });
    });
    expect(retry).toBe(true);
    expect((updateEntry as unknown as jest.Mock).mock.calls.map(([a]) => a.data.version)).toEqual([4, 6]);
  });

  it('starts from the new entry\'s version when it is given another entry', async () => {
    const { result, rerender } = renderHook(({ e }) => useEntryAutosave('p1', e), { initialProps: { e: { ...entry, version: 9 } } });
    serverVersion = 2;

    rerender({ e: { ...entry, id: 'e2', version: 2 } });
    let ok = false;
    await act(async () => {
      ok = await result.current.save({ name: 'Other' });
    });

    expect(ok).toBe(true);
    expect((updateEntry as unknown as jest.Mock).mock.calls[0][0]).toMatchObject({ id: 'e2', data: { version: 2 } });
  });

  it('reloads the entry after an image change, so later saves use its new version', async () => {
    const { result } = renderHook(() => useEntryAutosave('p1', entry));
    const file = new File(['img'], 'mira.png', { type: 'image/png' });

    await act(async () => {
      await result.current.saveImage(file);
      await result.current.save({ name: 'Mira' });
    });

    expect(mediaService.uploadEntryThumbnail).toHaveBeenCalledWith('p1', 'e1', file);
    expect((updateEntry as unknown as jest.Mock).mock.calls[0][0].data.version).toBe(5);
    expect(result.current.state).toBe('saved');
  });

  it('reports a failed image upload without reloading the entry', async () => {
    (mediaService.uploadEntryThumbnail as jest.Mock).mockRejectedValueOnce(new Error('too big'));
    const { result } = renderHook(() => useEntryAutosave('p1', entry));

    let ok = true;
    await act(async () => {
      ok = await result.current.saveImage(new File(['img'], 'mira.png', { type: 'image/png' }));
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('The image could not be saved.');
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'entries/fetchEntry' }));
  });
});
