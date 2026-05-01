'use client';

import { useState, useEffect } from 'react';
import { Entity, EntityType, CreateEntityRequest, UpdateEntityRequest, EntityMetadata, EntityComponent } from '@/app/types/entity';
import EntityTypeSelector from './EntityTypeSelector';
import TagInput from './TagInput';
import ComponentDispatcher from './metadata/ComponentDispatcher';

interface EntityFormProps {
  entity?: Entity;
  onSubmit: (data: CreateEntityRequest | UpdateEntityRequest) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function EntityForm({ entity, onSubmit, onCancel, loading = false, error }: EntityFormProps) {
  const isEditMode = !!entity;

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
    summary: entity?.summary || '',
    description: entity?.description || '',
    tags: entity?.tags || [],
    metadata: normalizeMetadata(entity?.metadata),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to ensure an archetype has its required components
  useEffect(() => {
    if (isEditMode) return;

    const archetype = formData.type;
    let requiredType = '';
    if (archetype === EntityType.CHARACTER) requiredType = 'BIO';
    if (archetype === EntityType.LOCATION) requiredType = 'LOCATION';
    if (archetype === EntityType.ITEM) requiredType = 'ITEM';

    // When type changes, we replace the components with the default for that archetype
    const newComponents: EntityComponent[] = [];
    if (requiredType) {
      newComponents.push({ type: requiredType, data: {} });
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

  const removeComponent = (type: string) => {
    setFormData(prev => {
      const metadata = normalizeMetadata(prev.metadata);
      return {
        ...prev,
        metadata: {
          ...metadata,
          components: metadata.components.filter(c => c.type !== type)
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
      if (formData.summary !== entity.summary) updateData.summary = formData.summary;
      if (formData.description !== entity.description) updateData.description = formData.description;
      if (JSON.stringify(formData.tags) !== JSON.stringify(entity.tags)) updateData.tags = formData.tags;
      if (JSON.stringify(formData.metadata) !== JSON.stringify(entity.metadata)) updateData.metadata = formData.metadata;
      
      onSubmit(updateData);
    } else {
      onSubmit(formData as CreateEntityRequest);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Entity Type Selector */}
        <EntityTypeSelector
          value={formData.type}
          onChange={(type) => setFormData({ ...formData, type })}
          disabled={isEditMode}
          label={isEditMode ? 'Entity Type (cannot be changed)' : 'Entity Type'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Basic Information
            </h3>
            
            {/* Name */}
            <div>
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

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-300 mb-2">
                Summary
              </label>
              <input
                type="text"
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className={`w-full px-4 py-2 bg-gray-800/50 border ${
                  errors.summary ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                placeholder="Brief summary (optional)"
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

          {/* Metadata Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">category</span>
              Typed Metadata
            </h3>
            
            {formData.metadata.components.length === 0 && (
              <div className="p-8 text-center bg-gray-900/20 border border-dashed border-gray-800 rounded-xl">
                <p className="text-sm text-gray-500 italic">No components added yet.</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.metadata.components.map((component, idx) => {
                const isCustom = component.type === 'CUSTOM';
                return (
                  <div key={`${component.type}-${idx}`} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isCustom ? 'text-blue-400' : 'text-purple-400'}`}>
                        {component.type} Component
                      </span>
                      {isCustom && !loading && (
                        <button
                          type="button"
                          onClick={() => removeComponent('CUSTOM')}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                    <ComponentDispatcher
                      component={component}
                      onChange={(data) => updateComponentData(component.type, data)}
                      disabled={loading}
                    />
                  </div>
                );
              })}

              {/* Add Custom Fields Button (only if not already there) */}
              {!formData.metadata.components.find(c => c.type === 'CUSTOM') && (
                <button
                  type="button"
                  onClick={() => updateComponentData('CUSTOM', {})}
                  className="w-full py-3 border border-dashed border-gray-700 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Custom Fields
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Description - Full Width */}
        <div className="pt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">notes</span>
            Detailed Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
            placeholder="Detailed description (optional)"
            disabled={loading}
          />
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
