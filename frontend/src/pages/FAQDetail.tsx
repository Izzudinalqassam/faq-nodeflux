import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { faqService, categoryService } from '../services/api';
import type { FAQ, Category } from '../types';
import 'highlight.js/styles/github.css';

const FAQDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [relatedFAQs, setRelatedFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (id) {
      loadFAQ(parseInt(id));
    }
    loadCategories();
  }, [id]);

  const loadFAQ = async (faqId: number) => {
    try {
      setLoading(true);
      const faqData = await faqService.getFAQ(faqId);
      setFaq(faqData);

      // Load related FAQs (same category)
      const relatedResponse = await faqService.getFAQs({
        category: faqData.category,
        per_page: 5,
      });
      setRelatedFAQs(relatedResponse.data.filter(f => f.id !== faqId));
    } catch (error) {
      console.error('Error loading FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
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
          <p className="mt-4 text-gray-600">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">
            <i className="fas fa-question-circle"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            FAQ tidak ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            FAQ yang Anda cari tidak tersedia
          </p>
          <Link
            to="/"
            className="btn btn-primary"
          >
            Kembali ke FAQ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-4">
            <Link
              to="/"
              className="text-white/80 hover:text-white flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
            <i className={`${getCategoryIcon(faq.category)} text-xl mr-3`} style={{ color: 'white' }}></i>
            <span className="text-lg font-medium capitalize">{faq.category}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{faq.question}</h1>
          {faq.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <div className="flex flex-wrap gap-2">
                {faq.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Answer */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {faq.answer}
              </ReactMarkdown>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Dibuat: {new Date(faq.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span>Diupdate: {new Date(faq.updated_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related FAQs */}
      {relatedFAQs.length > 0 && (
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">FAQ Terkait</h2>
            <div className="grid gap-4">
              {relatedFAQs.map((relatedFAQ) => (
                <Link
                  key={relatedFAQ.id}
                  to={`/faqs/${relatedFAQ.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <i
                      className={`${getCategoryIcon(relatedFAQ.category)} mt-1 mr-3`}
                      style={{ color: getCategoryColor(relatedFAQ.category) }}
                    ></i>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {relatedFAQ.question}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="capitalize">{relatedFAQ.category}</span>
                        {relatedFAQ.tags.length > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{relatedFAQ.tags.slice(0, 3).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default FAQDetail;