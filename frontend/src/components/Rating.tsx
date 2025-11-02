import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';

interface RatingProps {
  rating: number;
  totalRatings: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  loading?: boolean;
  showCount?: boolean;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  rating,
  totalRatings,
  size = 'md',
  interactive = false,
  onRatingChange,
  loading = false,
  showCount = true,
  className = ''
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && !loading && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (starNumber: number) => {
    const filled = starNumber <= (hoveredRating || rating);
    const interactiveClasses = interactive && !loading
      ? 'cursor-pointer transition-colors hover:text-yellow-400 mobile-star-hover'
      : '';

    return (
      <button
        key={starNumber}
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => interactive && setHoveredRating(starNumber)}
        onMouseLeave={() => interactive && setHoveredRating(0)}
        className={`${interactive ? 'mobile-touch-target' : ''} ${interactive ? 'mobile-touch-feedback' : ''}`}
        disabled={!interactive || loading}
      >
        <Star
          className={`${sizeClasses[size]} star ${
            filled
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          } ${interactiveClasses}`}
        />
      </button>
    );
  };

  return (
    <div className={`flex items-center space-x-2 ${className} ${interactive ? 'mobile-rating' : ''}`}>
      {loading ? (
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mobile-spinner`} />
      ) : (
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map(renderStar)}
        </div>
      )}

      {showCount && !loading && (
        <span className="text-sm text-gray-600 mobile-body">
          {rating.toFixed(1)} ({totalRatings})
        </span>
      )}

      {interactive && !loading && (
        <span className="text-xs text-gray-500 ml-2 hidden md:inline mobile-small">
          Click to rate
        </span>
      )}
    </div>
  );
};

export default Rating;