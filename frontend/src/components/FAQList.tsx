import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Tag, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { faqService, categoryService } from '../services/api';
import type { FAQ, Category } from '../types';
import HighlightedText from '../components/HighlightedText';
import { getSearchSnippet, stripHtml } from '../utils/searchUtils';
import 'highlight.js/styles/github.css';

const FAQList: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterAndSearchFAQs();
  }, [searchTerm, selectedCategory]);

  const loadInitialData = async () => {
    try {
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

  const filterAndSearchFAQs = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm;
      }

      const response = await faqService.getFAQs(params);
      setFaqs(response.data);
    } catch (error) {
      console.error('Error filtering FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
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

      {/* Search Section */}
      <section className="bg-white border-b mobile-search">
        <div className="max-w-3xl mx-auto px-4 py-4 md:py-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Cari masalah atau solusi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-input mobile-touch-target"
            />
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded mobile-small">
                  {faqs.length} hasil
                </span>
              </div>
            )}
          </div>

          {/* Search Results Summary */}
          {searchTerm && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mobile-body">
                Menampilkan {faqs.length} hasil untuk pencarian "<strong>{searchTerm}</strong>"
                {faqs.length === 0 && (
                  <span className="block mt-1 mobile-small">Coba kata kunci lain atau pilih kategori yang berbeda</span>
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 mobile-h2">Kategori Bantuan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mobile-category-grid">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-4 rounded-lg border-2 transition-all mobile-touch-target mobile-category-card ${
                selectedCategory === 'all'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-th-large text-xl md:text-2xl mb-2 text-blue-600"></i>
              <div className="font-semibold text-sm md:text-base">Semua Kategori</div>
              <div className="text-sm text-gray-600 mt-1 mobile-small">{faqs.length} FAQ</div>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`p-4 rounded-lg border-2 transition-all mobile-touch-target mobile-category-card ${
                  selectedCategory === category.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className={`${category.icon} text-xl md:text-2xl mb-2`} style={{ color: category.color }}></i>
                <div className="font-semibold capitalize text-sm md:text-base">{category.name}</div>
                <div className="text-sm text-gray-600 mt-1 mobile-small">{category.description}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 mobile-h2">
            {searchTerm ? `Hasil Pencarian (${faqs.length})` : `Pertanyaan Umum (${faqs.length})`}
          </h2>

          {faqs.length === 0 ? (
            <div className="text-center py-12 mobile-loading">
              <div className="text-gray-400 text-4xl md:text-6xl mb-4">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2 mobile-h3">
                {searchTerm ? 'Tidak ada hasil ditemukan' : 'Belum ada FAQ'}
              </h3>
              <p className="text-gray-500 mobile-body">
                {searchTerm
                  ? 'Coba kata kunci lain atau pilih kategori yang berbeda'
                  : 'FAQ akan segera tersedia'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {faqs.map((faq) => (
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
                            searchTerm={searchTerm}
                            className="font-semibold text-gray-900 text-sm md:text-base"
                          />

                          {/* Search Snippet */}
                          {searchTerm && !expandedItems.has(faq.id) && (
                            <p className="text-sm text-gray-600 mt-1 mobile-small">
                              <HighlightedText
                                text={getSearchSnippet(stripHtml(faq.answer), searchTerm, 120)}
                                searchTerm={searchTerm}
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
              ))}
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