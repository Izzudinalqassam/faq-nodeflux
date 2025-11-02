import React, { useState } from 'react';
import { X, Share2, Link, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  description
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShareFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const text = `${title}${description ? ` - ${description}` : ''}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description || ''}\n\nRead more: ${currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareButtons = [
    {
      icon: Link,
      label: copied ? 'Copied!' : 'Copy Link',
      onClick: handleCopyLink,
      color: copied ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-700',
      className: copied ? 'text-white' : 'text-white'
    },
    {
      icon: Facebook,
      label: 'Facebook',
      onClick: handleShareFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      className: 'text-white'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      onClick: handleShareTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      className: 'text-white'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      onClick: handleShareLinkedIn,
      color: 'bg-blue-700 hover:bg-blue-800',
      className: 'text-white'
    },
    {
      icon: Mail,
      label: 'Email',
      onClick: handleShareEmail,
      color: 'bg-gray-500 hover:bg-gray-600',
      className: 'text-white'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors mobile-btn-icon"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center mb-4">
          <Share2 className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Share this FAQ</h3>
        </div>

        {/* FAQ Title */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          )}
        </div>

        {/* URL Display */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 truncate font-mono">{currentUrl}</p>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {shareButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${button.color} ${button.className} mobile-btn mobile-touch-target`}
            >
              <button.icon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">{button.label}</span>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> You can also use Ctrl+C (Cmd+C on Mac) to copy the URL from your browser's address bar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;