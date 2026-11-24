'use client';

import { useState } from 'react';
import { projectService } from '@/app/services/projectService';

interface ProjectExportPanelProps {
  projectId: string;
}

/** Hands the browser a file to save, then lets go of it. */
function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Not in the same tick: Firefox and Safari can start the download asynchronously, and a URL revoked
  // before then makes the download fail.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * "Your data" on the project dashboard: download the whole project as a zip of Markdown files and
 * images (docs/decisions/0001-local-first-desktop-client.md §4), so the author owns it outside the app.
 */
export default function ProjectExportPanel({ projectId }: ProjectExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const { blob, fileName } = await projectService.exportProject(projectId);
      saveFile(blob, fileName);
    } catch {
      setError('The export could not be created. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="glass-container p-6 relative overflow-hidden" aria-labelledby="project-export-heading">
      <div className="flex items-center justify-between mb-5">
        <h2 id="project-export-heading" className="section-heading flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Your Data</span>
        </h2>
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Export</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-white/60 max-w-2xl">
          Download everything in this project as a .zip: one Markdown file per entry, readable in any text
          editor, plus the images. It&apos;s yours to keep, back up or take elsewhere.
        </p>
        <button type="button" onClick={handleExport} disabled={exporting} className="btn-pill btn-pill-secondary shrink-0">
          <span className="material-symbols-outlined" aria-hidden="true">download</span>
          <span>{exporting ? 'Exporting…' : 'Export Project'}</span>
        </button>
      </div>
      {error && <p role="alert" className="field-error">{error}</p>}
    </section>
  );
}
