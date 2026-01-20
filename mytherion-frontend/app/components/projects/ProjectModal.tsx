'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createProject } from '@/app/store/projectSlice';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.projects);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(createProject(formData));
    
    if (createProject.fulfilled.match(result)) {
      onClose();
      setFormData({ name: '', description: '' });
      // Optionally redirect to the new project
      // router.push(`/projects/${result.payload.id}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-xl glass rounded-3xl p-8 overflow-hidden modal-border-glow border-t-2 border-primary/50 border-b-2 border-secondary/50">
        {/* Decorative animated icon */}
        <div className="absolute top-6 right-6 text-secondary/60 animate-bounce">
          <span className="material-symbols-outlined text-3xl">history_edu</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-extrabold text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            Initiate New World
          </h2>
          <p className="text-slate-400 mt-2">Summon the foundation of your next masterpiece.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">
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

          {/* Genre (Optional - can be added to backend later) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">
                Genre
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">
                  category
                </span>
                <select
                  name="genre"
                  onChange={handleChange}
                  className="w-full pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option className="bg-slate-900" value="high-fantasy">High Fantasy</option>
                  <option className="bg-slate-900" value="sci-fi">Sci-Fi</option>
                  <option className="bg-slate-900" value="grimdark">Grimdark</option>
                  <option className="bg-slate-900" value="steampunk">Steampunk</option>
                  <option className="bg-slate-900" value="cyberpunk">Cyberpunk</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">
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
              className="flex-[2] cosmic-btn py-4 px-6 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 group hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">bolt</span>
              <span>{loading ? 'Initiating...' : 'Initiate Creation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
