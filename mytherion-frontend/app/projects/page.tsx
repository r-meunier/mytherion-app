'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createProject, updateProject } from '@/app/store/projectSlice';
import { checkAuth } from '@/app/store/authSlice';
import ProjectList from '../components/projects/ProjectList';
import ProjectForm from '../components/projects/ProjectForm';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faFolder } from '@fortawesome/free-solid-svg-icons';
import { CreateProjectRequest } from '../services/projectService';

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.projects);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleCreate = async (data: CreateProjectRequest) => {
    await dispatch(createProject(data));
    setShowCreateModal(false);
  };

  const handleUpdate = async (data: CreateProjectRequest) => {
    if (editingProjectId) {
      await dispatch(updateProject({ id: editingProjectId, data }));
      setShowCreateModal(false);
      setEditingProjectId(null);
    }
  };

  const handleEdit = (id: number) => {
    setEditingProjectId(id);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProjectId(null);
  };

  // Get the project being edited
  const { projects } = useAppSelector((state) => state.projects);
  const editingProject = editingProjectId 
    ? projects.find(p => p.id === editingProjectId) 
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#190525] to-slate-900">
      {/* Animated background overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#190525]/20 via-transparent to-blue-900/20 pointer-events-none"></div>
      
      {/* Navbar */}
      <Navbar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className="flex relative">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarCollapsed ? "w-0" : "w-64"
          } min-h-[calc(100vh-73px)] bg-slate-900/60 backdrop-blur-md border-r border-purple-500/20 transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <div className="p-4 w-64">
            <h2 className="text-lg font-semibold text-purple-200 mb-4">
              Navigation
            </h2>
            
            <nav className="space-y-2">
              <a
                href="/projects"
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-purple-100 font-medium shadow-lg shadow-purple-500/20 border border-purple-400/30"
              >
                <FontAwesomeIcon icon={faFolder} className="w-5 h-5" />
                <span>Projects</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 transition-all duration-300 ease-in-out relative">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-2">
                  My Projects
                </h1>
                <p className="text-purple-300/80">
                  Organize your lore with projects
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                New Project
              </button>
            </div>

            {/* Project List */}
            <ProjectList
              onCreateClick={() => setShowCreateModal(true)}
              onEditClick={handleEdit}
            />

            {/* Create/Edit Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
                  <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-purple-500/30 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-purple-200">
                      {editingProjectId ? 'Edit Project' : 'Create New Project'}
                    </h2>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-purple-300" />
                    </button>
                  </div>
                  <div className="p-6">
                    <ProjectForm
                      project={editingProject}
                      onSubmit={editingProjectId ? handleUpdate : handleCreate}
                      onCancel={handleCloseModal}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
