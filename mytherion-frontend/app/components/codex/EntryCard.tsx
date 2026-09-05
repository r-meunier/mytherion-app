'use client';

import { CodexEntry } from '@/app/types/codex';
import { entityTypeConfig } from './EntryTypeSelector';
import { useRouter } from 'next/navigation';
import { useIsMounted } from '@/app/hooks/useIsMounted';
import { mediaService } from '@/app/services/mediaService';
import routes from '@/app/config/routes';
import { formatRelativeTime } from '@/app/utils/dateUtils';

interface EntityCardProps {
  entry: CodexEntry;
  onEdit?: (entry: CodexEntry) => void;
  onDelete?: (entry: CodexEntry) => void;
}

export default function EntryCard({ entry, onEdit, onDelete }: EntityCardProps) {
  const router = useRouter();
  const isMounted = useIsMounted();
  const typeConfig = entityTypeConfig[entry.type];

  const handleCardClick = () => {
    router.push(routes.project(entry.projectId).codex.detail(entry.id));
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(entry);
    } else {
      router.push(routes.project(entry.projectId).codex.edit(entry.id));
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative glass-panel rounded-2xl p-5 hover:border-primary/40 transition-all duration-300 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between"
    >
      <div>
        {/* Type Badge & Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeConfig.icon}</span>
            <span className={`text-xs font-semibold ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              title="Edit"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                title="Delete"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* CodexEntry Image (if present, no fallback/placeholder per specifications) */}
        {entry.thumbnail && (
          <div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden bg-black/40 border border-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaService.getThumbnailUrl(entry.thumbnail) || ''}
              alt={entry.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {/* CodexEntry Name */}
        <h3 className="text-lg font-bold text-white mb-1.5 line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {entry.name}
        </h3>

        {/* Description */}
        {entry.description && (
          <p className="text-white/50 text-xs leading-relaxed mb-3 line-clamp-2 font-medium">
            {entry.description}
          </p>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold border border-primary/20 uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/40 border border-white/10">
                +{entry.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-[11px] font-medium text-white/40 mt-3 pt-3 border-t border-white/5">
        Created {isMounted ? formatRelativeTime(entry.createdAt) : '...'}
      </div>
    </div>
  );
}
