import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Calendar,
  Tag,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { categoryService } from '../services/api';
import type { Category } from '../types';

interface SearchFilters {
  searchTerm: string;
  category: string;
  tags: string[];
  dateRange: {
    from: string;
    to: string;
  };
  createdBy: string;
  hasAttachments: boolean;
  minRating: number;
  sortBy: 'relevance' | 'newest' | 'oldest' | 'rating' | 'views';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  isLoading?: boolean;
  resultCount?: number;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onFiltersChange,
  initialFilters = {},
  isLoading = false,
  resultCount = 0
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    tags: [],
    dateRange: {
      from: '',
      to: ''
    },
    createdBy: '',
    hasAttachments: false,
    minRating: 0,
    sortBy: 'relevance',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const notifyFiltersChange = useCallback(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  useEffect(() => {
    // Count active filters (excluding search term and default values)
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.createdBy) count++;
    if (filters.hasAttachments) count++;
    if (filters.minRating > 0) count++;
    if (filters.sortBy !== 'relevance') count++;

    setActiveFiltersCount(count);
  }, [filters]);

  // Notify parent when filters change with proper dependency management
  useEffect(() => {
    notifyFiltersChange();
  }, [notifyFiltersChange]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateDateRange = (field: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFilter('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'all',
      tags: [],
      dateRange: { from: '', to: '' },
      createdBy: '',
      hasAttachments: false,
      minRating: 0,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setTagInput('');
  };

  const clearSearch = () => {
    updateFilter('searchTerm', '');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Main Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="faq-search-input"
              name="faqSearch"
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {filters.searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showAdvanced || activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {activeFiltersCount}
              </span>
            )}
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Search Results Info */}
        {(filters.searchTerm || activeFiltersCount > 0) && (
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              {isLoading ? (
                <span>Searching...</span>
              ) : (
                <span>Found {resultCount} result{resultCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <RotateCcw className="h-3 w-3" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <select
                id="faq-category-filter"
                name="faqCategory"
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  id="faq-tag-input"
                  name="faqTag"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {filters.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {filters.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Created By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Created By
              </label>
              <input
                id="faq-creator-input"
                name="faqCreator"
                type="text"
                value={filters.createdBy}
                onChange={(e) => updateFilter('createdBy', e.target.value)}
                placeholder="Username or email..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="faq-date-from"
                  name="faqDateFrom"
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateDateRange('from', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
                <input
                  id="faq-date-to"
                  name="faqDateTo"
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateDateRange('to', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Minimum Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Rating
              </label>
              <select
                id="faq-min-rating"
                name="faqMinRating"
                value={filters.minRating}
                onChange={(e) => updateFilter('minRating', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="0">Any Rating</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="faq-sort-by"
                  name="faqSortBy"
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating">Rating</option>
                  <option value="views">Views</option>
                </select>
                <select
                  id="faq-sort-order"
                  name="faqSortOrder"
                  value={filters.sortOrder}
                  onChange={(e) => updateFilter('sortOrder', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>

            {/* Has Attachments Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="faq-has-attachments"
                name="faqHasAttachments"
                checked={filters.hasAttachments}
                onChange={(e) => updateFilter('hasAttachments', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="faq-has-attachments" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                <FileText className="inline h-4 w-4 mr-1" />
                Has attachments only
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
