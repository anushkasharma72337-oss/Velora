import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  role: string;
  is_founder: boolean;
  is_admin: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  features: string[];
  rating: number;
  review_count: number;
  founder_id: string;
  website_url: string;
  demo_url: string;
  screenshots: string[];
  tags: string[];
  upvotes: number;
  downvotes: number;
  status: string;
  ai_score: number;
  ai_summary: string;
  created_at: string;
  profiles?: Profile | null;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  sentiment: string;
  is_flagged: boolean;
  created_at: string;
  profiles?: Profile | null;
  products?: { name: string } | null;
};

export type Comment = {
  id: string;
  product_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  profiles?: Profile | null;
};

export type Vote = {
  id: string;
  user_id: string;
  product_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
};

export type SavedProduct = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type AIInsight = {
  id: string;
  product_id: string;
  sentiment_score: number;
  common_complaints: string[];
  requested_features: string[];
  product_score: number;
  positive_themes: string[];
  generated_at: string;
};
