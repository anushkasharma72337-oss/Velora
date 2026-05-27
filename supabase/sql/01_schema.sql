-- ============================================
-- PS FEEDBACK PLATFORM - DATABASE SCHEMA
-- Supabase PostgreSQL Database
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================
-- 1. USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'founder', 'admin')),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    website_url TEXT,
    location TEXT,
    github_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE users IS 'User accounts with roles: user, founder, admin';
COMMENT ON COLUMN users.id IS 'UUID from auth.users';
COMMENT ON COLUMN users.role IS 'User role: user (default), founder, admin';


-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    color_code TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Product categories for organization and filtering';


-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    category_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    demo_url TEXT,
    github_url TEXT,
    documentation_url TEXT,
    twitter_url TEXT,
    tagline TEXT,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    average_rating NUMERIC(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

COMMENT ON TABLE products IS 'Products submitted by founders';
COMMENT ON COLUMN products.average_rating IS 'Calculated average rating from reviews';
COMMENT ON COLUMN products.review_count IS 'Denormalized count of reviews';


-- ============================================
-- 4. REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    ai_summary TEXT,
    ai_sentiment TEXT,
    is_flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, user_id)
);

COMMENT ON TABLE reviews IS 'Product reviews with ratings and feedback';
COMMENT ON COLUMN reviews.rating IS 'Star rating from 1-5';
COMMENT ON COLUMN reviews.ai_summary IS 'AI-generated summary of review';
COMMENT ON COLUMN reviews.is_flagged IS 'Flag for moderation review';


-- ============================================
-- 5. RATINGS TABLE (Separate from reviews)
-- ============================================

CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, user_id)
);

COMMENT ON TABLE ratings IS 'Quick ratings on products without full reviews';


-- ============================================
-- 6. COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE comments IS 'Comments on reviews for discussion';


-- ============================================
-- 7. UPVOTES TABLE (Votes on reviews)
-- ============================================

CREATE TABLE IF NOT EXISTS upvotes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(review_id, user_id)
);

COMMENT ON TABLE upvotes IS 'Helpful/unhelpful votes on reviews';


-- ============================================
-- 8. BOOKMARKS TABLE (Saved products)
-- ============================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, user_id)
);

COMMENT ON TABLE bookmarks IS 'User bookmarked/saved products';


-- ============================================
-- 9. PRODUCT TAGS TABLE (For better filtering)
-- ============================================

CREATE TABLE IF NOT EXISTS product_tags (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(product_id, tag)
);

COMMENT ON TABLE product_tags IS 'Tags for products for flexible categorization';


-- ============================================
-- 10. ACTIVITY LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id BIGINT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE activity_logs IS 'Track user activities for analytics';


-- ============================================
-- 11. PRODUCT_IMAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

COMMENT ON TABLE product_images IS 'Additional images for products';


-- ============================================
-- INDEXES FOR OPTIMIZED QUERIES
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = true;

-- Categories indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_featured ON categories(is_featured);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- Products indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_trending ON products(is_trending);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_average_rating ON products(average_rating DESC);
CREATE INDEX idx_products_user_published ON products(user_id, is_published);
CREATE INDEX idx_products_category_published ON products(category_id, is_published);

-- Reviews indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_is_flagged ON reviews(is_flagged);
CREATE INDEX idx_reviews_product_user ON reviews(product_id, user_id);
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating DESC);

-- Ratings indexes
CREATE INDEX idx_ratings_product_id ON ratings(product_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_score ON ratings(score);

-- Comments indexes
CREATE INDEX idx_comments_review_id ON comments(review_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_is_flagged ON comments(is_flagged);

-- Upvotes indexes
CREATE INDEX idx_upvotes_review_id ON upvotes(review_id);
CREATE INDEX idx_upvotes_user_id ON upvotes(user_id);
CREATE INDEX idx_upvotes_vote_type ON upvotes(vote_type);

-- Bookmarks indexes
CREATE INDEX idx_bookmarks_product_id ON bookmarks(product_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Product tags indexes
CREATE INDEX idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON product_tags(tag);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Product images indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);


-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER product_images_created_at BEFORE UPDATE ON product_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================

-- Update product rating and review count
CREATE OR REPLACE FUNCTION update_product_stats(p_product_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE products SET
        average_rating = COALESCE((
            SELECT AVG(rating)::NUMERIC(3,2)
            FROM reviews
            WHERE product_id = p_product_id AND deleted_at IS NULL
        ), 0.0),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE product_id = p_product_id AND deleted_at IS NULL
        ),
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Update review helpful/unhelpful counts
CREATE OR REPLACE FUNCTION update_review_vote_counts(p_review_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE reviews SET
        helpful_count = (
            SELECT COUNT(*)
            FROM upvotes
            WHERE review_id = p_review_id AND vote_type = 'helpful'
        ),
        unhelpful_count = (
            SELECT COUNT(*)
            FROM upvotes
            WHERE review_id = p_review_id AND vote_type = 'unhelpful'
        ),
        updated_at = NOW()
    WHERE id = p_review_id;
END;
$$ LANGUAGE plpgsql;

-- Add activity log entry
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id BIGINT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details)
    VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- TRIGGERS FOR BUSINESS LOGIC
-- ============================================

-- Update product stats when review is created/updated/deleted
CREATE OR REPLACE FUNCTION handle_review_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_product_stats(OLD.product_id);
    ELSE
        PERFORM update_product_stats(NEW.product_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_change_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION handle_review_change();

-- Update bookmark count when bookmarked
CREATE OR REPLACE FUNCTION handle_bookmark_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products SET bookmark_count = bookmark_count + 1 WHERE id = NEW.product_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookmarks_update_count
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION handle_bookmark_change();

-- Log activity on review changes
CREATE OR REPLACE FUNCTION log_review_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_activity(NEW.user_id, 'created_review', 'review', NEW.id);
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_activity(NEW.user_id, 'updated_review', 'review', NEW.id);
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_activity(OLD.user_id, 'deleted_review', 'review', OLD.id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_log_activity
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION log_review_activity();


-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Popular products view
CREATE OR REPLACE VIEW popular_products AS
SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.logo_url,
    p.average_rating,
    p.review_count,
    p.bookmark_count,
    p.view_count,
    u.username,
    u.full_name,
    c.name as category_name,
    p.created_at,
    p.published_at
FROM products p
JOIN users u ON p.user_id = u.id
JOIN categories c ON p.category_id = c.id
WHERE p.is_published = true AND p.deleted_at IS NULL
ORDER BY p.view_count DESC, p.average_rating DESC;

-- Trending products view
CREATE OR REPLACE VIEW trending_products AS
SELECT
    p.id,
    p.name,
    p.slug,
    p.average_rating,
    p.review_count,
    p.bookmark_count,
    p.is_trending,
    u.username,
    c.name as category_name,
    p.created_at
FROM products p
JOIN users u ON p.user_id = u.id
JOIN categories c ON p.category_id = c.id
WHERE p.is_published = true AND p.is_trending = true
ORDER BY p.created_at DESC;

-- Recent reviews view
CREATE OR REPLACE VIEW recent_reviews AS
SELECT
    r.id,
    r.product_id,
    r.rating,
    r.title,
    r.content,
    r.helpful_count,
    r.unhelpful_count,
    u.username,
    u.avatar_url,
    p.name as product_name,
    p.slug as product_slug,
    r.created_at
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN products p ON r.product_id = p.id
WHERE r.deleted_at IS NULL
ORDER BY r.created_at DESC;

-- User stats view
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.username,
    u.full_name,
    COUNT(DISTINCT p.id) as products_count,
    COUNT(DISTINCT r.id) as reviews_count,
    COUNT(DISTINCT b.id) as bookmarks_count,
    u.created_at
FROM users u
LEFT JOIN products p ON u.id = p.user_id AND p.deleted_at IS NULL
LEFT JOIN reviews r ON u.id = r.user_id AND r.deleted_at IS NULL
LEFT JOIN bookmarks b ON u.id = b.user_id
GROUP BY u.id;

COMMENT ON VIEW popular_products IS 'Products ordered by popularity metrics';
COMMENT ON VIEW trending_products IS 'Recently trending products';
COMMENT ON VIEW recent_reviews IS 'Most recent reviews';
COMMENT ON VIEW user_stats IS 'User statistics and activity counts';


-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE users IS 'Users table with RLS enabled';
COMMENT ON TABLE products IS 'Products table with RLS enabled';
