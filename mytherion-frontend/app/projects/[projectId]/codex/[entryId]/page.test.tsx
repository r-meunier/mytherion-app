import { render, screen, fireEvent, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import EntryDetailPage from './page';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { fetchEntry, updateEntry } from '@/app/store/codexSlice';
import { CodexEntry, EntryType } from '@/app/types/codex';

jest.mock('@/app/store/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const mockRouter = { push: jest.fn(), replace: jest.fn() };
let mockSearch = '';
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ projectId: 'p1', entryId: 'e1' }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

jest.mock('@/app/store/codexSlice', () => ({
  fetchEntry: Object.assign(
    jest.fn((args: unknown) => ({ type: 'entries/fetchEntry', args })),
    { fulfilled: { match: () => false } }
  ),
  updateEntry: Object.assign(
    jest.fn((args: unknown) => ({ type: 'entries/updateEntry', args })),
    { fulfilled: { match: (a: { type: string }) => a.type === 'entries/updateEntry/fulfilled' } }
  ),
  deleteEntry: jest.fn(() => ({ type: 'entries/deleteEntry' })),
  clearCurrentEntry: jest.fn(() => ({ type: 'entries/clearCurrentEntry' })),
}));

jest.mock('@/app/store/projectSlice', () => ({
  fetchProject: jest.fn(() => ({ type: 'projects/fetchProject' })),
}));

jest.mock('@/app/components/AppHeader', () => {
  const MockHeader = () => <div data-testid="mock-header" />;
  MockHeader.displayName = 'MockHeader';
  return MockHeader;
});

jest.mock('@/app/components/DualSidebar', () => {
  const MockSidebar = () => <nav data-testid="mock-sidebar" />;
  MockSidebar.displayName = 'MockSidebar';
  return MockSidebar;
});

const entry: CodexEntry = {
  id: 'e1',
  projectId: 'p1',
  type: EntryType.ORGANIZATION,
  name: 'The Ark Council',
  aliases: ['The Twelve'],
  tags: ['council'],
  description: 'Decides the fate of the Arks.',
  content: { templateId: null, details: [{ id: 'd1', label: 'Size', value: '12 councillors' }] },
  version: 7,
  createdAt: '2026-10-08T10:00:00Z',
  updatedAt: '2026-10-08T11:00:00Z',
};

describe('EntryDetailPage', () => {
  const dispatch = jest.fn(async (action: { type: string; args?: { data: object } }) =>
    action.type === 'entries/updateEntry'
      ? { type: 'entries/updateEntry/fulfilled', payload: { ...entry, ...action.args!.data, version: 8 } }
      : action
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch = '';
    const state = {
      entries: { currentEntry: entry, error: null },
      projects: { currentProject: { id: 'p1', name: 'Stellar Drift' } },
    };
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: (s: typeof state) => unknown) => selector(state));
  });

  it('has no Edit button: the entry is edited in place', () => {
    render(<EntryDetailPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'The Ark Council' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/ })).toBeInTheDocument();
  });

  it('fetches the entry once, not again when the project arrives', () => {
    render(<EntryDetailPage />);

    expect(fetchEntry).toHaveBeenCalledTimes(1);
  });

  it('saves a renamed entry with its version, and shows that it saved', async () => {
    render(<EntryDetailPage />);

    fireEvent.click(within(screen.getByRole('heading', { level: 1 })).getByRole('button'));
    fireEvent.change(screen.getByRole('textbox', { name: 'name' }), { target: { value: 'The High Council' } });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'name' }), { key: 'Enter' });
    });

    expect(updateEntry).toHaveBeenCalledWith({ projectId: 'p1', id: 'e1', data: { name: 'The High Council', version: 7 } });
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Saved');
  });

  it('saves a detail as part of the entry content', async () => {
    render(<EntryDetailPage />);

    fireEvent.click(screen.getByRole('button', { name: '12 councillors' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Size' }), { target: { value: '13 councillors' } });
    await act(async () => {
      fireEvent.blur(screen.getByRole('textbox', { name: 'Size' }));
    });

    expect(updateEntry).toHaveBeenCalledWith({
      projectId: 'p1',
      id: 'e1',
      data: { content: { templateId: null, details: [{ id: 'd1', label: 'Size', value: '13 councillors' }] }, version: 7 },
    });
  });

  it('says so when New Entry could not upload the image, until it is dismissed', () => {
    mockSearch = 'image=failed';
    render(<EntryDetailPage />);

    expect(screen.getByRole('alert')).toHaveTextContent(/image could not be uploaded/);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/projects/p1/codex/e1');
  });

  it('shows no image notice on a normal visit', () => {
    render(<EntryDetailPage />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
