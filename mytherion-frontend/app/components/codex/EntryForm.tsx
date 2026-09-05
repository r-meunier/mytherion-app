'use client';

import { useState, useEffect, useRef } from 'react';
import { CodexEntry, EntryType, CreateEntryRequest, UpdateEntryRequest, EntryContent, EntrySection, SectionType } from '@/app/types/codex';
import { mediaService } from '@/app/services/mediaService';
import EntryTypeSelector from './EntryTypeSelector';
import TagInput from './TagInput';
import EntrySectionsEditor from './sections/EntrySectionsEditor';
import SectionDispatcher from './sections/SectionDispatcher';

interface EntityFormProps {
  entry?: CodexEntry;
  projectId: string;
  defaultType?: EntryType;
  isOpen?: boolean; // New prop to track visibility
  onSubmit: (data: CreateEntryRequest | UpdateEntryRequest, imageFile?: File | null) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function EntryForm({ entry, projectId, defaultType, isOpen, onSubmit, onCancel, loading = false, error }: EntityFormProps) {
  const isEditMode = !!entry;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(mediaService.getThumbnailUrl(entry?.thumbnail));

  // Sync internal state when entry prop changes
  useEffect(() => {
    if (entry) {
      setFormData({
        type: entry.type,
        name: entry.name,
        description: entry.description || '',
        notes: entry.notes || '',
        tags: entry.tags || [],
        content: normalizeMetadata(entry.content),
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

  // Helper to normalize content (handles legacy strings or nulls)
  const normalizeMetadata = (meta: any): EntryContent => {
    if (!meta) return { sections: [] };
    if (typeof meta === 'string') {
      try {
        const parsed = JSON.parse(meta);
        if (parsed && Array.isArray(parsed.sections)) return parsed;
      } catch (e) { /* ignore parse error */ }
      return { sections: [] };
    }
    if (meta && typeof meta === 'object' && Array.isArray(meta.sections)) return meta;
    return { sections: [] };
  };

  const [formData, setFormData] = useState({
    type: entry?.type || defaultType || EntryType.CHARACTER,
    name: entry?.name || '',
    description: entry?.description || '',
    notes: entry?.notes || '',
    tags: entry?.tags || [],
    content: normalizeMetadata(entry?.content),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Helper to ensure an archetype has its required sections
  useEffect(() => {
    if (isEditMode) return;

    const archetype = formData.type;
    const newComponents: EntrySection[] = [];
    
    // Add default sections based on type
    if (archetype === EntryType.CHARACTER) {
      newComponents.push({ id: SectionType.BIO, type: SectionType.BIO, data: {} as any });
      newComponents.push({ id: SectionType.APPEARANCE, type: SectionType.APPEARANCE, data: {} as any });
      newComponents.push({ id: SectionType.PSYCHOLOGY, type: SectionType.PSYCHOLOGY, data: {} as any });
      newComponents.push({ id: SectionType.SOCIAL, type: SectionType.SOCIAL, data: {} as any });
      newComponents.push({ id: SectionType.HISTORY, type: SectionType.HISTORY, data: {} as any });
    } else if (archetype === EntryType.LOCATION) {
      newComponents.push({ id: SectionType.LOCATION_DETAILS, type: SectionType.LOCATION_DETAILS, data: {} as any });
      newComponents.push({ id: SectionType.LOCATION_RELATIONS, type: SectionType.LOCATION_RELATIONS, data: {} as any });
    } else if (archetype === EntryType.ORGANIZATION) {
      newComponents.push({ id: SectionType.ORGANIZATION_DETAILS, type: SectionType.ORGANIZATION_DETAILS, data: {} as any });
      newComponents.push({ id: SectionType.ORGANIZATION_RELATIONS, type: SectionType.ORGANIZATION_RELATIONS, data: {} as any });
    } else if (archetype === EntryType.CULTURE) {
      newComponents.push({ id: SectionType.CULTURE_DETAILS, type: SectionType.CULTURE_DETAILS, data: {} as any });
      newComponents.push({ id: SectionType.CULTURE_RELATIONS, type: SectionType.CULTURE_RELATIONS, data: {} as any });
    } else if (archetype === EntryType.SPECIES) {
      newComponents.push({ id: SectionType.SPECIES_DETAILS, type: SectionType.SPECIES_DETAILS, data: {} as any });
      newComponents.push({ id: SectionType.SPECIES_RELATIONS, type: SectionType.SPECIES_RELATIONS, data: {} as any });
    } else if (archetype === EntryType.ITEM) {
      newComponents.push({ id: SectionType.ITEM_DETAILS, type: SectionType.ITEM_DETAILS, data: {} as any });
      newComponents.push({ id: SectionType.ITEM_RELATIONS, type: SectionType.ITEM_RELATIONS, data: {} as any });
    }
    
    setFormData(prev => {
      // Only update if the type actually changed or if sections are missing
      if (prev.content.sections.length > 0 && prev.type === archetype) {
        return prev;
      }

      return {
        ...prev,
        content: {
          ...prev.content,
          sections: newComponents
        }
      };
    });
  }, [formData.type, isEditMode]);

  const updateComponentData = (type: string, data: Record<string, any>) => {
    setFormData(prev => {
      // Ensure we have a valid content structure to work with
      const currentMetadata = prev.content || { sections: [] };
      const currentComponents = Array.isArray(currentMetadata.sections) 
        ? [...currentMetadata.sections] 
        : [];
      
      const index = currentComponents.findIndex(c => c.type === type);
      
      if (index >= 0) {
        // Deep merge data to prevent field loss within a component
        currentComponents[index] = { 
          ...currentComponents[index], 
          data: { ...(currentComponents[index].data || {}), ...data } 
        } as any;
      } else {
        // Add new component if it doesn't exist
        currentComponents.push({ 
          id: type, // Use type as a fallback ID for new sections
          type: type as any, 
          data 
        });
      }

      return {
        ...prev,
        content: { 
          ...currentMetadata, 
          sections: currentComponents 
        }
      };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (isEditMode) {
      const updateData: UpdateEntryRequest = { version: entry.version };
      if (formData.name !== entry.name) updateData.name = formData.name;
      if (formData.description !== entry.description) updateData.description = formData.description;
      if (formData.notes !== entry.notes) updateData.notes = formData.notes;
      if (JSON.stringify(formData.tags) !== JSON.stringify(entry.tags)) updateData.tags = formData.tags;
      if (JSON.stringify(formData.content) !== JSON.stringify(entry.content)) updateData.content = formData.content;
      
      onSubmit(updateData, imageFile);
    } else {
      onSubmit(formData as CreateEntryRequest, imageFile);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fields? This will lose all unsaved progress on this draft.')) {
      setFormData({
        type: entry?.type || defaultType || EntryType.CHARACTER,
        name: '',
        description: '',
        notes: '',
        tags: [],
        content: { sections: [] },
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
            onChange={(type) => setFormData(prev => ({ ...prev, type }))}
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
                      JPEG, PNG, GIF, WebP (Max 5MB)
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

        {/* Semantic Components Section - Full Width */}
        <div className="pt-8 space-y-6">
          <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-purple-500 text-3xl">psychology</span>
            Semantic Data Modules
          </h3>
          
          <div className="bg-gray-900/40 rounded-2xl p-2 border border-gray-800/50">
            <EntrySectionsEditor 
              entityType={formData.type}
              content={formData.content}
              onUpdateComponent={updateComponentData}
              disabled={loading}
            />
          </div>
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
