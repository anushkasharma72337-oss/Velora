import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, max = 5, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-surface-700'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
