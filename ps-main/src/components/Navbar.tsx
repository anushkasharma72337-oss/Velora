import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LayoutDashboard, LogOut, Menu, X, User, Shield, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isFounder = profile?.is_founder;
  const isAdmin = profile?.is_admin;

  const navLinks = [
    { path: '/', label: 'Explore' },
    ...(user ? [{ path: '/dashboard', label: 'Dashboard' }] : []),
    ...(isFounder ? [{ path: '/founder', label: 'Founder', icon: Plus }] : []),
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight hidden sm:block">LaunchPad</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive(link.path)
                  ? 'text-brand-400 bg-brand-500/10'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
              }`}
            >
              {link.icon && <link.icon className="w-3.5 h-3.5" />}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg hover:bg-surface-800/50 transition"
              >
                <div className="w-7 h-7 bg-brand-600/30 rounded-full flex items-center justify-center text-xs font-bold text-brand-400">
                  {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-surface-300 max-w-[100px] truncate">{profile?.username || profile?.full_name || 'User'}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-surface-300 hover:text-white transition">
                Sign in
              </Link>
              <Link to="/login" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-brand-600/20">
                Get started
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-surface-400 hover:text-white">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-surface-950 border-b border-surface-800 px-4 pb-4 space-y-1 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-surface-300 hover:bg-surface-800 transition"
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.label}
            </Link>
          ))}
          <div className="border-t border-surface-800 pt-2 mt-2">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-surface-300 hover:bg-surface-800">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-brand-400 font-semibold">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
