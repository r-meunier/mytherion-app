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
        return { type: 'entries/updateEntry/rejected', error: { message: 'Version conflict' } };
      }
      // The server only accepts the current version, as optimistic locking does.
      if (action.args?.data?.version !== serverVersion) {
        return { type: 'entries/updateEntry/rejected', error: { message: 'Version conflict' } };
      }
      serverVersion += 1;
      return { type: 'entries/updateEntry/fulfilled', payload: { ...entry, version: serverVersion } };
    }
    if (action.type === 'entries/fetchEntry') {
      serverVersion += 1;
      return { type: 'entries/fetchEntry/fulfilled', payload: { ...entry, version: serverVersion } };
    }
    return action;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    serverVersion = 4;
    failNext = false;
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
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

  it('reports a failed save so the field can reopen, with the reason', async () => {
    failNext = true;
    const { result } = renderHook(() => useEntryAutosave('p1', entry));

    let ok = true;
    await act(async () => {
      ok = await result.current.save({ name: 'Mira' });
    });

    expect(ok).toBe(false);
    expect(result.current.state).toBe('error');
    expect(result.current.error).toBe('Version conflict');
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
