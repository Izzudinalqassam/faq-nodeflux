import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Tag, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { faqService, categoryService } from '../services/api';
import type { FAQ, Category } from '../types';
import HighlightedText from '../components/HighlightedText';
import AdvancedSearch from '../components/AdvancedSearch';
import { getSearchSnippet, stripHtml } from '../utils/searchUtils';
import 'highlight.js/styles/github.css';

const FAQList: React.FC = () => {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mobile-no-overflow">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white mobile-safe-top">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-16 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 mobile-h1">
            <i className="fas fa-brain mr-3"></i>
            Nodeflux FAQ Center
          </h1>
          <p className="text-base md:text-xl opacity-90 mobile-body">
            Pusat Bantuan & Troubleshooting Produk VisionAI
          </p>
        </div>
      </header>

      {/* Advanced Search Section */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
          <AdvancedSearch
            onFiltersChange={setSearchFilters}
            isLoading={loading}
            resultCount={faqs.length}
          />
        </div>
      </section>

  
      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 mobile-h2">
            {searchFilters.searchTerm ? `Hasil Pencarian (${faqs.length})` : `Pertanyaan Umum (${faqs.length})`}
          </h2>

          {faqs.length === 0 && !loading ? (
            <div className="text-center py-12 mobile-loading">
              <div className="text-gray-400 text-4xl md:text-6xl mb-4">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2 mobile-h3">
                {searchFilters.searchTerm ? 'Tidak ada hasil ditemukan' : 'Belum ada FAQ'}
              </h3>
              <p className="text-gray-500 mobile-body">
                {searchFilters.searchTerm
                  ? 'Coba kata kunci lain atau gunakan filter yang berbeda'
                  : 'FAQ akan segera tersedia'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {loading && faqs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Searching...</p>
                </div>
              ) : (
                faqs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mobile-faq-item">
                    {/* FAQ Header with Highlighted Question */}
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full px-4 md:px-6 py-3 md:py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset mobile-faq-question mobile-touch-target mobile-touch-feedback"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <i
                            className={`${getCategoryIcon(faq.category)} text-base md:text-lg flex-shrink-0`}
                            style={{ color: getCategoryColor(faq.category) }}
                          ></i>
                          <div className="flex-1 min-w-0 text-left">
                            <HighlightedText
                              text={faq.question}
                              searchTerm={searchFilters.searchTerm || ''}
                              className="font-semibold text-gray-900 text-sm md:text-base"
                            />

                            {/* Search Snippet */}
                            {searchFilters.searchTerm && !expandedItems.has(faq.id) && (
                              <p className="text-sm text-gray-600 mt-1 mobile-small">
                                <HighlightedText
                                  text={getSearchSnippet(stripHtml(faq.answer), searchFilters.searchTerm, 120)}
                                  searchTerm={searchFilters.searchTerm}
                                  className="text-gray-600"
                                />
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {faq.tags.length > 0 && (
                            <div className="hidden md:flex items-center space-x-1 mr-2">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {faq.tags.slice(0, 2).join(', ')}
                                {faq.tags.length > 2 && ` +${faq.tags.length - 2}`}
                              </span>
                            </div>
                          )}
                          <div className="mobile-btn-icon">
                            {expandedItems.has(faq.id) ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedItems.has(faq.id) && (
                      <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200 mobile-faq-answer">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {faq.answer}
                          </ReactMarkdown>
                        </div>

                        {/* Attachments Indicator */}
                        {faq.attachments && faq.attachments.length > 0 && (
                          <div className="mt-4 flex items-center text-sm text-gray-600">
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span className="mobile-body">{faq.attachments.length} attachment{faq.attachments.length > 1 ? 's' : ''}</span>
                          </div>
                        )}

                        {faq.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 mobile-tags">
                            {faq.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mobile-tag"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Masih Butuh Bantuan?</h2>
          <p className="text-lg opacity-90 mb-8">
            Tim support Nodeflux siap membantu Anda 24/7 untuk semua masalah teknis
          </p>
          <a
            href="mailto:support@nodeflux.io"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="fas fa-envelope mr-2"></i>
            Hubungi Support
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQList;
