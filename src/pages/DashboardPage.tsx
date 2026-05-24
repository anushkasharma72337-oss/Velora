import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import type { Product, Review } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Package, Star, MessageSquare, TrendingUp, ArrowUpRight,
  ArrowDownRight, Bookmark, Brain
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [productsRes, reviewsRes, savedRes] = await Promise.all([
      supabase.from('products').select('*').eq('status', 'active').order('upvotes', { ascending: false }).limit(20),
      supabase.from('reviews').select('id, rating, title, content, sentiment, created_at, product_id, products(name)').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('saved_products').select('id', { count: 'exact' }).eq('user_id', user!.id),
    ]);
    setProducts(productsRes.data || []);
    setReviews(reviewsRes.data || []);
    setSavedCount(savedRes.count || 0);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-surface-950 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const stats = [
    { label: 'Products', value: products.length, icon: Package, change: '+12%', up: true, color: 'text-brand-400 bg-brand-500/10' },
    { label: 'Your Reviews', value: reviews.length, icon: MessageSquare, change: '+8%', up: true, color: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Avg Rating', value: avgRating, icon: Star, change: '+0.3', up: true, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Saved', value: savedCount, icon: Bookmark, change: '+2', up: true, color: 'text-rose-400 bg-rose-500/10' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-surface-400">Welcome back, {profile?.full_name || profile?.username || user?.email}</p>
          </div>
          {profile?.is_founder && (
            <Link to="/founder" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-600/20 flex items-center gap-2 self-start">
              <Package className="w-4 h-4" /> Founder Dashboard
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, change, up, color }) => (
            <div key={label} className="glass rounded-xl p-5 hover:border-surface-700 transition">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? 'text-brand-400' : 'text-red-400'}`}>
                  {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-surface-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Products */}
          <div className="lg:col-span-2 glass rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Trending Products</h2>
              <Link to="/" className="text-xs text-brand-400 hover:text-brand-300 transition">View all</Link>
            </div>
            <div className="divide-y divide-surface-800 max-h-[400px] overflow-y-auto">
              {products.slice(0, 8).map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="px-5 py-4 flex items-center gap-4 hover:bg-surface-800/30 transition">
                  <div className="w-12 h-12 bg-surface-800 rounded-lg flex items-center justify-center text-lg font-bold text-surface-500 flex-shrink-0 overflow-hidden">
                    {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : product.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{product.name}</div>
                    <div className="text-xs text-surface-500 truncate">{product.category} - {product.description.slice(0, 50)}...</div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-white">{product.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-brand-400 font-medium">+{product.upvotes}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Your Reviews */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Your Reviews</h2>
              <span className="text-xs text-surface-500 bg-surface-800 px-2.5 py-1 rounded-full">{reviews.length}</span>
            </div>
            <div className="divide-y divide-surface-800 max-h-[400px] overflow-y-auto">
              {reviews.length === 0 ? (
                <div className="p-8 text-center text-surface-500">No reviews yet</div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="px-5 py-4">
                    <div className="flex items-center gap-1 mb-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-700'}`} />
                      ))}
                      <span className="text-xs text-surface-500 ml-1.5">{review.products?.name || 'Unknown'}</span>
                    </div>
                    {review.title && <div className="text-sm font-medium text-white mb-0.5">{review.title}</div>}
                    <p className="text-xs text-surface-400 line-clamp-2">{review.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
