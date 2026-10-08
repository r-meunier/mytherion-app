'use client';

import { useState, useEffect, useRef } from 'react';
import { CodexEntry, EntryType, CreateEntryRequest, UpdateEntryRequest, EntryContent, EntryTemplate } from '@/app/types/codex';
import { mediaService, MEDIA_CONSTRAINTS } from '@/app/services/mediaService';
import { codexService } from '@/app/services/codexService';
import { defaultTemplate, detailsFromTemplate, hasDetailValues, normalizeContent } from '@/app/utils/entryContent';
import EntryTypeSelector from './EntryTypeSelector';
import TagInput from './TagInput';
import DetailsEditor from './details/DetailsEditor';
import TemplatePicker from './details/TemplatePicker';

const REPLACE_DETAILS_PROMPT = 'This replaces the details you have entered. Continue?';

interface EntryFormProps {
  entry?: CodexEntry;
  projectId: string;
  defaultType?: EntryType;
  isOpen?: boolean; // New prop to track visibility
  onSubmit: (data: CreateEntryRequest | UpdateEntryRequest, imageFile?: File | null) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function EntryForm({ entry, projectId, defaultType, isOpen, onSubmit, onCancel, loading = false, error }: EntryFormProps) {
  const isEditMode = !!entry;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(mediaService.getThumbnailUrl(entry?.thumbnail));

  const [formData, setFormData] = useState({
    type: entry?.type || defaultType || EntryType.CHARACTER,
    name: entry?.name || '',
    description: entry?.description || '',
    notes: entry?.notes || '',
    tags: entry?.tags || [],
    aliases: entry?.aliases || [],
    content: normalizeContent(entry?.content),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<EntryTemplate[]>([]);

  // Sync internal state when entry prop changes
  useEffect(() => {
    if (entry) {
      setFormData({
        type: entry.type,
        name: entry.name,
        description: entry.description || '',
        notes: entry.notes || '',
        tags: entry.tags || [],
        aliases: entry.aliases || [],
        content: normalizeContent(entry.content),
      });
      setImageFile(null);
      setImagePreview(mediaService.getThumbnailUrl(entry.thumbnail));
    }
  }, [entry]);

  // Clear internal errors when modal reopens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  // Clean up object URL when imagePreview unmounts or changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = mediaService.validateImageFile(file);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, image: validation.error || 'Invalid image file' }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setErrors(prev => {
      const next = { ...prev };
      delete next.image;
      return next;
    });

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
  };

  // Create mode: load the templates for the chosen type and start from the default one (Basic).
  // Type changes are confirmed in handleTypeChange, so replacing the details here is safe.
  useEffect(() => {
    if (isEditMode) return;
    let cancelled = false;

    codexService
      .getTemplates(formData.type)
      .then((list) => {
        if (cancelled) return;
        setTemplates(list);
        const initial = defaultTemplate(list);
        setFormData((prev) => ({
          ...prev,
          content: initial
            ? { templateId: initial.id, details: detailsFromTemplate(initial) }
            : { templateId: null, details: [] },
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setTemplates([]);
        setErrors((prev) => ({ ...prev, templates: 'Templates could not be loaded. You can still add details yourself.' }));
      });

    return () => {
      cancelled = true;
    };
  }, [formData.type, isEditMode]);

  const handleTypeChange = (type: EntryType) => {
    if (type === formData.type) return;
    if (hasDetailValues(formData.content.details) && !window.confirm(REPLACE_DETAILS_PROMPT)) return;
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleTemplateSelect = (template: EntryTemplate) => {
    if (template.id === formData.content.templateId) return;
    if (hasDetailValues(formData.content.details) && !window.confirm(REPLACE_DETAILS_PROMPT)) return;
    setFormData((prev) => ({
      ...prev,
      content: { templateId: template.id, details: detailsFromTemplate(template) },
    }));
  };

  const handleDetailsChange = (details: EntryContent['details']) =>
    setFormData((prev) => ({ ...prev, content: { ...prev.content, details } }));

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (formData.content.details.some((d) => d.label.trim() === '' && (d.value ?? '').trim() !== '')) {
      newErrors.details = 'Every detail with text needs a label.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Rows the author added but never filled in carry no information; drop them silently.
    const content: EntryContent = {
      ...formData.content,
      details: formData.content.details.filter((d) => d.label.trim() !== '' || (d.value ?? '').trim() !== ''),
    };

    if (isEditMode) {
      const updateData: UpdateEntryRequest = { version: entry.version };
      if (formData.name !== entry.name) updateData.name = formData.name;
      if (formData.description !== entry.description) updateData.description = formData.description;
      if (formData.notes !== entry.notes) updateData.notes = formData.notes;
      if (JSON.stringify(formData.tags) !== JSON.stringify(entry.tags)) updateData.tags = formData.tags;
      if (JSON.stringify(formData.aliases) !== JSON.stringify(entry.aliases ?? [])) updateData.aliases = formData.aliases;
      if (JSON.stringify(content) !== JSON.stringify(normalizeContent(entry.content))) updateData.content = content;

      onSubmit(updateData, imageFile);
    } else {
      const createData: CreateEntryRequest = { ...formData, content };
      onSubmit(createData, imageFile);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fields? This will lose all unsaved progress on this draft.')) {
      const initial = defaultTemplate(templates);
      setFormData({
        type: entry?.type || defaultType || EntryType.CHARACTER,
        name: '',
        description: '',
        notes: '',
        tags: [],
        aliases: [],
        content: initial
          ? { templateId: initial.id, details: detailsFromTemplate(initial) }
          : { templateId: null, details: [] },
      });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      <div className="space-y-6">
        {/* ... existing header ... */}
        <div className="border-b border-gray-800 pb-6">
          <EntryTypeSelector
            value={formData.type}
            onChange={handleTypeChange}
            disabled={isEditMode}
            label={isEditMode ? 'Entry Type (cannot be changed)' : 'Entry Type'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Identity & Classification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-2 bg-gray-800/50 border ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                  placeholder="Enter entry name"
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

            </div>

            {/* Aliases */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Aliases</label>
              <TagInput
                tags={formData.aliases}
                onChange={(aliases) => setFormData(prev => ({ ...prev, aliases }))}
                placeholder="Other names, nicknames, titles..."
                maxLength={100}
                itemLabel={{ singular: 'Alias', plural: 'aliases' }}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="entry-image-upload" className="block text-sm font-medium text-gray-300 mb-2">
                CodexEntry Image
              </label>
              
              {/* Hidden file input permanently mounted in the DOM */}
              <input
                ref={fileInputRef}
                type="file"
                id="entry-image-upload"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />

              {imagePreview ? (
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black/40 border border-gray-700 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Entry preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-glass-sm cursor-pointer"
                      title="Change Image"
                      disabled={loading}
                    >
                      <span className="material-symbols-outlined text-[18px]">cached</span>
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn-glass-sm btn-glass-danger cursor-pointer"
                      title="Remove Image"
                      disabled={loading}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="w-full h-44 rounded-xl border-2 border-dashed border-gray-700/80 hover:border-primary/60 bg-gray-800/20 hover:bg-gray-800/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      JPEG, PNG, GIF, WebP (Max {MEDIA_CONSTRAINTS.MAX_SIZE_LABEL})
                    </p>
                  </div>
                </div>
              )}
              {errors.image && <p className="mt-1 text-sm text-red-400">{errors.image}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
              />
            </div>
          </div>

          {/* Description & Notes Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">description</span>
              Narrative & Lore
            </h3>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Public Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="The main lore text..."
                disabled={loading}
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-amber-400/80 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                Private Notes / Scratchpad
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 bg-amber-900/10 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-900/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none italic text-sm"
                placeholder="Thoughts, secrets, or internal reminders..."
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Details - Full Width */}
        <div className="pt-8 space-y-6">
          <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-purple-500 text-3xl">list_alt</span>
            Details
          </h3>

          {!isEditMode && (
            <TemplatePicker
              templates={templates}
              selectedId={formData.content.templateId}
              onSelect={handleTemplateSelect}
              disabled={loading}
            />
          )}
          {errors.templates && <p className="text-sm text-amber-400">{errors.templates}</p>}

          <div className="bg-gray-900/40 rounded-2xl p-4 border border-gray-800/50">
            <DetailsEditor
              details={formData.content.details}
              onChange={handleDetailsChange}
              disabled={loading}
            />
          </div>
          {errors.details && <p className="text-sm text-red-400">{errors.details}</p>}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-600/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Entry' : 'Create Entry'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-8 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 focus:outline-none transition-all disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
