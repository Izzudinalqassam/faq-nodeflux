import React from 'react';
import { highlightText, stripHtml } from '../utils/searchUtils';

interface HighlightedTextProps {
  text: string;
  searchTerm: string;
  className?: string;
  maxLength?: number;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  searchTerm,
  className = '',
  maxLength
}) => {
  if (!text) return null;

  const displayText = maxLength ? text.substring(0, maxLength) + (text.length > maxLength ? '...' : '') : text;
  const highlightedHTML = highlightText(displayText, searchTerm);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedHTML }}
    />
  );
};

export default HighlightedText;