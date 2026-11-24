import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectExportPanel from './ProjectExportPanel';
import { projectService, fileNameFromDisposition } from '@/app/services/projectService';

jest.mock('@/app/services/projectService', () => ({
  ...jest.requireActual('@/app/services/projectService'),
  projectService: { exportProject: jest.fn() },
}));

describe('ProjectExportPanel', () => {
  let clicked: { href: string; download: string }[];

  beforeEach(() => {
    jest.clearAllMocks();
    clicked = [];
    global.URL.createObjectURL = jest.fn(() => 'blob:export');
    global.URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push({ href: this.href, download: this.download });
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('downloads the project export under the file name the server gave it', async () => {
    (projectService.exportProject as jest.Mock).mockResolvedValue({ blob: new Blob(['zip']), fileName: 'stellar-drift-2026-11-24.zip' });
    render(<ProjectExportPanel projectId="p1" />);

    fireEvent.click(screen.getByRole('button', { name: /Export Project/ }));

    await waitFor(() => expect(clicked).toEqual([{ href: 'blob:export', download: 'stellar-drift-2026-11-24.zip' }]));
    expect(projectService.exportProject).toHaveBeenCalledWith('p1');
    expect(screen.getByRole('button', { name: /Export Project/ })).toBeEnabled();
  });

  it('frees the download URL only after the browser has had time to start the download', async () => {
    jest.useFakeTimers();
    try {
      (projectService.exportProject as jest.Mock).mockResolvedValue({ blob: new Blob(['zip']), fileName: 'x.zip' });
      render(<ProjectExportPanel projectId="p1" />);

      fireEvent.click(screen.getByRole('button', { name: /Export Project/ }));
      await waitFor(() => expect(clicked).toHaveLength(1));

      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1000);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:export');
    } finally {
      jest.useRealTimers();
    }
  });

  it('says so when the export fails, and lets the author try again', async () => {
    (projectService.exportProject as jest.Mock).mockRejectedValue(new Error('500'));
    render(<ProjectExportPanel projectId="p1" />);

    fireEvent.click(screen.getByRole('button', { name: /Export Project/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be created/);
    expect(clicked).toEqual([]);
    expect(screen.getByRole('button', { name: /Export Project/ })).toBeEnabled();
  });
});

describe('fileNameFromDisposition', () => {
  it('reads plain and UTF-8 encoded file names, and falls back without a header', () => {
    expect(fileNameFromDisposition('attachment; filename="stellar-drift-2026-11-24.zip"', 'x.zip')).toBe('stellar-drift-2026-11-24.zip');
    expect(fileNameFromDisposition("attachment; filename*=UTF-8''%E6%9D%B1%E4%BA%AC-2026-11-24.zip", 'x.zip')).toBe('東京-2026-11-24.zip');
    expect(fileNameFromDisposition(undefined, 'x.zip')).toBe('x.zip');
  });
});
