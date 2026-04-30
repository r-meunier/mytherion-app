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
      className="group relative glass rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10"
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
            className="p-1.5 rounded-lg glass hover:bg-primary hover:text-white transition-all"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg glass hover:bg-red-600 hover:text-white transition-all"
              title="Delete"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Entity Name */}
      <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-1">
        {entity.name}
      </h3>

      {/* Summary */}
      {entity.summary && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {entity.summary}
        </p>
      )}

      {/* Tags */}
      {entity.tags && entity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entity.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs border border-primary/30"
            >
              {tag}
            </span>
          ))}
          {entity.tags.length > 3 && (
            <span className="px-2 py-0.5 glass text-slate-400 rounded text-xs">
              +{entity.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-white/10">
        Created {new Date(entity.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

