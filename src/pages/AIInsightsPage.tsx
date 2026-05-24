import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product, Review, AIInsight } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import {
  Brain, ArrowLeft, ThumbsUp, ThumbsDown, AlertTriangle,
  Lightbulb, TrendingUp, BarChart3, Sparkles, CheckCircle2, XCircle
} from 'lucide-react';

export default function AIInsightsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    const [productRes, reviewsRes, insightRes] = await Promise.all([
      supabase.from('products').select('*').eq('id', id!).maybeSingle(),
      supabase.from('reviews').select('id, rating, title, content, sentiment, created_at').eq('product_id', id!),
      supabase.from('ai_insights').select('*').eq('product_id', id!).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    setProduct(productRes.data);
    setReviews(reviewsRes.data || []);
    setInsight(insightRes.data);

    // Generate AI insights client-side if none exist
    if (!insightRes.data && (reviewsRes.data || []).length > 0) {
      generateInsights(productRes.data, reviewsRes.data || []);
    }
    setLoading(false);
  };

  const generateInsights = async (prod: Product | null, revs: Review[]) => {
    if (!prod || revs.length === 0) return;

    const positiveCount = revs.filter(r => r.sentiment === 'positive').length;
    const neutralCount = revs.filter(r => r.sentiment === 'neutral').length;
    const negativeCount = revs.filter(r => r.sentiment === 'negative').length;
    const sentimentScore = ((positiveCount - negativeCount) / revs.length) * 100;
    const avgRating = revs.reduce((sum, r) => sum + r.rating, 0) / revs.length;
    const productScore = Math.min(100, Math.max(0, (avgRating / 5) * 70 + (sentimentScore / 100) * 30));

    const positiveWords = ['great', 'amazing', 'excellent', 'love', 'fantastic', 'awesome', 'perfect', 'best', 'smooth', 'fast', 'easy', 'helpful', 'intuitive', 'powerful', 'reliable'];
    const negativeWords = ['slow', 'bug', 'crash', 'expensive', 'confusing', 'difficult', 'missing', 'broken', 'error', 'frustrating', 'limited', 'clunky', 'unreliable', 'overpriced', 'complicated'];
    const featureWords = ['feature', 'add', 'wish', 'would love', 'need', 'want', 'could', 'should', 'hope', 'request', 'integration', 'api', 'export', 'import', 'mobile', 'dark mode', 'automation'];

    const positiveThemes: string[] = [];
    const commonComplaints: string[] = [];
    const requestedFeatures: string[] = [];

    const allContent = revs.map(r => r.content.toLowerCase());

    positiveWords.forEach(word => {
      const count = allContent.filter(c => c.includes(word)).length;
      if (count >= 2 && positiveThemes.length < 6) positiveThemes.push(word);
    });

    negativeWords.forEach(word => {
      const count = allContent.filter(c => c.includes(word)).length;
      if (count >= 1 && commonComplaints.length < 6) commonComplaints.push(word);
    });

    featureWords.forEach(word => {
      const count = allContent.filter(c => c.includes(word)).length;
      if (count >= 1 && requestedFeatures.length < 6) requestedFeatures.push(word);
    });

    const newInsight = {
      product_id: id!,
      sentiment_score: Math.round(sentimentScore),
      common_complaints: commonComplaints.length > 0 ? commonComplaints : ['Insufficient data'],
      requested_features: requestedFeatures.length > 0 ? requestedFeatures : ['More data needed'],
      product_score: Math.round(productScore),
      positive_themes: positiveThemes.length > 0 ? positiveThemes : ['Growing community'],
    };

    await supabase.from('ai_insights').insert(newInsight);
    setInsight(newInsight as AIInsight);
  };

  if (loading) return <div className="min-h-screen bg-surface-950 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!product) return <div className="min-h-screen bg-surface-950 flex items-center justify-center text-surface-400">Product not found</div>;

  const positiveCount = reviews.filter(r => r.sentiment === 'positive').length;
  const neutralCount = reviews.filter(r => r.sentiment === 'neutral').length;
  const negativeCount = reviews.filter(r => r.sentiment === 'negative').length;

  return (
    <div className="min-h-screen bg-surface-950 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link to={`/product/${id}`} className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-brand-400 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to product
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Insights for {product.name}</h1>
            <p className="text-sm text-surface-400">AI-generated analysis from {reviews.length} reviews</p>
          </div>
        </div>

        {/* AI Summary Card */}
        <div className="glass rounded-2xl p-6 mb-8 border-brand-500/20 glow-brand">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">AI Summary</h2>
          </div>
          {product.ai_summary ? (
            <p className="text-surface-300 leading-relaxed">{product.ai_summary}</p>
          ) : (
            <p className="text-surface-400 leading-relaxed">
              Based on {reviews.length} reviews, {product.name} has an overall rating of {product.rating.toFixed(1)}/5.
              {positiveCount > negativeCount ? ' The majority of users have a positive experience.' : ' Reviews are mixed with some concerns raised.'}
            </p>
          )}
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Product Score */}
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-sm text-surface-400 mb-3">Product Score</div>
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#00e87f" strokeWidth="8"
                  strokeDasharray={`${((insight?.product_score || 0) / 100) * 264} 264`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{insight?.product_score || 0}</span>
              </div>
            </div>
            <div className="text-xs text-surface-500">out of 100</div>
          </div>

          {/* Sentiment Score */}
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-sm text-surface-400 mb-3">Sentiment Score</div>
            <div className="text-4xl font-bold text-white mb-2">{insight?.sentiment_score || 0}</div>
            <div className="flex items-center justify-center gap-1">
              {((insight?.sentiment_score || 0) > 0) ? (
                <TrendingUp className="w-4 h-4 text-brand-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-xs text-surface-500">{((insight?.sentiment_score || 0) > 0) ? 'Positive trend' : 'Mixed sentiment'}</span>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-surface-400 mb-4">Sentiment Breakdown</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ThumbsUp className="w-4 h-4 text-brand-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-surface-300">Positive</span>
                    <span className="text-xs font-semibold text-brand-400">{positiveCount}</span>
                  </div>
                  <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${reviews.length > 0 ? (positiveCount / reviews.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-surface-300">Neutral</span>
                    <span className="text-xs font-semibold text-amber-400">{neutralCount}</span>
                  </div>
                  <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${reviews.length > 0 ? (neutralCount / reviews.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThumbsDown className="w-4 h-4 text-red-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-surface-300">Negative</span>
                    <span className="text-xs font-semibold text-red-400">{negativeCount}</span>
                  </div>
                  <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${reviews.length > 0 ? (negativeCount / reviews.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Common Complaints */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Common Complaints</h3>
            </div>
            {(insight?.common_complaints || []).length > 0 && insight?.common_complaints?.[0] !== 'Insufficient data' ? (
              <div className="space-y-2.5">
                {insight?.common_complaints?.map((complaint, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-surface-300 capitalize">{complaint}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-500">Not enough data to identify complaints</p>
            )}
          </div>

          {/* Requested Features */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-brand-400" />
              <h3 className="text-lg font-semibold text-white">Most Requested Features</h3>
            </div>
            {(insight?.requested_features || []).length > 0 && insight?.requested_features?.[0] !== 'More data needed' ? (
              <div className="space-y-2.5">
                {insight?.requested_features?.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-brand-500/5 border border-brand-500/10 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <span className="text-sm text-surface-300 capitalize">{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-500">Not enough data to identify feature requests</p>
            )}
          </div>

          {/* Positive Themes */}
          <div className="glass rounded-xl p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h3 className="text-lg font-semibold text-white">Positive Themes</h3>
            </div>
            {(insight?.positive_themes || []).length > 0 && insight?.positive_themes?.[0] !== 'Growing community' ? (
              <div className="flex flex-wrap gap-2">
                {insight?.positive_themes?.map((theme, i) => (
                  <Badge key={i} variant="brand" size="md">{theme}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-500">Growing community of users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
