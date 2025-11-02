import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Tag, FileText, Download, Paperclip, MessageSquare, X, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { faqService, categoryService, feedbackService } from '../services/api';
import type { FAQ, Category, RatingStats } from '../types';
import ImageGallery from '../components/ImageGallery';
import Rating from '../components/Rating';
import FeedbackForm from '../components/FeedbackForm';
import ShareModal from '../components/ShareModal';
import PrintButton from '../components/PrintButton';
import 'highlight.js/styles/github.css';

const FAQDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [relatedFAQs, setRelatedFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

      // Set rating stats from FAQ data
      if (faqData.rating_stats) {
        setRatingStats(faqData.rating_stats);
      }

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (attachment: any) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.original_filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getImageAttachments = () => {
    return faq?.attachments.filter(att => att.file_type === 'image') || [];
  };

  const getDocumentAttachments = () => {
    return faq?.attachments.filter(att => att.file_type !== 'image') || [];
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!faq) return;

    setSubmittingRating(true);
    try {
      const response = await feedbackService.submitRating(faq.id, rating);

      // Update rating stats
      if (response.stats) {
        setRatingStats(response.stats);
      }

      // Update FAQ data
      const updatedFAQ = await faqService.getFAQ(faq.id);
      setFaq(updatedFAQ);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleFeedbackSubmitted = async () => {
    // Refresh FAQ data to get updated stats
    if (faq) {
      const updatedFAQ = await faqService.getFAQ(faq.id);
      setFaq(updatedFAQ);
      if (updatedFAQ.rating_stats) {
        setRatingStats(updatedFAQ.rating_stats);
      }
    }
    setShowFeedbackForm(false);
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
    <div className="min-h-screen bg-gray-50 mobile-no-overflow">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white mobile-safe-top">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Action Buttons */}
          <div className="flex justify-end mb-4 space-x-2 no-print">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors mobile-btn mobile-touch-target"
              title="Share FAQ"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Share</span>
            </button>
            <PrintButton
              onClick={() => window.print()}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
            />
          </div>

          <div className="flex items-center mb-4">
            <Link
              to="/"
              className="text-white/80 hover:text-white flex items-center mr-4 mobile-touch-target mobile-touch-feedback"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Kembali</span>
              <span className="md:hidden">Back</span>
            </Link>
            <i className={`${getCategoryIcon(faq.category)} text-lg md:text-xl mr-2 md:mr-3`} style={{ color: 'white' }}></i>
            <span className="text-sm md:text-lg font-medium capitalize mobile-body">{faq.category}</span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold mb-4 mobile-h1">{faq.question}</h1>
          {faq.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <div className="flex flex-wrap gap-2 mobile-tags">
                {faq.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mobile-tag"
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
      <section className="py-8 md:py-12 print-container">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8 mobile-card print-content">
            <div className="prose prose-sm md:prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {faq.answer}
              </ReactMarkdown>
            </div>

            {/* Attachments Section */}
            {faq.attachments && faq.attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 print-attachments">
                <div className="flex items-center mb-4">
                  <Paperclip className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
                </div>

                {/* Image Gallery */}
                {getImageAttachments().length > 0 && (
                  <div className="mb-6 no-print">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Images</h4>
                    <ImageGallery
                      images={getImageAttachments()}
                      title="FAQ Images"
                    />
                  </div>
                )}

                {/* Document Attachments */}
                {getDocumentAttachments().length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Documents</h4>
                    <div className="space-y-2">
                      {getDocumentAttachments().map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors mobile-attachment"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate print-attachment-name">
                                {attachment.original_filename}
                              </p>
                              <p className="text-xs text-gray-500 mobile-small print-attachment-meta">
                                {formatFileSize(attachment.file_size)} • {attachment.mime_type}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(attachment)}
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors no-print"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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

      {/* Rating Section */}
      <section className="py-6 md:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mobile-card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mobile-h3">Rate this FAQ</h3>

            {ratingStats ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Rating
                    rating={ratingStats.average_rating}
                    totalRatings={ratingStats.total_ratings}
                    interactive={true}
                    onRatingChange={handleRatingSubmit}
                    loading={submittingRating}
                    size="lg"
                    className="mb-4"
                  />
                </div>

                {/* Rating Distribution */}
                {ratingStats.total_ratings > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 mobile-body">Rating Distribution</h4>
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 w-12 mobile-small">{star} star</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mobile-rating-bar">
                            <div
                              className="bg-yellow-400 h-2 rounded-full mobile-rating-bar"
                              style={{
                                width: ratingStats.total_ratings > 0
                                  ? `${(ratingStats.rating_distribution[star] / ratingStats.total_ratings) * 100}%`
                                  : '0%'
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right mobile-small">
                            {ratingStats.rating_distribution[star]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <Rating
                  rating={0}
                  totalRatings={0}
                  interactive={true}
                  onRatingChange={handleRatingSubmit}
                  loading={submittingRating}
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-6 md:py-8">
        <div className="max-w-4xl mx-auto px-4">
          {!showFeedbackForm ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mobile-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 mobile-h3">Have feedback?</h3>
                </div>
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors mobile-btn mobile-touch-target"
                >
                  Leave Feedback
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2 mobile-body">
                Help us improve this FAQ by sharing your thoughts and suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 mobile-h3">Share Your Feedback</h3>
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm mobile-btn-icon mobile-touch-target"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <FeedbackForm
                faqId={faq!.id}
                onFeedbackSubmitted={handleFeedbackSubmitted}
              />
            </div>
          )}
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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={faq?.question || ''}
        description={faq?.answer ? faq.answer.substring(0, 150) + '...' : ''}
      />

      {/* Print Footer */}
      <div className="print-footer no-print">
        <p className="print-url">{typeof window !== 'undefined' ? window.location.href : ''}</p>
      </div>
    </div>
  );
};

export default FAQDetail;