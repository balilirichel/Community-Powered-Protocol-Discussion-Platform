import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  showValue = false,
  interactive = false,
  onChange,
}) => {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const display = hovered ?? rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(display);
        const partial = !filled && i < display && display > i;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(null)}
            aria-label={`${i + 1} star${i + 1 !== 1 ? 's' : ''}`}
            className={[
              'focus:outline-none',
              interactive ? 'cursor-pointer' : 'cursor-default pointer-events-none',
            ].join(' ')}
          >
            <Star
              size={size}
              fill={filled || partial ? '#f59e0b' : 'none'}
              color={filled || partial ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-gray-700 tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
