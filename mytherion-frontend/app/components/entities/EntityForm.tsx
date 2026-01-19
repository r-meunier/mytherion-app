'use client';

import { useState, useEffect } from 'react';
import { Entity, EntityType, CreateEntityRequest, UpdateEntityRequest } from '@/app/types/entity';
import EntityTypeSelector from './EntityTypeSelector';
import TagInput from './TagInput';

interface EntityFormProps {
  entity?: Entity;
  onSubmit: (data: CreateEntityRequest | UpdateEntityRequest) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function EntityForm({ entity, onSubmit, onCancel, loading = false, error }: EntityFormProps) {
  const isEditMode = !!entity;

  const [formData, setFormData] = useState({
    type: entity?.type || EntityType.CHARACTER,
    name: entity?.name || '',
    summary: entity?.summary || '',
    description: entity?.description || '',
    tags: entity?.tags || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // For edit mode, only send changed fields
      const updateData: UpdateEntityRequest = {};
      if (formData.name !== entity.name) updateData.name = formData.name;
      if (formData.summary !== entity.summary) updateData.summary = formData.summary;
      if (formData.description !== entity.description) updateData.description = formData.description;
      if (JSON.stringify(formData.tags) !== JSON.stringify(entity.tags)) updateData.tags = formData.tags;
      
      onSubmit(updateData);
    } else {
      // For create mode, send all fields
      onSubmit(formData as CreateEntityRequest);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Entity Type Selector */}
      <EntityTypeSelector
        value={formData.type}
        onChange={(type) => setFormData({ ...formData, type })}
        disabled={isEditMode}
        label={isEditMode ? 'Entity Type (cannot be changed)' : 'Entity Type'}
      />

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
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
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
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          placeholder="Brief summary (optional)"
          disabled={loading}
        />
        {errors.summary && <p className="mt-1 text-sm text-red-400">{errors.summary}</p>}
        <p className="mt-1 text-xs text-gray-400">
          {formData.summary.length}/1000 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          placeholder="Detailed description (optional)"
          disabled={loading}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
        <TagInput
          tags={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-600/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Entity' : 'Create Entity'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
