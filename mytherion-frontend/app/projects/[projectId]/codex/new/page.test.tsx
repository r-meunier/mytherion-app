import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewEntryPage from './page';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { mediaService } from '@/app/services/mediaService';

jest.mock('@/app/store/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

// One router object for every render, as Next's useRouter returns.
const mockPush = jest.fn();
const mockRouter = { push: mockPush };
let mockSearch = '';
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ projectId: 'p1' }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

jest.mock('@/app/store/codexSlice', () => ({
  createEntry: Object.assign(
    jest.fn(() => ({ type: 'entries/createEntry' })),
    { fulfilled: { match: (action: { type: string }) => action.type === 'entries/createEntry/fulfilled' } }
  ),
  clearCurrentEntry: jest.fn(() => ({ type: 'entries/clearCurrentEntry' })),
}));

jest.mock('@/app/store/projectSlice', () => ({
  fetchProject: jest.fn(() => ({ type: 'projects/fetchProject' })),
}));

jest.mock('@/app/services/mediaService', () => ({
  mediaService: { applyEntryThumbnailChange: jest.fn().mockResolvedValue(true) },
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

let mockImage: File | null = null;
jest.mock('@/app/components/codex/EntryForm', () => {
  const MockEntryForm = ({
    defaultType,
    loading,
    error,
    onSubmit,
  }: {
    defaultType?: string;
    loading?: boolean;
    error?: string | null;
    onSubmit: (data: unknown, image: unknown) => void;
  }) => (
    <div data-testid="entry-form" data-default-type={defaultType ?? ''}>
      <button disabled={loading} onClick={() => onSubmit({ type: 'CHARACTER', name: 'Mira' }, mockImage)}>
        Create
      </button>
      {error && <p>{error}</p>}
    </div>
  );
  MockEntryForm.displayName = 'MockEntryForm';
  return MockEntryForm;
});

describe('NewEntryPage', () => {
  let state: { projects: { currentProject: object | null }; entries: { loading: boolean; error: string | null } };
  let createResult: { type: string; payload?: unknown };
  const dispatch = jest.fn((action: { type: string }) =>
    Promise.resolve(action.type === 'entries/createEntry' ? createResult : action)
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockImage = null;
    mockSearch = '';
    state = { projects: { currentProject: { id: 'p1', name: 'Saltmarsh' } }, entries: { loading: false, error: null } };
    createResult = { type: 'entries/createEntry/fulfilled', payload: { id: 'new-1' } };
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: (s: typeof state) => unknown) => selector(state));
  });

  it('starts from the type given in the URL', () => {
    mockSearch = 'type=LOCATION';
    render(<NewEntryPage />);

    expect(screen.getByTestId('entry-form')).toHaveAttribute('data-default-type', 'LOCATION');
  });

  it('ignores an unknown type in the URL', () => {
    mockSearch = 'type=DRAGON';
    render(<NewEntryPage />);

    expect(screen.getByTestId('entry-form')).toHaveAttribute('data-default-type', '');
  });

  it('creates the entry, stores its image, then opens it', async () => {
    render(<NewEntryPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/projects/p1/codex/new-1'));
    expect(mediaService.applyEntryThumbnailChange).toHaveBeenCalledWith('p1', 'new-1', { file: null, removed: false });
  });

  it('still opens the new entry when its image upload fails, flagged so the entry page can say so', async () => {
    mockImage = new File(['img'], 'mira.png', { type: 'image/png' });
    (mediaService.applyEntryThumbnailChange as jest.Mock).mockResolvedValueOnce(false);
    render(<NewEntryPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/projects/p1/codex/new-1?image=failed'));
  });

  it('keeps the form after a failed save, enabled again, with nothing lost', async () => {
    createResult = { type: 'entries/createEntry/rejected' };
    render(<NewEntryPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled());
    expect(screen.getByTestId('entry-form')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
