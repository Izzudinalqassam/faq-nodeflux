import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Tag, BookOpen, Search, TrendingUp, Clock, Star, Filter, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { faqService, categoryService } from '../services/api';
import type { FAQ, Category } from '../types';
import HighlightedText from '../components/HighlightedText';
import AdvancedSearch from '../components/AdvancedSearch';
import { getSearchSnippet, stripHtml } from '../utils/searchUtils';
import 'highlight.js/styles/github.css';

const EnhancedFAQList: React.FC = () => {
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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

  const getCategoryGradient = (categoryName: string) => {
    const color = getCategoryColor(categoryName);
    return `linear-gradient(135deg, ${color}22, ${color}11)`;
  };

  const getPopularFAQs = () => {
    return faqs.slice(0, 3);
  };

  const getRecentFAQs = () => {
    return faqs.slice(0, 3);
  };

  if (loading && faqs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 opacity-20 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading amazing FAQs...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header with Animated Background */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center text-white">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6 animate-float">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Nodeflux FAQ Center
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
              Pusat Bantuan & Troubleshooting Produk VisionAI
            </p>
            
            {/* Quick Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Cari jawaban untuk pertanyaan Anda..."
                value={searchFilters.searchTerm}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/90 backdrop-blur-lg border border-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-800 placeholder-gray-500 shadow-xl"
              />
              {searchFilters.searchTerm && (
                <button
                  onClick={() => setSearchFilters(prev => ({ ...prev, searchTerm: '' }))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronUp className="w-5 h-5 rotate-45" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Cards */}
      {!searchFilters.searchTerm && (
        <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total FAQs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{faqs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Categories</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Filter className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Popular</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{getPopularFAQs().length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Recent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{getRecentFAQs().length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Pills */}
      {!searchFilters.searchTerm && (
        <section className="max-w-7xl mx-auto px-4 mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSearchFilters(prev => ({ ...prev, category: 'all' }))}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                searchFilters.category === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSearchFilters(prev => ({ ...prev, category: category.name }))}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                  searchFilters.category === category.name
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  borderColor: searchFilters.category === category.name ? category.color : undefined
                }}
              >
                <i className={`${category.icon} text-sm`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Advanced Search Section */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <AdvancedSearch
          onFiltersChange={setSearchFilters}
          isLoading={loading}
          resultCount={faqs.length}
        />
      </section>

      {/* FAQ List */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {searchFilters.searchTerm ? `Search Results (${faqs.length})` : `Frequently Asked Questions`}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {searchFilters.searchTerm 
              ? `Found ${faqs.length} result${faqs.length !== 1 ? 's' : ''} for "${searchFilters.searchTerm}"`
              : 'Browse through our comprehensive FAQ collection'
            }
          </p>
        </div>

        {faqs.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              {searchFilters.searchTerm ? 'No results found' : 'No FAQs available yet'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchFilters.searchTerm
                ? 'Try different keywords or adjust your filters'
                : 'FAQs will be available soon'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                  hoveredCard === faq.id ? 'ring-2 ring-blue-500/20' : ''
                }`}
                onMouseEnter={() => setHoveredCard(faq.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: expandedItems.has(faq.id) ? getCategoryGradient(faq.category) : 'white'
                }}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: getCategoryColor(faq.category) }}
                      >
                        <i className={`${getCategoryIcon(faq.category)} text-sm`}></i>
                      </div>
                      <div>
                        <span 
                          className="text-xs font-semibold px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: getCategoryColor(faq.category) }}
                        >
                          {faq.category}
                        </span>
                      </div>
                    </div>
                    {/* Rating section removed until rating property is added to FAQ type */}
                  </div>

                  {/* Question */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    <HighlightedText
                      text={faq.question}
                      searchTerm={searchFilters.searchTerm || ''}
                      className="text-gray-900"
                    />
                  </h3>

                  {/* Search Snippet */}
                  {searchFilters.searchTerm && !expandedItems.has(faq.id) && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      <HighlightedText
                        text={getSearchSnippet(stripHtml(faq.answer), searchFilters.searchTerm, 100)}
                        searchTerm={searchFilters.searchTerm}
                        className="text-gray-600"
                      />
                    </p>
                  )}

                  {/* Tags */}
                  {faq.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {faq.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          #{tag}
                        </span>
                      ))}
                      {faq.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          +{faq.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl transition-all duration-300 group-hover:shadow-md"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {expandedItems.has(faq.id) ? 'Hide Answer' : 'Show Answer'}
                    </span>
                    <div className={`transform transition-transform duration-300 ${expandedItems.has(faq.id) ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    </div>
                  </button>
                </div>

                {/* Expanded Content */}
                {expandedItems.has(faq.id) && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4 prose prose-sm max-w-none">
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
                        <span>{faq.attachments.length} attachment{faq.attachments.length > 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* All Tags */}
                    {faq.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {faq.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300"
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

      {/* Enhanced Contact Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6">Still Need Help?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Our support team is available 24/7 to help you with any technical issues or questions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@nodeflux.io"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <i className="fas fa-envelope mr-3"></i>
                Email Support
              </a>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-lg text-white font-semibold rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/20">
                <i className="fas fa-comments mr-3"></i>
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedFAQList;
