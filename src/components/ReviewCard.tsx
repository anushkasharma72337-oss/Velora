import { Star, Flag } from 'lucide-react';
import type { Review } from '../lib/supabase';

interface ReviewCardProps {
  review: Review;
  onFlag?: (id: string) => void;
  showProduct?: boolean;
}

const sentimentColors = {
  positive: 'text-brand-400 bg-brand-500/10',
  neutral: 'text-surface-400 bg-surface-500/10',
  negative: 'text-red-400 bg-red-500/10',
};

export default function ReviewCard({ review, onFlag, showProduct = false }: ReviewCardProps) {
  const name = review.profiles?.full_name || 'Anonymous';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-surface-700 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600/20 rounded-full flex items-center justify-center text-sm font-bold text-brand-400">
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-700'}`} />
                ))}
              </div>
              <span className="text-[10px] text-surface-500">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${sentimentColors[review.sentiment as keyof typeof sentimentColors] || sentimentColors.neutral}`}>
            {review.sentiment}
          </span>
          {onFlag && (
            <button onClick={() => onFlag(review.id)} className="p-1 text-surface-600 hover:text-amber-400 transition" title="Flag review">
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {showProduct && review.products?.name && (
        <div className="text-xs text-brand-400 mb-2 font-medium">on {review.products.name}</div>
      )}
      {review.title && <h4 className="text-sm font-semibold text-surface-200 mb-1">{review.title}</h4>}
      <p className="text-sm text-surface-400 leading-relaxed">{review.content}</p>
    </div>
  );
}
