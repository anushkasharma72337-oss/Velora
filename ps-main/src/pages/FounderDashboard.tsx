import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Package, Star, MessageSquare, TrendingUp, Plus, X,
  ArrowUpRight, Eye, ExternalLink, BarChart3, Users
} from 'lucide-react';

export default function FounderDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('ai');
  const [pImage, setPImage] = useState('');
  const [pWebsite, setPWebsite] = useState('');
  const [pDemo, setPDemo] = useState('');
  const [pScreenshots, setPScreenshots] = useState('');
  const [pTags, setPTags] = useState('');
  const [pFeatures, setPFeatures] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('founder_id', user!.id)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = pFeatures.split(',').map(f => f.trim()).filter(Boolean);
    const tags = pTags.split(',').map(t => t.trim()).filter(Boolean);
    const screenshots = pScreenshots.split(',').map(s => s.trim()).filter(Boolean);

    await supabase.from('products').insert({
      name: pName,
      description: pDesc,
      price: parseFloat(pPrice) || 0,
      category: pCategory,
      image_url: pImage,
      website_url: pWebsite,
      demo_url: pDemo,
      screenshots,
      tags,
      features,
      founder_id: user!.id,
    });

    setShowAddProduct(false);
    setPName(''); setPDesc(''); setPPrice(''); setPCategory('ai');
    setPImage(''); setPWebsite(''); setPDemo(''); setPScreenshots('');
    setPTags(''); setPFeatures('');
    fetchData();
  };

  const totalReviews = products.reduce((sum, p) => sum + p.review_count, 0);
  const avgRating = products.length > 0
    ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
    : '0';
  const totalUpvotes = products.reduce((sum, p) => sum + p.upvotes, 0);

  const stats = [
    { label: 'My Products', value: products.length, icon: Package, color: 'text-brand-400 bg-brand-500/10' },
    { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, color: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Avg Rating', value: avgRating, icon: Star, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Total Upvotes', value: totalUpvotes, icon: TrendingUp, color: 'text-rose-400 bg-rose-500/10' },
  ];

  if (loading) return <div className="min-h-screen bg-surface-950 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Founder Dashboard</h1>
            <p className="text-surface-400">Manage your products and track performance</p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl p-5 hover:border-surface-700 transition">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-surface-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Products */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">My Products</h2>
            <span className="text-xs text-surface-500 bg-surface-800 px-2.5 py-1 rounded-full">{products.length} total</span>
          </div>
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-surface-700 mx-auto mb-4" />
              <p className="text-surface-400 mb-4">No products yet. Launch your first one!</p>
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          ) : (
            <div className="divide-y divide-surface-800">
              {products.map((product) => (
                <div key={product.id} className="px-5 py-4 flex items-center gap-4 hover:bg-surface-800/30 transition">
                  <div className="w-14 h-14 bg-surface-800 rounded-xl flex items-center justify-center text-xl font-bold text-surface-500 flex-shrink-0 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : product.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/product/${product.id}`} className="text-sm font-semibold text-white hover:text-brand-400 transition truncate">
                        {product.name}
                      </Link>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-brand-500/10 text-brand-400' :
                        product.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="text-xs text-surface-500 truncate mt-0.5">{product.description}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-white">{product.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-[10px] text-surface-500">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-brand-400">+{product.upvotes}</div>
                      <div className="text-[10px] text-surface-500">Upvotes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-surface-300">{product.review_count}</div>
                      <div className="text-[10px] text-surface-500">Reviews</div>
                    </div>
                    <Link to={`/product/${product.id}`} className="p-2 text-surface-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal open={showAddProduct} onClose={() => setShowAddProduct(false)} title="Launch Your Product" maxWidth="max-w-2xl">
        <form onSubmit={handleAddProduct} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Product Name</label>
              <input value={pName} onChange={(e) => setPName(e.target.value)} required
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="My Awesome Product" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Category</label>
              <select value={pCategory} onChange={(e) => setPCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="ai">AI / ML</option>
                <option value="saas">SaaS</option>
                <option value="fintech">Fintech</option>
                <option value="devtools">Dev Tools</option>
                <option value="health">Health</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
            <textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={3} required
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none" placeholder="What does your product do?" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Price ($0 for free)</label>
              <input type="number" step="0.01" value={pPrice} onChange={(e) => setPPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Cover Image URL</label>
              <input value={pImage} onChange={(e) => setPImage(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Website URL</label>
              <input value={pWebsite} onChange={(e) => setPWebsite(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="https://myproduct.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Demo URL</label>
              <input value={pDemo} onChange={(e) => setPDemo(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="https://demo.myproduct.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Screenshots (comma-separated URLs)</label>
            <textarea value={pScreenshots} onChange={(e) => setPScreenshots(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none" placeholder="https://img1.jpg, https://img2.jpg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Tags (comma-separated)</label>
              <input value={pTags} onChange={(e) => setPTags(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="AI, Productivity, B2B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Features (comma-separated)</label>
              <input value={pFeatures} onChange={(e) => setPFeatures(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="Fast, Secure, Scalable" />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Launch Product
          </button>
        </form>
      </Modal>
    </div>
  );
}
