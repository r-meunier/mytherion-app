'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProject, fetchProjectStats, clearCurrentProject } from '@/app/store/projectSlice';
import ProjectStats from '@/app/components/projects/ProjectStats';
import Navbar from '@/app/components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEdit,
  faTrash,
  faCog,
  faList,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function ProjectDashboard() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentProject, stats, loading, error } = useAppSelector((state) => state.projects);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const projectId = Number(params.projectId);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchProjectStats(projectId));
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [projectId, dispatch]);

  if (loading && !currentProject) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-purple-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
          <Link
            href="/projects"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarCollapsed ? "w-0" : "w-64"
          } bg-gray-800 border-r border-gray-700 transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            <Link
              href="/projects"
              className="block px-4 py-2 rounded-lg bg-purple-600 text-white"
            >
              Projects
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <Link
                href="/projects"
                className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                Back to Projects
              </Link>
            </nav>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {currentProject.name}
                </h1>
                {currentProject.description && (
                  <p className="text-gray-400 text-lg">{currentProject.description}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/projects/${projectId}/settings`}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="mb-8">
                <ProjectStats stats={stats} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href={`/projects/${projectId}/entities`}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faList} className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-100 group-hover:text-purple-300 transition-colors mb-1">
                      View Entities
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Browse and manage all entities in this project
                    </p>
                  </div>
                </div>
              </Link>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 opacity-50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center">
                    <FontAwesomeIcon icon={faEdit} className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-1">
                      More Features Coming Soon
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Timeline, relationships, and more
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
