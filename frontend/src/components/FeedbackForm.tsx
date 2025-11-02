import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { feedbackService } from '../services/api';

interface FeedbackFormProps {
  faqId: number;
  onFeedbackSubmitted?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ faqId, onFeedbackSubmitted }) => {
  const [feedbackType, setFeedbackType] = useState<'helpful' | 'not-helpful'>('helpful');
  const [feedbackText, setFeedbackText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      setError('Please provide your feedback');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await feedbackService.submitFeedback(faqId, {
        feedback_text: feedbackText.trim(),
        contact_email: contactEmail.trim() || undefined,
        is_helpful: feedbackType === 'helpful'
      });

      setSubmitted(true);
      setFeedbackText('');
      setContactEmail('');

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-800">
          <ThumbsUp className="h-5 w-5" />
          <span className="font-medium">Thank you for your feedback!</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Your feedback helps us improve our FAQ content.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 md:p-6 mobile-feedback-form">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 mobile-h3">Was this helpful?</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 mobile-body">
            Your experience
          </label>
          <div className="flex space-x-2 md:space-x-4 mobile-feedback-buttons">
            <button
              type="button"
              onClick={() => setFeedbackType('helpful')}
              className={`flex items-center px-3 py-2 md:px-4 rounded-lg border-2 transition-colors mobile-touch-target mobile-feedback-button ${
                feedbackType === 'helpful'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              <span className="text-sm md:text-base">Helpful</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('not-helpful')}
              className={`flex items-center px-3 py-2 md:px-4 rounded-lg border-2 transition-colors mobile-touch-target mobile-feedback-button ${
                feedbackType === 'not-helpful'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              <span className="text-sm md:text-base">Not Helpful</span>
            </button>
          </div>
        </div>

        {/* Feedback Text */}
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2 mobile-body">
            Your feedback *
          </label>
          <textarea
            id="feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-textarea mobile-touch-target"
            placeholder={
              feedbackType === 'helpful'
                ? 'What did you find helpful? How can we make it even better?'
                : 'What was missing or unclear? How can we improve this answer?'
            }
            required
          />
        </div>

        {/* Contact Email (Optional) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 mobile-body">
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-input mobile-touch-target"
            placeholder="your@email.com"
          />
          <p className="text-xs text-gray-500 mt-1 mobile-small">
            Only if you'd like us to follow up with you
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600 mobile-body">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mobile-btn mobile-touch-target"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;