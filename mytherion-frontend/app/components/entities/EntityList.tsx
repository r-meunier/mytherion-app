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
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all whitespace-nowrap"
          >
            + Create Entity
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-300">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Entity Type</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTypeFilter(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  !filters.type
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-gray-500'
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
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-gray-500'
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
        <div className="p-4 bg-red-600/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && entities.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && entities.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {hasActiveFilters ? 'No entities found' : 'No entities yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your filters or search terms'
              : 'Create your first entity to get started'}
          </p>
          {!hasActiveFilters && onCreateClick && (
            <button
              onClick={onCreateClick}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              + Create Entity
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
            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Showing {pagination.page * pagination.size + 1} to{' '}
                {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
                {pagination.totalElements} entities
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Delete Entity?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this entity? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
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
