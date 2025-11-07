import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Tag, BookOpen, Search, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { faqService, categoryService } from '../services/api';
import type { FAQ, Category } from '../types';
import HighlightedText from '../components/HighlightedText';
import { getSearchSnippet, stripHtml } from '../utils/searchUtils';
import 'highlight.js/styles/github.css';

const SimpleFAQList: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [searchFilters, setSearchFilters] = useState<any>({
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

  // Use JSON.stringify to create a stable dependency string
  const searchFiltersDeps = useMemo(() => JSON.stringify({
    searchTerm: searchFilters.searchTerm,
    category: searchFilters.category,
    tags: searchFilters.tags,
    dateRange: searchFilters.dateRange,
    createdBy: searchFilters.createdBy,
    hasAttachments: searchFilters.hasAttachments,
    minRating: searchFilters.minRating,
    sortBy: searchFilters.sortBy,
    sortOrder: searchFilters.sortOrder
  }), [searchFilters]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Only call search if not initial load (to avoid duplicate calls)
    if (!loading) {
      // Debounce search to avoid too frequent API calls
      const timeoutId = setTimeout(() => {
        filterAndSearchFAQs();
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchFiltersDeps]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [faqsResponse, categoriesData] = await Promise.all([
        faqService.getFAQs(),
        categoryService.getCategories()
      ]);
      setFaqs(faqsResponse.data);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchFAQs = useCallback(async () => {
    // Skip search during initial load
    if (loading) return;
    
    try {
      setLoading(true);
      const params: any = {};

      // Build API parameters from search filters
      if (searchFilters.searchTerm?.trim()) {
        params.search = searchFilters.searchTerm;
      }

      if (searchFilters.category && searchFilters.category !== 'all') {
        params.category = searchFilters.category;
      }

      if (searchFilters.tags && searchFilters.tags.length > 0) {
        params.tags = searchFilters.tags.join(',');
      }

      if (searchFilters.dateRange?.from) {
        params.date_from = searchFilters.dateRange.from;
      }

      if (searchFilters.dateRange?.to) {
        params.date_to = searchFilters.dateRange.to;
      }

      if (searchFilters.createdBy?.trim()) {
        params.created_by = searchFilters.createdBy;
      }

      if (searchFilters.hasAttachments) {
        params.has_attachments = true;
      }

      if (searchFilters.minRating > 0) {
        params.min_rating = searchFilters.minRating;
      }

      // Sort parameters
      if (searchFilters.sortBy && searchFilters.sortBy !== 'relevance') {
        params.sort_by = searchFilters.sortBy;
        params.sort_order = searchFilters.sortOrder || 'desc';
      }

      const response = await faqService.getFAQs(params);
      setFaqs(response.data); // Use response.data from PaginatedResponse
    } catch (error) {
      console.error('Error filtering FAQs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchFiltersDeps, loading]);

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.icon || 'fas fa-question-circle';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#2563eb';
  };

  if (loading && faqs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Nodeflux FAQ Center
          </h1>
          <p className="text-gray-600 mb-8">
            Pusat Bantuan & Troubleshooting Produk VisionAI
          </p>
          
          {/* Simple Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari jawaban untuk pertanyaan Anda..."
              value={searchFilters.searchTerm}
              onChange={(e) => setSearchFilters((prev: any) => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchFilters.searchTerm && (
              <button
                onClick={() => setSearchFilters((prev: any) => ({ ...prev, searchTerm: '' }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <ChevronUp className="w-5 h-5 rotate-45" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Simple Category Filter */}
      {!searchFilters.searchTerm && (
        <section className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSearchFilters((prev: any) => ({ ...prev, category: 'all' }))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                searchFilters.category === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSearchFilters((prev: any) => ({ ...prev, category: category.name }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  searchFilters.category === category.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className={`${category.icon} text-xs`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </section>
      )}


      {/* FAQ List */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{faqs.length}</div>
            <div className="text-sm text-gray-600">Total FAQ</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Kategori</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {faqs.filter(faq => faq.attachments && faq.attachments.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Dengan Lampiran</div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {searchFilters.searchTerm ? `Hasil Pencarian (${faqs.length})` : `Pertanyaan Umum (${faqs.length})`}
          </h2>
          <p className="text-sm text-gray-600">
            {searchFilters.searchTerm 
              ? `Ditemukan ${faqs.length} hasil untuk "${searchFilters.searchTerm}"`
              : 'Jelajahi koleksi FAQ kami'
            }
          </p>
        </div>

        {faqs.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {searchFilters.searchTerm ? 'Tidak ada hasil' : 'Belum ada FAQ'}
            </h3>
            <p className="text-gray-500">
              {searchFilters.searchTerm
                ? 'Coba kata kunci lain atau filter yang berbeda'
                : 'FAQ akan segera tersedia'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
              >
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg flex-shrink-0">
                        <i 
                          className={`${getCategoryIcon(faq.category)} text-sm text-blue-600`}
                        ></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">
                          <HighlightedText
                            text={faq.question}
                            searchTerm={searchFilters.searchTerm || ''}
                            className="text-gray-900"
                          />
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {faq.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(faq.created_at).toLocaleDateString('id-ID')}
                          </span>
                          {faq.attachments && faq.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {faq.attachments.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedItems.has(faq.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Search Snippet */}
                  {searchFilters.searchTerm && !expandedItems.has(faq.id) && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      <HighlightedText
                        text={getSearchSnippet(stripHtml(faq.answer), searchFilters.searchTerm, 150)}
                        searchTerm={searchFilters.searchTerm}
                        className="text-gray-600"
                      />
                    </p>
                  )}

                  {/* Tags Preview */}
                  {faq.tags.length > 0 && !expandedItems.has(faq.id) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {faq.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {faq.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{faq.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Expanded Content */}
                {expandedItems.has(faq.id) && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {faq.answer}
                      </ReactMarkdown>
                    </div>

                    {/* Attachments */}
                    {faq.attachments && faq.attachments.length > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{faq.attachments.length} lampiran</span>
                      </div>
                    )}

                    {/* All Tags */}
                    {faq.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {faq.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded border border-blue-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Simple Contact Section */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Masih Butuh Bantuan?</h2>
          <p className="text-gray-600 mb-6">
            Tim support Nodeflux siap membantu Anda 24/7 untuk semua masalah teknis
          </p>
          <a
            href="mailto:support@nodeflux.io"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hubungi Support
          </a>
        </div>
      </section>
    </div>
  );
};

export default SimpleFAQList;
