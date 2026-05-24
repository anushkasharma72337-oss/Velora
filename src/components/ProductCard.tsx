import { Link } from 'react-router-dom';
import { Star, ArrowUpRight, MessageSquare } from 'lucide-react';
import Badge from './ui/Badge';
import type { Product } from '../lib/supabase';

const categoryVariant: Record<string, 'brand' | 'cyan' | 'amber' | 'rose' | 'blue' | 'slate'> = {
  ai: 'brand',
  saas: 'blue',
  fintech: 'amber',
  devtools: 'cyan',
  health: 'rose',
  general: 'slate',
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden hover:border-surface-700 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-300"
    >
      <div className="relative h-44 overflow-hidden bg-surface-800">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900">
            <span className="text-5xl font-black text-surface-700/50">{product.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge variant={categoryVariant[product.category] || 'slate'}>{product.category.toUpperCase()}</Badge>
          {product.ai_score > 0 && (
            <Badge variant="brand">AI {product.ai_score.toFixed(0)}</Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-1.5 bg-surface-900/80 backdrop-blur-sm rounded-lg">
            <ArrowUpRight className="w-4 h-4 text-brand-400" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors mb-1.5">
          {product.name}
        </h3>
        <p className="text-sm text-surface-400 mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] bg-surface-800 text-surface-400 rounded-md font-medium">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] bg-surface-800 text-surface-500 rounded-md">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-surface-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-white">{product.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-surface-500">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs">{product.review_count}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-brand-400 font-bold">+{product.upvotes}</span>
            <span className="text-surface-600">/</span>
            <span className="text-surface-500">-{product.downvotes}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
