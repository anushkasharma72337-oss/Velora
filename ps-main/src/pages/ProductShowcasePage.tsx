import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Product, Review, Comment, Vote } from '../lib/supabase';
import StarRating from '../components/ui/StarRating';
import VoteButtons from '../components/ui/VoteButtons';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  ExternalLink, Globe, MessageSquare, Send, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, Brain, User
} from 'lucide-react';

export default function ProductShowcasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    const [productRes, reviewsRes, commentsRes] = await Promise.all([
      supabase.from('products').select('*, profiles(full_name, username, avatar_url, is_founder)').eq('id', id!).maybeSingle(),
      supabase.from('reviews').select('id, rating, title, content, sentiment, is_flagged, created_at, profiles(full_name, username, avatar_url)').eq('product_id', id!).order('created_at', { ascending: false }),
      supabase.from('comments').select('id, content, parent_id, created_at, profiles(full_name, username, avatar_url)').eq('product_id', id!).order('created_at', { ascending: true }),
    ]);

    setProduct(productRes.data);
    setReviews(reviewsRes.data || []);
    setComments(commentsRes.data || []);

    if (user) {
      const [voteRes, savedRes] = await Promise.all([
        supabase.from('votes').select('vote_type').eq('product_id', id!).eq('user_id', user.id).maybeSingle(),
        supabase.from('saved_products').select('id').eq('product_id', id!).eq('user_id', user.id).maybeSingle(),
      ]);
      setUserVote(voteRes.data?.vote_type || null);
      setIsSaved(!!savedRes.data);
    }
    setLoading(false);
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) { navigate('/login'); return; }
    if (userVote === type) {
      await supabase.from('votes').delete().eq('product_id', id!).eq('user_id', user.id);
      setUserVote(null);
    } else {
      if (userVote) {
        await supabase.from('votes').update({ vote_type: type }).eq('product_id', id!).eq('user_id', user.id);
      } else {
        await supabase.from('votes').insert({ product_id: id!, user_id: user.id, vote_type: type });
      }
      setUserVote(type);
    }
    fetchData();
  };

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    if (isSaved) {
      await supabase.from('saved_products').delete().eq('product_id', id!).eq('user_id', user.id);
    } else {
      await supabase.from('saved_products').insert({ product_id: id!, user_id: user.id });
    }
    setIsSaved(!isSaved);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    await supabase.from('comments').insert({
      product_id: id!,
      user_id: user.id,
      content: newComment.trim(),
    });
    setNewComment('');
    fetchData();
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const sentiment = reviewRating >= 4 ? 'positive' : reviewRating >= 3 ? 'neutral' : 'negative';
    await supabase.from('reviews').insert({
      product_id: id!,
      user_id: user.id,
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent,
      sentiment,
    });
    setShowReviewModal(false);
    setReviewRating(5); setReviewTitle(''); setReviewContent('');
    fetchData();
  };

  const allImages = [product?.image_url, ...(product?.screenshots || [])].filter(Boolean) as string[];

  if (loading) return <div className="min-h-screen bg-surface-950 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!product) return <div className="min-h-screen bg-surface-950 flex items-center justify-center text-surface-400">Product not found</div>;

  return (
    <div className="min-h-screen bg-surface-950 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Image Gallery */}
        {allImages.length > 0 && (
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden bg-surface-900 aspect-video max-h-[500px]">
              <img src={allImages[activeScreenshot]} alt={product.name} className="w-full h-full object-cover" />
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setActiveScreenshot((activeScreenshot - 1 + allImages.length) % allImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-surface-900/80 backdrop-blur-sm rounded-full text-white hover:bg-surface-800 transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setActiveScreenshot((activeScreenshot + 1) % allImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-surface-900/80 backdrop-blur-sm rounded-full text-white hover:bg-surface-800 transition">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveScreenshot(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                      i === activeScreenshot ? 'border-brand-500' : 'border-surface-800 hover:border-surface-600'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product header */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <VoteButtons
                  upvotes={product.upvotes}
                  downvotes={product.downvotes}
                  userVote={userVote}
                  onVote={handleVote}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-white">{product.name}</h1>
                    <Badge variant="brand" size="md">{product.category.toUpperCase()}</Badge>
                  </div>
                  <p className="text-surface-400 leading-relaxed">{product.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={product.rating} />
                  <span className="text-sm font-semibold text-white">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-surface-500">({product.review_count} reviews)</span>
                </div>
                {product.price > 0 && (
                  <span className="text-lg font-bold text-brand-400">${product.price}/mo</span>
                )}
                {product.price === 0 && (
                  <span className="px-3 py-1 bg-brand-500/10 text-brand-400 text-sm font-semibold rounded-lg">Free</span>
                )}
                <button onClick={handleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isSaved ? 'bg-brand-500/10 text-brand-400' : 'bg-surface-800 text-surface-400 hover:text-brand-400'
                  }`}>
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 mt-4">
                {product.website_url && (
                  <a href={product.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 glass rounded-lg text-sm text-brand-400 hover:bg-brand-500/10 transition">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
                {product.demo_url && (
                  <a href={product.demo_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm text-white font-medium transition">
                    <ExternalLink className="w-4 h-4" /> Try Demo
                  </a>
                )}
                <button onClick={() => { if (!user) navigate('/login'); else setShowReviewModal(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 glass rounded-lg text-sm text-surface-300 hover:text-white hover:bg-surface-800 transition">
                  <MessageSquare className="w-4 h-4" /> Write Review
                </button>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs bg-surface-800 text-surface-400 rounded-lg font-medium">{tag}</span>
                  ))}
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-surface-300 mb-3">Key Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-surface-400">
                        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Insights Link */}
            {product.ai_score > 0 && (
              <div className="glass rounded-xl p-5 hover:border-brand-500/30 transition cursor-pointer" onClick={() => navigate(`/product/${id}/insights`)}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">AI Insights Available</h3>
                    <p className="text-xs text-surface-400">View sentiment analysis, common complaints, and feature requests</p>
                  </div>
                  <div className="text-2xl font-bold text-brand-400">{product.ai_score.toFixed(0)}</div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Reviews ({reviews.length})</h2>
                <button onClick={() => { if (!user) navigate('/login'); else setShowReviewModal(true); }}
                  className="text-sm text-brand-400 hover:text-brand-300 transition">
                  Write a review
                </button>
              </div>
              {reviews.length === 0 ? (
                <div className="text-center py-10 glass rounded-xl">
                  <MessageSquare className="w-10 h-10 text-surface-700 mx-auto mb-3" />
                  <p className="text-surface-400">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Comments ({comments.length})</h2>
              {user && (
                <form onSubmit={handleAddComment} className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-brand-600/20 rounded-full flex items-center justify-center text-xs font-bold text-brand-400 flex-shrink-0">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2.5 bg-surface-900 border border-surface-800 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
                  />
                  <button type="submit" disabled={!newComment.trim()}
                    className="p-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition disabled:opacity-30">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 glass rounded-xl p-4">
                    <div className="w-8 h-8 bg-surface-700 rounded-full flex items-center justify-center text-xs font-bold text-surface-300 flex-shrink-0">
                      {comment.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{comment.profiles?.full_name || 'User'}</span>
                        <span className="text-[10px] text-surface-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-surface-400">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Founder info */}
            {product.profiles && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-surface-300 mb-3">Founder</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-600/20 rounded-full flex items-center justify-center text-lg font-bold text-brand-400">
                    {product.profiles.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{product.profiles.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-surface-500">@{product.profiles.username || 'user'}</div>
                    {product.profiles.is_founder && (
                      <span className="text-[10px] text-brand-400 font-medium">Verified Founder</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Product Score */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-300 mb-4">Product Score</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#00e87f" strokeWidth="8"
                      strokeDasharray={`${(product.rating / 5) * 264} 264`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{product.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-surface-500 w-3">{star}</span>
                      <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-surface-500 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Summary */}
            {product.ai_summary && (
              <div className="glass rounded-xl p-5 border-brand-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-brand-400">AI Summary</h3>
                </div>
                <p className="text-sm text-surface-400 leading-relaxed">{product.ai_summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal open={showReviewModal} onClose={() => setShowReviewModal(false)} title="Write a Review">
        <form onSubmit={handleAddReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Rating</label>
            <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Title</label>
            <input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} required
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Your Review</label>
            <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} rows={4} required
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none" />
          </div>
          <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition">
            Submit Review
          </button>
        </form>
      </Modal>
    </div>
  );
}
