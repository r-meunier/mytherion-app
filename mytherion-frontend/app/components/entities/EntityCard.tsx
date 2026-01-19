'use client';

import { Entity } from '@/app/types/entity';
import { entityTypeConfig } from './EntityTypeSelector';
import { useRouter } from 'next/navigation';

interface EntityCardProps {
  entity: Entity;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
}

export default function EntityCard({ entity, onEdit, onDelete }: EntityCardProps) {
  const router = useRouter();
  const typeConfig = entityTypeConfig[entity.type];

  const handleCardClick = () => {
    router.push(`/projects/${entity.projectId}/entities/${entity.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(entity);
    } else {
      router.push(`/projects/${entity.projectId}/entities/${entity.id}/edit`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entity);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
    >
      {/* Type Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeConfig.icon}</span>
          <span className={`text-xs font-medium ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
              title="Delete"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Entity Name */}
      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
        {entity.name}
      </h3>

      {/* Summary */}
      {entity.summary && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {entity.summary}
        </p>
      )}

      {/* Tags */}
      {entity.tags && entity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entity.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded text-xs border border-purple-500/30"
            >
              {tag}
            </span>
          ))}
          {entity.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded text-xs">
              +{entity.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700/50">
        Created {new Date(entity.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
