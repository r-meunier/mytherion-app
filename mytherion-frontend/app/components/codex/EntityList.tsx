'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchEntities, setFilters, deleteEntity } from '@/app/store/entitySlice';
import { Entity, EntityType } from '@/app/types/entity';
import { categoryService } from '@/app/services/categoryService';
import { Category } from '@/app/types/category';
import EntityCard from './EntityCard';
import EntityFilters from './EntityFilters';
import PageHeader from '../ui/PageHeader';

interface EntityListProps {
  projectId: string;
  projectName?: string;
  onCreateClick?: () => void;
  onEditClick?: (entity: Entity) => void;
}

export default function EntityList({ projectId, projectName, onCreateClick, onEditClick }: EntityListProps) {
  const dispatch = useAppDispatch();
  const { entities, loading, error, filters, pagination } = useAppSelector((state) => state.entities);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [searchInput, setSearchInput] = useState(filters.search || '');
  
  const PAGE_SIZE = 20;
  const lastFetchedParams = useRef<string>('');

  // Fetch categories for the project
  useEffect(() => {
    let isMounted = true;
    categoryService.getCategories(projectId)
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch(() => {
        // Silently handle
      });
    return () => { isMounted = false; };
  }, [projectId]);

  // Debounce search input to avoid flashing and firing queries on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        dispatch(setFilters({ ...filters, search: searchInput }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, dispatch, filters]);

  // Sync search input if filters are reset externally
  useEffect(() => {
    if (filters.search !== undefined && filters.search !== searchInput) {
      setSearchInput(filters.search);
    }
  }, [filters.search]);

  // Handle escape key to dismiss delete modal
  useEffect(() => {
    if (!showDeleteConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDeleteConfirm(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm]);

  useEffect(() => {
    const fetchKey = JSON.stringify({
      projectId,
      type: filters.type,
      categoryId: filters.categoryId,
      search: filters.search,
      tags: filters.tags,
      page: currentPage,
    });
    
    if (lastFetchedParams.current !== fetchKey) {
      lastFetchedParams.current = fetchKey;
      
      dispatch(fetchEntities({ 
        projectId, 
        filters, 
        page: currentPage, 
        size: PAGE_SIZE
      }));
    }
  }, [dispatch, projectId, filters, currentPage]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(0);
  }, [filters.type, filters.categoryId, filters.search, filters.tags]);

  const handleSearchChange = (search: string) => {
    setSearchInput(search);
  };

  const handleTypeFilter = (type: EntityType | undefined) => {
    dispatch(setFilters({ ...filters, type }));
  };

  const handleCategoryFilter = (categoryId: string | undefined) => {
    dispatch(setFilters({ ...filters, categoryId }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    dispatch(setFilters({ type: undefined, categoryId: undefined, tags: [], search: '' }));
  };

  const handleDelete = async (entityId: string) => {
    await dispatch(deleteEntity({ projectId, id: entityId }));
    setShowDeleteConfirm(null);
    dispatch(fetchEntities({ projectId, filters, page: currentPage, size: PAGE_SIZE }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const hasActiveFilters = !!(filters.type || filters.categoryId || filters.search || (filters.tags && filters.tags.length > 0));

  const sortedEntities = [...entities].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-10">
      {/* Header & Glass Command Bar Section (Exact same alignment as Your Worlds) */}
      <PageHeader
        title="Entity Codex"
        subtitle={`Browse, search, and manage all entities in ${projectName || "this world"}.`}
      >
        {/* Unified Glass Command Bar locked to the right */}
        <EntityFilters
          search={searchInput}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedType={filters.type}
          onTypeChange={handleTypeFilter}
          categories={categories}
          selectedCategoryId={filters.categoryId}
          onCategoryChange={handleCategoryFilter}
          onCreateClick={onCreateClick}
        />
      </PageHeader>

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
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-700/50 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedEntities.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[64px] text-white/20 mb-4 block">inbox</span>
          <h3 className="text-xl font-display font-bold text-white mb-2">
            {hasActiveFilters ? 'No entities found' : 'No entities yet'}
          </h3>
          <p className="text-white/40 mb-6 text-sm">
            {hasActiveFilters
              ? 'Try adjusting your search or filter options'
              : 'Create your first entity to get started'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="inline-flex px-5 py-2 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            onCreateClick && (
              <button
                onClick={onCreateClick}
                className="bg-[#ddb7ff] text-[#2c0051] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#f0dbff] transition-all inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(221,183,255,0.4)] active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Create Entity</span>
              </button>
            )
          )}
        </div>
      )}

      {/* Entity Grid */}
      {sortedEntities.length > 0 && (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${loading ? "opacity-60" : "opacity-100"}`}>
            {sortedEntities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                onEdit={onEditClick}
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
                  className="px-4 py-2 glass text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="px-4 py-2 glass text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
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
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer animate-in fade-in duration-150"
          onClick={() => setShowDeleteConfirm(null)}
          data-testid="delete-modal-backdrop"
        >
          <div 
            className="glass rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20 cursor-default shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-600/20 transition-all font-semibold cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 glass text-white rounded-lg hover:bg-white/10 transition-all font-semibold cursor-pointer"
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
