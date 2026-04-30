'use client';

import { useState, useEffect } from 'react';
import { Project, CreateProjectRequest } from '@/app/services/projectService';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: CreateProjectRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ProjectForm({ project, onSubmit, onCancel, loading }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    }
  }, [project]);

  const validate = () => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.length > 255) {
      newErrors.name = 'Project name must be less than 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
          Project Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-4 py-3 glass border ${
            errors.name ? 'border-red-500/50' : 'border-white/10'
          } rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
          placeholder="Enter project name"
          disabled={loading}
          maxLength={255}
        />
        {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
        <p className="mt-1 text-xs text-slate-500">{name.length}/255 characters</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 glass border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          placeholder="Enter project description (optional)"
          disabled={loading}
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 glass text-slate-300 rounded-lg font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px] mr-2 inline-block align-text-bottom">close</span>
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[18px] mr-2 inline-block align-text-bottom animate-spin">sync</span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px] mr-2 inline-block align-text-bottom">save</span>
              {project ? 'Update Project' : 'Create Project'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

