import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Zap, AtSign } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password, fullName, username);
      if (error) setError(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">LaunchPad</span>
          </div>
          <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Where startups<br />meet real feedback
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-md mb-12">
            Launch your product, get authentic reviews, and let AI transform feedback into actionable insights.
          </p>
          <div className="flex gap-10">
            {[
              { value: '2.4K+', label: 'Products' },
              { value: '18K+', label: 'Reviews' },
              { value: '9.2K+', label: 'Members' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-sm text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">LaunchPad</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-surface-400 mb-8">
            {isLogin ? 'Sign in to access your dashboard' : 'Join the community of innovators'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Google Auth */}
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 glass hover:bg-surface-800/50 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-surface-800" />
            <span className="text-xs text-surface-500 uppercase">or</span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-800 rounded-xl text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-800 rounded-xl text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-800 rounded-xl text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-800 rounded-xl text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-50 group"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-surface-400 hover:text-brand-400 transition text-sm"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-semibold text-brand-500">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
