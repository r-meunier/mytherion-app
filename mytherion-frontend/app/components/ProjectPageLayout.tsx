'use client';

import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import DualSidebar from './DualSidebar';

interface ProjectPageLayoutProps {
  projectId: string;
  /** Highlighted item in the project sidebar, e.g. "overview" or "codex". */
  activeSection: string;
  activeIcon?: string;
  onCreateEntry?: () => void;
  /** First load: a spinner in the content area. The header and sidebars stay put. */
  loading?: boolean;
  /** Shown instead of the content when the page could not load. */
  error?: ReactNode;
  children?: ReactNode;
}

/**
 * The frame of every page inside a project (docs/style-guide.md §2): ambient background, app header,
 * project sidebar and one scroll area with the standard padding. Loading and error states render
 * inside the same frame, so nothing around the content moves while a page loads.
 */
export default function ProjectPageLayout({
  projectId,
  activeSection,
  activeIcon,
  onCreateEntry,
  loading = false,
  error,
  children,
}: ProjectPageLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
      <div className="ambient-bg fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-shard w-32 h-32 top-20 left-10 opacity-20" />
        <div className="floating-shard w-48 h-48 bottom-40 right-20 opacity-10" style={{ animationDelay: '-5s', animationDuration: '25s' }} />
        <div className="floating-shard w-16 h-16 top-1/2 left-1/4 opacity-30" style={{ animationDelay: '-12s', animationDuration: '15s', borderRadius: '50%' }} />
      </div>

      <AppHeader />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <DualSidebar
          activeSection={activeSection}
          activeIcon={activeIcon}
          projectId={projectId}
          onCreateEntry={onCreateEntry}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {error ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div role="alert" className="glass-container p-8 border border-red-500/30 text-center max-w-md">
                <span className="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center" role="status" aria-label="Loading">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          ) : (
            // scrollbar-gutter keeps the scrollbar's space even when the page is short enough not to
            // scroll, so content doesn't shift sideways when its height changes (e.g. switching type).
            <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable] px-6 sm:px-12 py-10 space-y-10 scroll-smooth custom-scrollbar">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
