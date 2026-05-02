'use client';

import { useState, useEffect } from 'react';
import { Entity, EntityType, CreateEntityRequest, UpdateEntityRequest, EntityMetadata, EntityComponent, ComponentType } from '@/app/types/entity';
import EntityTypeSelector from './EntityTypeSelector';
import TagInput from './TagInput';
import EntityMetadataEditor from './metadata/EntityMetadataEditor';
import ComponentDispatcher from './metadata/ComponentDispatcher';

interface EntityFormProps {
  entity?: Entity;
  isOpen?: boolean; // New prop to track visibility
  onSubmit: (data: CreateEntityRequest | UpdateEntityRequest) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function EntityForm({ entity, isOpen, onSubmit, onCancel, loading = false, error }: EntityFormProps) {
  const isEditMode = !!entity;

  // Sync internal state when entity prop changes
  useEffect(() => {
    if (entity) {
      setFormData({
        type: entity.type,
        name: entity.name,
        category: entity.category || '',
        summary: entity.summary || '',
        description: entity.description || '',
        notes: entity.notes || '',
        tags: entity.tags || [],
        metadata: normalizeMetadata(entity.metadata),
      });
    } else {
      // Reset to defaults for new entity
      setFormData({
        type: EntityType.CHARACTER,
        name: '',
        category: '',
        summary: '',
        description: '',
        notes: '',
        tags: [],
        metadata: { components: [] },
      });
    }
  }, [entity]);

  // Clear internal errors when modal reopens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  // Helper to normalize metadata (handles legacy strings or nulls)
  const normalizeMetadata = (meta: any): EntityMetadata => {
    if (!meta) return { components: [] };
    if (typeof meta === 'string') {
      try {
        const parsed = JSON.parse(meta);
        if (parsed && Array.isArray(parsed.components)) return parsed;
      } catch (e) { /* ignore parse error */ }
      return { components: [] };
    }
    if (meta && typeof meta === 'object' && Array.isArray(meta.components)) return meta;
    return { components: [] };
  };

  const [formData, setFormData] = useState({
    type: entity?.type || EntityType.CHARACTER,
    name: entity?.name || '',
    category: entity?.category || '',
    summary: entity?.summary || '',
    description: entity?.description || '',
    notes: entity?.notes || '',
    tags: entity?.tags || [],
    metadata: normalizeMetadata(entity?.metadata),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to ensure an archetype has its required components
  useEffect(() => {
    if (isEditMode) return;

    const archetype = formData.type;
    const newComponents: EntityComponent[] = [];
    
    // Add default components based on type
    if (archetype === EntityType.CHARACTER) {
      newComponents.push({ id: ComponentType.BIO, type: ComponentType.BIO, data: {} as any });
      newComponents.push({ id: ComponentType.APPEARANCE, type: ComponentType.APPEARANCE, data: {} as any });
      newComponents.push({ id: ComponentType.PSYCHOLOGY, type: ComponentType.PSYCHOLOGY, data: {} as any });
      newComponents.push({ id: ComponentType.SOCIAL, type: ComponentType.SOCIAL, data: {} as any });
      newComponents.push({ id: ComponentType.HISTORY, type: ComponentType.HISTORY, data: {} as any });
    } else if (archetype === EntityType.LOCATION) {
      newComponents.push({ id: ComponentType.LOCATION, type: ComponentType.LOCATION, data: {} as any });
      newComponents.push({ id: ComponentType.LOCATION_RELATIONS, type: ComponentType.LOCATION_RELATIONS, data: {} as any });
    } else if (archetype === EntityType.ORGANIZATION) {
      newComponents.push({ id: ComponentType.ORGANIZATION, type: ComponentType.ORGANIZATION, data: {} as any });
      newComponents.push({ id: ComponentType.ORG_RELATIONS, type: ComponentType.ORG_RELATIONS, data: {} as any });
    } else if (archetype === EntityType.CULTURE) {
      newComponents.push({ id: ComponentType.CULTURE, type: ComponentType.CULTURE, data: {} as any });
      newComponents.push({ id: ComponentType.CULTURE_RELATIONS, type: ComponentType.CULTURE_RELATIONS, data: {} as any });
    } else if (archetype === EntityType.SPECIES) {
      newComponents.push({ id: ComponentType.SPECIES, type: ComponentType.SPECIES, data: {} as any });
      newComponents.push({ id: ComponentType.SPECIES_RELATIONS, type: ComponentType.SPECIES_RELATIONS, data: {} as any });
    } else if (archetype === EntityType.ITEM) {
      newComponents.push({ id: ComponentType.ITEM, type: ComponentType.ITEM, data: {} as any });
      newComponents.push({ id: ComponentType.ITEM_RELATIONS, type: ComponentType.ITEM_RELATIONS, data: {} as any });
    }
    
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        components: newComponents
      }
    }));
  }, [formData.type, isEditMode]);

  const updateComponentData = (type: string, data: Record<string, any>) => {
    setFormData(prev => {
      const metadata = normalizeMetadata(prev.metadata);
      const components = [...metadata.components];
      const index = components.findIndex(c => c.type === type);
      
      if (index >= 0) {
        components[index] = { ...components[index], data };
      } else {
        components.push({ type, data });
      }

      return {
        ...prev,
        metadata: { ...prev.metadata, components }
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

    if (formData.summary && formData.summary.length > 1000) {
      newErrors.summary = 'Summary must be 1000 characters or less';
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
      const updateData: UpdateEntityRequest = {};
      if (formData.name !== entity.name) updateData.name = formData.name;
      if (formData.category !== entity.category) updateData.category = formData.category;
      if (formData.summary !== entity.summary) updateData.summary = formData.summary;
      if (formData.description !== entity.description) updateData.description = formData.description;
      if (formData.notes !== entity.notes) updateData.notes = formData.notes;
      if (JSON.stringify(formData.tags) !== JSON.stringify(entity.tags)) updateData.tags = formData.tags;
      if (JSON.stringify(formData.metadata) !== JSON.stringify(entity.metadata)) updateData.metadata = formData.metadata;
      
      onSubmit(updateData);
    } else {
      onSubmit(formData as CreateEntityRequest);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fields? This will lose all unsaved progress on this draft.')) {
      setFormData({
        type: entity?.type || EntityType.CHARACTER,
        name: '',
        category: '',
        summary: '',
        description: '',
        notes: '',
        tags: [],
        metadata: { components: [] },
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      <div className="space-y-6">
        {/* ... existing header ... */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <EntityTypeSelector
            value={formData.type}
            onChange={(type) => setFormData({ ...formData, type })}
            disabled={isEditMode}
            label={isEditMode ? 'Entity Type (cannot be changed)' : 'Entity Type'}
          />
          {!isEditMode && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 text-xs font-bold text-amber-500/60 hover:text-amber-500 border border-amber-500/20 hover:border-amber-500/50 rounded-lg transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Clear Form
            </button>
          )}
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 bg-gray-800/50 border ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                  placeholder="Enter entity name"
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              {/* Category */}
              <div className="md:col-span-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="e.g. Protagonist, Kingdom"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-300 mb-2">
                Short Summary
              </label>
              <input
                type="text"
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className={`w-full px-4 py-2 bg-gray-800/50 border ${
                  errors.summary ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                placeholder="Brief one-liner summary"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.summary.length}/1000
              </p>
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            <EntityMetadataEditor 
              entityType={formData.type}
              metadata={formData.metadata}
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
          {loading ? 'Saving...' : isEditMode ? 'Update Entity' : 'Create Entity'}
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
