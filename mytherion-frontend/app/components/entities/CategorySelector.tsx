'use client';

import { useState, useEffect, useRef } from 'react';
import { Category } from '@/app/types/category';
import { categoryService } from '@/app/services/categoryService';

interface CategorySelectorProps {
  projectId: number;
  value?: number;
  onChange: (categoryId?: number) => void;
  disabled?: boolean;
}

export default function CategorySelector({ projectId, value, onChange, disabled = false }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories(projectId);
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setIsCreating(true);
      const created = await categoryService.createCategory(projectId, { name: newCategoryName.trim() });
      setCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(created.id);
      setNewCategoryName('');
      setShowDropdown(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === value);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className={`w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white flex justify-between items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600 focus:ring-2 focus:ring-purple-500'}`}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
      >
        <span className={selectedCategory ? "text-white" : "text-gray-400"}>
          {loading ? 'Loading...' : (selectedCategory?.name || 'Select Category...')}
        </span>
        <span className="material-symbols-outlined text-gray-400">
          arrow_drop_down
        </span>
      </div>

      {showDropdown && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-3 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
              <button
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryName.trim()}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-sm text-white font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>
          <div className="overflow-y-auto">
            <div
              className={`px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-400 italic ${!value ? 'bg-gray-700/50' : ''}`}
              onClick={() => {
                onChange(undefined);
                setShowDropdown(false);
              }}
            >
              None
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                className={`px-4 py-2 hover:bg-gray-700 cursor-pointer text-white ${value === category.id ? 'bg-purple-900/30 text-purple-300' : ''}`}
                onClick={() => {
                  onChange(category.id);
                  setShowDropdown(false);
                }}
              >
                {category.name}
              </div>
            ))}
            {categories.length === 0 && !loading && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No categories found. Create one above!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
