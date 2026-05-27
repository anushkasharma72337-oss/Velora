import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import AnimatedSection from '../components/ui/AnimatedSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Search, SlidersHorizontal, TrendingUp, Sparkles, Shield, Globe,
  ArrowRight, Brain, BarChart3, Users, ChevronRight, Cpu, Rocket, Layers
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'ai', label: 'AI / ML', icon: Brain },
  { id: 'saas', label: 'SaaS', icon: BarChart3 },
  { id: 'fintech', label: 'Fintech', icon: TrendingUp },
  { id: 'devtools', label: 'Dev Tools', icon: Cpu },
  { id: 'health', label: 'Health', icon: Shield },
];

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, profiles(full_name, username, avatar_url)')
      .eq('status', 'active')
      .order('upvotes', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const trending = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Hero */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/3 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-brand-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Startup Feedback Platform
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Discover. Review.<br />
              <span className="gradient-text">AI Analyzes.</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="text-base sm:text-lg text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The platform where founders launch products, users share honest feedback,
              and AI transforms reviews into actionable insights.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/login"
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 flex items-center gap-2 group"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 glass hover:bg-surface-800/50 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                <Rocket className="w-5 h-5 text-brand-400" />
                Launch Your Startup
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <div className="flex items-center justify-center gap-8 sm:gap-16">
              {[
                { icon: TrendingUp, label: 'Products', value: `${products.length}+` },
                { icon: Users, label: 'Reviewers', value: '12K+' },
                { icon: Globe, label: 'Countries', value: '90+' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <Icon className="w-5 h-5 text-brand-500 mb-1" />
                  <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
                  <div className="text-[10px] text-surface-500 uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Trending Startups */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-brand-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Trending Now</h2>
              </div>
              <Link to="/" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((product, i) => (
              <AnimatedSection key={product.id} delay={i * 100}>
                <ProductCard product={product} />
              </AnimatedSection>
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 border-t border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-surface-400 max-w-xl mx-auto">Three simple steps to launch, review, and improve</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Rocket, title: 'Launch Your Product', desc: 'Founders upload their startup with details, screenshots, and demo links to get visibility.' },
              { step: '02', icon: Users, title: 'Get Authentic Reviews', desc: 'Real users test your product and share detailed feedback with ratings and comments.' },
              { step: '03', icon: Brain, title: 'AI-Powered Insights', desc: 'Our AI analyzes all reviews to surface sentiment, complaints, and feature requests.' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <AnimatedSection key={step} delay={i * 150}>
                <div className="relative glass rounded-2xl p-8 hover:border-brand-500/30 transition-all group">
                  <div className="absolute top-4 right-4 text-5xl font-black text-surface-800/50 group-hover:text-brand-500/10 transition-colors">{step}</div>
                  <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-500/20 transition">
                    <Icon className="w-7 h-7 text-brand-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 border-t border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Browse by Category</h2>
              <p className="text-surface-400 max-w-xl mx-auto">Find the best products across every startup vertical</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.filter(c => c.id !== 'all').map((cat, i) => {
              const Icon = cat.icon;
              return (
                <AnimatedSection key={cat.id} delay={i * 80}>
                  <button
                    onClick={() => { setActiveCategory(cat.id); window.scrollTo({ top: 600, behavior: 'smooth' }); }}
                    className="w-full glass rounded-xl p-5 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group text-center"
                  >
                    <Icon className="w-8 h-8 text-brand-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-semibold text-white">{cat.label}</div>
                    <div className="text-xs text-surface-500 mt-1">
                      {products.filter(p => p.category === cat.id).length} products
                    </div>
                  </button>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-white">All Products</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-800 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
              />
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-surface-500" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile category filter */}
        <div className="flex lg:hidden items-center gap-1.5 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap flex items-center gap-1 ${activeCategory === cat.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-800 text-surface-400 hover:text-white'
                  }`}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-surface-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-surface-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <AnimatedSection>
            <div className="glass rounded-3xl p-10 sm:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-cyan-500/5" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to launch?</h2>
                <p className="text-surface-400 mb-8 max-w-lg mx-auto">
                  Join thousands of founders who use LaunchPad to get real feedback and AI-powered insights.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/login"
                    className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/25 flex items-center gap-2 group"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">2026 LaunchPad. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-surface-500 hover:text-surface-300 transition">Privacy</a>
            <a href="#" className="text-sm text-surface-500 hover:text-surface-300 transition">Terms</a>
            <a href="#" className="text-sm text-surface-500 hover:text-surface-300 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
