'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createProject, updateProject, clearError } from '@/app/store/projectSlice';
import { Project } from '@/app/services/projectService';
import BaseModal from '../ui/modals/BaseModal';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.projects);
  const isEditing = !!project;
  const [formKey, setFormKey] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: 'High Fantasy', // Default value
  });

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  // Pre-fill data only when project changes or form is cleared
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        genre: project.genre || 'High Fantasy',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        genre: 'High Fantasy',
      });
    }
  }, [project, formKey]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    let result;
    if (isEditing && project) {
      result = await dispatch(updateProject({ id: project.id, data: formData }));
    } else {
      result = await dispatch(createProject(formData));
    }
    
    if (createProject.fulfilled.match(result) || updateProject.fulfilled.match(result)) {
      setFormKey(prev => prev + 1);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit World' : 'Initiate New World'}
      description={isEditing ? 'Refine the details of your creation.' : 'Summon the foundation of your next masterpiece.'}
      icon={isEditing ? 'edit' : 'auto_awesome'}
      decorativeIcon={isEditing ? 'edit_document' : 'history_edu'}
      maxWidth="max-w-2xl"
      onClear={() => setFormKey(prev => prev + 1)}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <label className="text-input-label ml-1">
            Project Name
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">
              title
            </span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Name your universe..."
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Genre */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <label className="text-input-label ml-1">
              Genre
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">
                category
              </span>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option className="bg-slate-900" value="High Fantasy">High Fantasy</option>
                <option className="bg-slate-900" value="Sci-Fi">Sci-Fi</option>
                <option className="bg-slate-900" value="Grimdark">Grimdark</option>
                <option className="bg-slate-900" value="Steampunk">Steampunk</option>
                <option className="bg-slate-900" value="Cyberpunk">Cyberpunk</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-input-label ml-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            placeholder="Describe the echoes of this world..."
            rows={4}
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 glass border border-red-500/50 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 border border-white/10 text-slate-400 font-bold rounded-2xl hover:bg-white/5 transition-colors"
            disabled={loading}
          >
            Abandon Rite
          </button>
          <button
            type="submit"
            className="flex-2 btn-primary py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 group hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
              {isEditing ? 'save' : 'bolt'}
            </span>
            <span>
              {loading 
                ? (isEditing ? 'Saving...' : 'Initiating...') 
                : (isEditing ? 'Save Changes' : 'Initiate Creation')}
            </span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
