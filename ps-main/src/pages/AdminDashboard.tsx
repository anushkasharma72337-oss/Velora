import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import type { Product, Review } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Shield, Package, MessageSquare, AlertTriangle, Trash2, Eye, EyeOff,
  CheckCircle, XCircle, Flag, Search
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [flaggedReviews, setFlaggedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile && !profile.is_admin) { navigate('/'); return; }
    fetchData();
  }, [user, profile]);

  const fetchData = async () => {
    const [productsRes, reviewsRes] = await Promise.all([
      supabase.from('products').select('*, profiles(full_name)').order('created_at', { ascending: false }),
      supabase.from('reviews').select('id, rating, title, content, sentiment, is_flagged, created_at, product_id, user_id, profiles(full_name), products(name)').eq('is_flagged', true).order('created_at', { ascending: false }),
    ]);
    setProducts(productsRes.data || []);
    setFlaggedReviews(reviewsRes.data || []);
    setLoading(false);
  };

  const handleProductStatus = async (productId: string, status: string) => {
    await supabase.from('products').update({ status }).eq('id', productId);
    fetchData();
  };

  const handleUnflagReview = async (reviewId: string) => {
    await supabase.from('reviews').update({ is_flagged: false }).eq('id', reviewId);
    fetchData();
  };

  const handleDeleteReview = async (reviewId: string) => {
    await supabase.from('reviews').delete().eq('id', reviewId);
    fetchData();
  };

  if (loading) return <div className="min-h-screen bg-surface-950 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const activeProducts = products.filter(p => p.status === 'active');
  const pendingProducts = products.filter(p => p.status === 'pending');
  const flaggedProducts = products.filter(p => p.status === 'flagged');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-surface-400">Manage products and moderate reviews</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length, icon: Package, color: 'text-brand-400 bg-brand-500/10' },
            { label: 'Active', value: activeProducts.length, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Pending', value: pendingProducts.length, icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10' },
            { label: 'Flagged Reviews', value: flaggedReviews.length, icon: Flag, color: 'text-rose-400 bg-rose-500/10' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-surface-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'products' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:bg-surface-800'
            }`}
          >
            <Package className="w-4 h-4" /> Products
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'reviews' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:bg-surface-800'
            }`}
          >
            <Flag className="w-4 h-4" /> Flagged Reviews ({flaggedReviews.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-800 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
              />
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-800">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-surface-400 uppercase">Product</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-surface-400 uppercase">Founder</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-surface-400 uppercase">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-surface-400 uppercase">Rating</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-surface-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-surface-800/30 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center text-sm font-bold text-surface-500 flex-shrink-0">
                              {product.name[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white truncate max-w-[200px]">{product.name}</div>
                              <div className="text-xs text-surface-500 truncate max-w-[200px]">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-surface-400">{product.profiles?.full_name || 'Unknown'}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            product.status === 'active' ? 'bg-brand-500/10 text-brand-400' :
                            product.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                            product.status === 'flagged' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-surface-500/10 text-surface-400'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-white font-medium">{product.rating.toFixed(1)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {product.status !== 'active' && (
                              <button onClick={() => handleProductStatus(product.id, 'active')}
                                className="p-1.5 text-brand-400 hover:bg-brand-500/10 rounded-lg transition" title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {product.status !== 'flagged' && (
                              <button onClick={() => handleProductStatus(product.id, 'flagged')}
                                className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition" title="Flag">
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            )}
                            {product.status !== 'removed' && (
                              <button onClick={() => handleProductStatus(product.id, 'removed')}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Remove">
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {flaggedReviews.length === 0 ? (
              <div className="text-center py-16 glass rounded-xl">
                <CheckCircle className="w-10 h-10 text-brand-500/30 mx-auto mb-3" />
                <p className="text-surface-400">No flagged reviews</p>
              </div>
            ) : (
              flaggedReviews.map((review) => (
                <div key={review.id} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{review.profiles?.full_name || 'User'}</div>
                      <div className="text-xs text-surface-500">on {review.products?.name || 'Unknown'} - {new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-500/10 text-rose-400">Flagged</span>
                  </div>
                  {review.title && <h4 className="text-sm font-medium text-surface-200 mb-1">{review.title}</h4>}
                  <p className="text-sm text-surface-400 mb-4">{review.content}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUnflagReview(review.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 rounded-lg transition flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Unflag
                    </button>
                    <button onClick={() => handleDeleteReview(review.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
