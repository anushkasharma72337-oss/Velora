import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import type { Review, Product } from '../lib/supabase';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { User, Star, Bookmark, MessageSquare, Settings, CreditCard as Edit3, Save, X } from 'lucide-react';

export default function UserProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'saved' | 'settings'>('reviews');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editUsername, setEditUsername] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    const [reviewsRes, savedRes] = await Promise.all([
      supabase
        .from('reviews')
        .select('id, rating, title, content, sentiment, is_flagged, created_at, product_id, products(name)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('saved_products')
        .select('product_id, products(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
    ]);

    setReviews(reviewsRes.data || []);
    setSavedProducts((savedRes.data || []).map((s: any) => s.products).filter(Boolean));
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    await supabase
      .from('profiles')
      .update({ full_name: editName, bio: editBio, username: editUsername })
      .eq('id', user!.id);
    setEditMode(false);
    window.location.reload();
  };

  const startEdit = () => {
    setEditName(profile?.full_name || '');
    setEditBio(profile?.bio || '');
    setEditUsername(profile?.username || '');
    setEditMode(true);
  };

  if (authLoading || loading) return <div className="min-h-screen bg-surface-950 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const tabs = [
    { id: 'reviews' as const, label: 'My Reviews', icon: MessageSquare, count: reviews.length },
    { id: 'saved' as const, label: 'Saved Products', icon: Bookmark, count: savedProducts.length },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 bg-brand-600/20 rounded-2xl flex items-center justify-center text-3xl font-bold text-brand-400">
              {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profile?.full_name || 'User'}</h1>
              <p className="text-sm text-surface-400">@{profile?.username || 'username'}</p>
              {profile?.bio && <p className="text-sm text-surface-400 mt-2">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-3">
                {profile?.is_founder && (
                  <span className="px-2.5 py-1 text-xs bg-brand-500/10 text-brand-400 rounded-lg font-medium">Founder</span>
                )}
                {profile?.is_admin && (
                  <span className="px-2.5 py-1 text-xs bg-rose-500/10 text-rose-400 rounded-lg font-medium">Admin</span>
                )}
                <span className="text-xs text-surface-500">Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={startEdit} className="p-2.5 glass hover:bg-surface-800 rounded-xl transition" title="Edit profile">
              <Edit3 className="w-4 h-4 text-surface-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                activeTab === id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === id ? 'bg-white/20' : 'bg-surface-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-16 glass rounded-xl">
                <MessageSquare className="w-10 h-10 text-surface-700 mx-auto mb-3" />
                <p className="text-surface-400">No reviews yet</p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} showProduct />
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedProducts.length === 0 ? (
              <div className="col-span-2 text-center py-16 glass rounded-xl">
                <Bookmark className="w-10 h-10 text-surface-700 mx-auto mb-3" />
                <p className="text-surface-400">No saved products</p>
              </div>
            ) : (
              savedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="glass rounded-xl p-4 hover:border-brand-500/30 transition flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-surface-800 rounded-xl flex items-center justify-center text-lg font-bold text-surface-500 flex-shrink-0 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : product.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{product.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-surface-400">{product.rating.toFixed(1)}</span>
                      <span className="text-xs text-surface-500">+{product.upvotes} upvotes</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                <input value={user?.email || ''} disabled
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-surface-500 text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
                <input value={profile?.full_name || ''} disabled
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Username</label>
                <input value={profile?.username || ''} disabled
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm cursor-not-allowed" />
              </div>
              <p className="text-xs text-surface-500">Click the edit button on your profile to change these values.</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal open={editMode} onClose={() => setEditMode(false)} title="Edit Profile">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Username</label>
            <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Bio</label>
            <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none" />
          </div>
          <button onClick={handleSaveProfile}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
}
