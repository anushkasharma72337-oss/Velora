# Frontend Integration Guide - PS Feedback Platform

## Overview

This guide covers integrating the existing React frontend with the FastAPI backend and Supabase database.

---

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [Supabase Client Integration](#supabase-client-integration)
3. [Authentication Flow](#authentication-flow)
4. [API Communication](#api-communication)
5. [State Management](#state-management)
6. [Component Integration](#component-integration)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Environment Setup

### 1. Configure Environment Variables

Create `src/.env.local`:

```env
# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# API Backend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=30000

# Features
REACT_APP_ENABLE_DEMO=false
REACT_APP_ENV=development
```

### 2. Install Dependencies

```bash
# Supabase client
npm install @supabase/supabase-js

# HTTP client
npm install axios

# State management (if not using Context)
npm install zustand  # or: recoil, jotai

# Additional utilities
npm install lodash-es date-fns
```

---

## Supabase Client Integration

### Create Supabase Client

**src/lib/supabase.ts**:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Database = any; // Replace with your generated types
```

### Configure Supabase Types (Optional but Recommended)

```bash
# Generate types from your schema
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

---

## Authentication Flow

### Create Auth Context

**src/context/AuthContext.tsx**:

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole(session.user.user_metadata?.role || 'user');
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setUserRole(session.user.user_metadata?.role || 'user');
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'user',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      userRole,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### OAuth Callback Handler

**src/pages/AuthCallback.tsx**:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth redirect
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth error:', error);
        navigate('/login?error=auth_failed');
        return;
      }

      if (data.session) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Completing authentication...</p>
    </div>
  );
}
```

---

## API Communication

### Create API Client

**src/lib/api.ts**:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '30000');

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token to requests
    this.client.interceptors.request.use(async (config) => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          supabase.auth.signOut();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(email: string, password: string, fullName: string) {
    return this.client.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    });
  }

  async getProfile() {
    return this.client.get('/api/auth/me');
  }

  async updateProfile(data: any) {
    return this.client.put('/api/auth/me', data);
  }

  // Products
  async getProducts(params?: any) {
    return this.client.get('/api/products', { params });
  }

  async getProduct(id: number) {
    return this.client.get(`/api/products/${id}`);
  }

  async createProduct(data: any) {
    return this.client.post('/api/products', data);
  }

  async updateProduct(id: number, data: any) {
    return this.client.put(`/api/products/${id}`, data);
  }

  async deleteProduct(id: number) {
    return this.client.delete(`/api/products/${id}`);
  }

  async saveProduct(id: number) {
    return this.client.post(`/api/products/${id}/save`);
  }

  async getSavedProducts() {
    return this.client.get('/api/products/saved');
  }

  // Categories
  async getCategories() {
    return this.client.get('/api/categories');
  }

  // Reviews
  async getProductReviews(productId: number, params?: any) {
    return this.client.get(`/api/products/${productId}/reviews`, { params });
  }

  async createReview(data: any) {
    return this.client.post('/api/reviews', data);
  }

  async updateReview(id: number, data: any) {
    return this.client.put(`/api/reviews/${id}`, data);
  }

  async deleteReview(id: number) {
    return this.client.delete(`/api/reviews/${id}`);
  }

  // Comments
  async getReviewComments(reviewId: number) {
    return this.client.get(`/api/reviews/${reviewId}/comments`);
  }

  async createComment(data: any) {
    return this.client.post('/api/comments', data);
  }

  async updateComment(id: number, data: any) {
    return this.client.put(`/api/comments/${id}`, data);
  }

  async deleteComment(id: number) {
    return this.client.delete(`/api/comments/${id}`);
  }

  async flagComment(id: number, reason: string) {
    return this.client.post(`/api/comments/${id}/flag`, { reason });
  }

  // Votes
  async voteReview(reviewId: number, voteType: 'helpful' | 'unhelpful') {
    return this.client.post('/api/votes', {
      review_id: reviewId,
      vote_type: voteType,
    });
  }

  async removeVote(voteId: number) {
    return this.client.delete(`/api/votes/${voteId}`);
  }

  // Admin
  async getFlaggedItems() {
    return this.client.get('/api/admin/flagged');
  }

  async moderateFlaggedItem(id: number, action: string) {
    return this.client.put(`/api/admin/flagged/${id}`, { action });
  }

  async featureProduct(id: number) {
    return this.client.put(`/api/admin/products/${id}`, { is_featured: true });
  }
}

export const api = new APIClient();
```

---

## State Management

### Using Zustand (Recommended)

**src/store/appStore.ts**:

```typescript
import { create } from 'zustand';
import { api } from '../lib/api';

interface AppState {
  // Products
  products: any[];
  currentProduct: any | null;
  loadingProducts: boolean;

  // Reviews
  reviews: any[];
  loadingReviews: boolean;

  // UI
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  fetchProductReviews: (productId: number) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const useAppStore = create<AppState>((set) => ({
  products: [],
  currentProduct: null,
  loadingProducts: false,
  reviews: [],
  loadingReviews: false,
  toast: null,

  fetchProducts: async () => {
    set({ loadingProducts: true });
    try {
      const response = await api.getProducts();
      set({ products: response.data });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      set({ loadingProducts: false });
    }
  },

  fetchProduct: async (id: number) => {
    try {
      const response = await api.getProduct(id);
      set({ currentProduct: response.data });
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  },

  fetchProductReviews: async (productId: number) => {
    set({ loadingReviews: true });
    try {
      const response = await api.getProductReviews(productId);
      set({ reviews: response.data });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      set({ loadingReviews: false });
    }
  },

  showToast: (message: string, type: 'success' | 'error' | 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
}));
```

---

## Component Integration

### Protected Route Component

**src/components/ProtectedRoute.tsx**:

```typescript
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/login" />;

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
```

### Product Card Component

**src/components/ProductCard.tsx** (Updated):

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProductCardProps {
  product: any;
  onSaved?: () => void;
}

export function ProductCard({ product, onSaved }: ProductCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      await api.saveProduct(product.id);
      setIsSaved(true);
      onSaved?.();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <img
        src={product.logo_url || '/placeholder.png'}
        alt={product.name}
        className="w-full h-40 object-cover rounded"
      />

      <h3 className="mt-2 font-bold text-lg">{product.name}</h3>
      <p className="text-gray-600 text-sm mt-1">{product.tagline}</p>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">★</span>
          <span className="font-semibold">{product.average_rating}</span>
          <span className="text-gray-500 text-sm">({product.review_count})</span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            isSaved
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? <LoadingSpinner size="sm" /> : isSaved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <button
        onClick={() => navigate(`/products/${product.id}`)}
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        View Details
      </button>
    </div>
  );
}
```

### Review Form Component

**src/components/ReviewForm.tsx** (New):

```typescript
import { useState } from 'react';
import { api } from '../lib/api';
import { StarRating } from './ui/StarRating';

interface ReviewFormProps {
  productId: number;
  onSubmit: () => void;
}

export function ReviewForm({ productId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createReview({
        product_id: productId,
        rating,
        title,
        content,
      });

      // Reset form
      setRating(5);
      setTitle('');
      setContent('');
      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-bold text-lg">Leave a Review</h3>

      <div>
        <label className="block font-medium mb-2">Rating</label>
        <StarRating
          value={rating}
          onChange={setRating}
          size="lg"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
          placeholder="Great product!"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          className="w-full border rounded px-3 py-2"
          placeholder="Share your thoughts..."
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
```

---

## Error Handling

### Error Boundary

**src/components/ErrorBoundary.tsx**:

```typescript
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 rounded">
          <h2 className="font-bold text-red-800">Something went wrong</h2>
          <p className="text-red-700">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Handler

**src/lib/errorHandler.ts**:

```typescript
import { AxiosError } from 'axios';

export function getErrorMessage(error: any): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function isAuthError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

export function isForbiddenError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 403;
  }
  return false;
}
```

---

## Testing

### Setup Testing

```bash
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

### Test Example

**src/components/__tests__/ProductCard.test.tsx**:

```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  tagline: 'A great product',
  logo_url: 'https://example.com/logo.png',
  average_rating: 4.5,
  review_count: 10,
};

test('renders product card', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText('Test Product')).toBeInTheDocument();
  expect(screen.getByText('A great product')).toBeInTheDocument();
});
```

---

## Checklist

- [ ] Environment variables configured
- [ ] Supabase client initialized
- [ ] Auth context provider added to root
- [ ] API client created and tested
- [ ] Protected routes implemented
- [ ] Product listing works
- [ ] User can login/signup
- [ ] Reviews can be created
- [ ] Storage uploads working
- [ ] Error handling implemented
- [ ] Tests passing
- [ ] Types generated (optional)

---

**Frontend integration complete!** 🚀
