'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchEntities, setFilters, deleteEntity } from '@/app/store/entitySlice';
import { EntityType } from '@/app/types/entity';
import EntityCard from './EntityCard';
import SearchBar from './SearchBar';
import EntityTypeSelector from './EntityTypeSelector';

interface EntityListProps {
  projectId: number;
  onCreateClick?: () => void;
}

export default function EntityList({ projectId, onCreateClick }: EntityListProps) {
  const dispatch = useAppDispatch();
  const { entities, loading, error, filters, pagination } = useAppSelector((state) => state.entities);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchEntities({ projectId, filters, page: pagination.page, size: pagination.size }));
  }, [dispatch, projectId, filters, pagination.page, pagination.size]);

  const handleSearchChange = (search: string) => {
    dispatch(setFilters({ ...filters, search }));
  };

  const handleTypeFilter = (type: EntityType | undefined) => {
    dispatch(setFilters({ ...filters, type }));
  };

  const handleClearFilters = () => {
    dispatch(setFilters({ type: undefined, tags: [], search: '' }));
  };

  const handleDelete = async (entityId: number) => {
    await dispatch(deleteEntity(entityId));
    setShowDeleteConfirm(null);
    // Refresh list
    dispatch(fetchEntities({ projectId, filters, page: pagination.page, size: pagination.size }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchEntities({ projectId, filters, page: newPage, size: pagination.size }));
  };

  const hasActiveFilters = filters.type || filters.search || (filters.tags && filters.tags.length > 0);

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:max-w-md">
          <SearchBar value={filters.search || ''} onChange={handleSearchChange} />
        </div>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all whitespace-nowrap flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add_box</span>
            <span>Create Entity</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Entity Type</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTypeFilter(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  !filters.type
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'glass text-slate-400 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {Object.values(EntityType).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filters.type === type
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'glass text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 glass border border-red-500/50 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && entities.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 animate-pulse"
            >
              <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-700/50 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && entities.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[64px] text-slate-500 mb-4 block">inbox</span>
          <h3 className="text-xl font-display font-semibold text-white mb-2">
            {hasActiveFilters ? 'No entities found' : 'No entities yet'}
          </h3>
          <p className="text-slate-400 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your filters or search terms'
              : 'Create your first entity to get started'}
          </p>
          {!hasActiveFilters && onCreateClick && (
            <button
              onClick={onCreateClick}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add_box</span>
              <span>Create Entity</span>
            </button>
          )}
        </div>
      )}

      {/* Entity Grid */}
      {!loading && entities.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                onDelete={(entity) => setShowDeleteConfirm(entity.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <p className="text-sm text-slate-400">
                Showing {pagination.page * pagination.size + 1} to{' '}
                {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
                {pagination.totalElements} entities
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="px-4 py-2 glass text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="px-4 py-2 glass text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary text-[32px]">warning</span>
              <div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Delete Entity?</h3>
                <p className="text-slate-400">
                  Are you sure you want to delete this entity? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-600/20 transition-all font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 glass text-white rounded-lg hover:bg-white/10 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
