/*
  # Expand schema for AI-powered startup feedback platform

  1. Modified Tables
    - `profiles` - Add username, bio, is_founder, is_admin columns
    - `products` - Add founder_id, website_url, demo_url, screenshots, tags, upvotes, downvotes, status, ai_score, ai_summary columns
    - `reviews` - Add sentiment, is_flagged columns

  2. New Tables
    - `comments` - id, product_id, user_id, parent_id, content, created_at
    - `saved_products` - id, user_id, product_id, created_at
    - `votes` - id, user_id, product_id, vote_type (up/down), created_at
    - `ai_insights` - id, product_id, sentiment_score, common_complaints, requested_features, product_score, generated_at

  3. Security
    - Enable RLS on all new tables
    - Appropriate policies for each table
*/

-- Add columns to profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username text UNIQUE DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_founder') THEN
    ALTER TABLE profiles ADD COLUMN is_founder boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Add columns to products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'founder_id') THEN
    ALTER TABLE products ADD COLUMN founder_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'website_url') THEN
    ALTER TABLE products ADD COLUMN website_url text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'demo_url') THEN
    ALTER TABLE products ADD COLUMN demo_url text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'screenshots') THEN
    ALTER TABLE products ADD COLUMN screenshots text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
    ALTER TABLE products ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'upvotes') THEN
    ALTER TABLE products ADD COLUMN upvotes integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'downvotes') THEN
    ALTER TABLE products ADD COLUMN downvotes integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
    ALTER TABLE products ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'flagged', 'removed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ai_score') THEN
    ALTER TABLE products ADD COLUMN ai_score numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ai_summary') THEN
    ALTER TABLE products ADD COLUMN ai_summary text DEFAULT '';
  END IF;
END $$;

-- Add columns to reviews
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'sentiment') THEN
    ALTER TABLE reviews ADD COLUMN sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_flagged') THEN
    ALTER TABLE reviews ADD COLUMN is_flagged boolean DEFAULT false;
  END IF;
END $$;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved products table
CREATE TABLE IF NOT EXISTS saved_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved products"
  ON saved_products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save products"
  ON saved_products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave products"
  ON saved_products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sentiment_score numeric DEFAULT 0,
  common_complaints text[] DEFAULT '{}',
  requested_features text[] DEFAULT '{}',
  product_score numeric DEFAULT 0,
  positive_themes text[] DEFAULT '{}',
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view AI insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert AI insights"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_founder_id ON products(founder_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_comments_product_id ON comments(product_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_product ON votes(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_user ON saved_products(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_product ON ai_insights(product_id);
