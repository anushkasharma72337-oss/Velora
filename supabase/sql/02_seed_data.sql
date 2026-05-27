-- ============================================
-- SUPABASE SEED DATA
-- PS FEEDBACK PLATFORM
-- Insert sample data for development
-- ============================================

-- ============================================
-- SEED CATEGORIES
-- ============================================

INSERT INTO categories (name, slug, description, icon_url, color_code, display_order, is_featured)
VALUES
  ('SaaS', 'saas', 'Software as a Service products', 'https://api.iconify.design/mdi:cloud-outline.svg', '#3B82F6', 1, true),
  ('Mobile', 'mobile', 'Mobile applications for iOS and Android', 'https://api.iconify.design/mdi:phone.svg', '#8B5CF6', 2, true),
  ('Web App', 'web-app', 'Web-based applications and tools', 'https://api.iconify.design/mdi:globe.svg', '#10B981', 3, false),
  ('AI/ML', 'ai-ml', 'Artificial Intelligence and Machine Learning solutions', 'https://api.iconify.design/mdi:brain.svg', '#F59E0B', 4, true),
  ('Developer Tools', 'dev-tools', 'Tools for developers and engineers', 'https://api.iconify.design/mdi:hammer-wrench.svg', '#EF4444', 5, false),
  ('Analytics', 'analytics', 'Data analytics and business intelligence', 'https://api.iconify.design/mdi:chart-line.svg', '#06B6D4', 6, false),
  ('Security', 'security', 'Security and privacy solutions', 'https://api.iconify.design/mdi:shield.svg', '#EC4899', 7, false),
  ('E-commerce', 'ecommerce', 'Online shopping and commerce platforms', 'https://api.iconify.design/mdi:shopping.svg', '#A855F7', 8, false);

-- ============================================
-- SEED SAMPLE USERS (via Supabase Auth)
-- Note: These would normally be created through the auth flow
-- This is for demonstration only
-- ============================================

-- For production, use the Supabase Auth UI or API
-- INSERT would fail due to RLS policy requiring auth.uid()

-- Example of user metadata when created:
-- {
--   "full_name": "John Smith",
--   "role": "founder",
--   "avatar_url": "https://example.com/avatar.jpg"
-- }

-- ============================================
-- SEED SAMPLE PRODUCTS
-- ============================================

-- Note: Replace {user_id} with actual UUIDs from auth.users table
-- These are example products for testing the schema

/*
INSERT INTO products (user_id, category_id, name, slug, description, logo_url, website_url, demo_url, tagline, is_published, is_featured, is_trending)
VALUES
  (
    (SELECT id FROM users WHERE email = 'founder1@example.com' LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'saas' LIMIT 1),
    'ProductFlow',
    'productflow',
    'An intelligent product feedback and feature request management platform designed specifically for startup founders.',
    'https://example.com/productflow-logo.png',
    'https://productflow.io',
    'https://demo.productflow.io',
    'Collect, organize, and prioritize customer feedback',
    true,
    true,
    true
  ),
  (
    (SELECT id FROM users WHERE email = 'founder2@example.com' LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'ai-ml' LIMIT 1),
    'AnalyticsAI',
    'analyticsai',
    'AI-powered analytics platform that automatically generates insights from your business data.',
    'https://example.com/analyticsai-logo.png',
    'https://analyticsai.io',
    'https://demo.analyticsai.io',
    'Understand your data with AI',
    true,
    true,
    false
  );
*/

-- ============================================
-- USEFUL SEED DATA QUERIES
-- ============================================

-- To insert actual products, first create users via Supabase Auth, then:

-- 1. Create a category first
-- INSERT INTO categories (name, slug, description)
-- VALUES ('New Category', 'new-category', 'Description');

-- 2. Create a user profile (triggered on auth.users creation)
-- User profile auto-created via trigger when auth.users row is inserted

-- 3. Create a product
-- INSERT INTO products (user_id, category_id, name, slug, description, is_published)
-- VALUES (
--   auth.uid(),  -- Currently authenticated user
--   1,           -- Category ID
--   'My Product',
--   'my-product',
--   'Product description',
--   true
-- );

-- 4. Create a review
-- INSERT INTO reviews (product_id, user_id, rating, title, content)
-- VALUES (
--   1,  -- Product ID
--   auth.uid(),  -- Reviewer ID
--   5,
--   'Great product!',
--   'This product has been a game changer for our business.'
-- );

-- 5. Create a bookmark
-- INSERT INTO bookmarks (product_id, user_id)
-- VALUES (1, auth.uid());

-- 6. Vote on a review
-- INSERT INTO upvotes (review_id, user_id, vote_type)
-- VALUES (1, auth.uid(), 'helpful');

-- ============================================
-- VERIFY SCHEMA
-- ============================================

-- Run these queries to verify the schema is correct:

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- List all indexes
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

-- List all RLS policies
-- SELECT tablename, policyname FROM pg_policies ORDER BY tablename, policyname;

-- Check table sizes
-- SELECT
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- NOTES FOR SEED DATA
-- ============================================

/*
1. Categories are pre-seeded above for immediate use

2. Users and Products should be created through:
   - Supabase Auth UI for users
   - Application API endpoints for products
   - RLS policies will ensure proper access control

3. To manually create test data:
   a. Use Supabase Dashboard Auth UI to create test users
   b. Copy their UUIDs
   c. Use them in INSERT statements above (uncommented)

4. For development, use the backend API:
   - POST /api/auth/register - Create user
   - POST /api/products/ - Create product
   - POST /api/reviews/ - Create review
   - etc.

5. RLS policies will automatically:
   - Prevent users from seeing unpublished products of others
   - Allow users to only edit their own content
   - Allow admins to moderate content

6. Triggers will automatically:
   - Update product ratings
   - Track review helpful counts
   - Log user activity
   - Update bookmark counts
*/

-- ============================================
-- SAMPLE ANALYTICS QUERIES
-- ============================================

-- Get popular products
-- SELECT * FROM popular_products LIMIT 10;

-- Get trending products
-- SELECT * FROM trending_products LIMIT 10;

-- Get recent reviews
-- SELECT * FROM recent_reviews LIMIT 20;

-- Get user stats
-- SELECT * FROM user_stats ORDER BY products_count DESC;

-- Get top-rated products
-- SELECT * FROM products
-- WHERE is_published = true
-- ORDER BY average_rating DESC
-- LIMIT 10;

-- Get most reviewed products
-- SELECT * FROM products
-- WHERE is_published = true
-- ORDER BY review_count DESC
-- LIMIT 10;

-- Get user review activity
-- SELECT
--   u.username,
--   COUNT(r.id) as review_count,
--   AVG(r.rating)::NUMERIC(3,2) as avg_rating
-- FROM users u
-- LEFT JOIN reviews r ON u.id = r.user_id
-- GROUP BY u.id, u.username
-- ORDER BY review_count DESC;

-- Get product performance metrics
-- SELECT
--   p.name,
--   p.average_rating,
--   p.review_count,
--   p.view_count,
--   p.bookmark_count,
--   u.username as founder_username
-- FROM products p
-- JOIN users u ON p.user_id = u.id
-- WHERE p.is_published = true
-- ORDER BY p.view_count DESC;
