-- ============================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- PS FEEDBACK PLATFORM
-- ============================================

-- ============================================
-- USERS RLS POLICIES
-- ============================================

-- Users can view their own profile and public user info
CREATE POLICY "Users can view public user profiles"
ON users FOR SELECT
USING (
    auth.uid() IS NOT NULL OR
    is_active = true
);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Admins can view all user profiles
CREATE POLICY "Admins can view all user profiles"
ON users FOR SELECT
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admins can update any user profile
CREATE POLICY "Admins can update any user profile"
ON users FOR UPDATE
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);


-- ============================================
-- CATEGORIES RLS POLICIES
-- ============================================

-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- Only admins can create categories
CREATE POLICY "Only admins can create categories"
ON categories FOR INSERT
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Only admins can update categories
CREATE POLICY "Only admins can update categories"
ON categories FOR UPDATE
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Only admins can delete categories
CREATE POLICY "Only admins can delete categories"
ON categories FOR DELETE
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);


-- ============================================
-- PRODUCTS RLS POLICIES
-- ============================================

-- Everyone can view published products
CREATE POLICY "Anyone can view published products"
ON products FOR SELECT
USING (is_published = true OR auth.uid() = user_id);

-- Users can view their own unpublished products
CREATE POLICY "Users can view their own products"
ON products FOR SELECT
USING (auth.uid() = user_id);

-- Founders can create products
CREATE POLICY "Founders can create products"
ON products FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('founder', 'admin')
);

-- Users can update their own products
CREATE POLICY "Users can update their own products"
ON products FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own products
CREATE POLICY "Users can delete their own products"
ON products FOR DELETE
USING (auth.uid() = user_id);

-- Admins can update any product
CREATE POLICY "Admins can update any product"
ON products FOR UPDATE
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admins can delete any product
CREATE POLICY "Admins can delete any product"
ON products FOR DELETE
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);


-- ============================================
-- REVIEWS RLS POLICIES
-- ============================================

-- Everyone can view non-deleted, non-flagged reviews
CREATE POLICY "Anyone can view published reviews"
ON reviews FOR SELECT
USING (
    deleted_at IS NULL AND
    (is_flagged = false OR auth.uid() = user_id OR
     (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
);

-- Users can create reviews (only one per product)
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- Admins can flag/unflag reviews and update
CREATE POLICY "Admins can moderate reviews"
ON reviews FOR UPDATE
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admins can delete any review
CREATE POLICY "Admins can delete any review"
ON reviews FOR DELETE
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);


-- ============================================
-- RATINGS RLS POLICIES
-- ============================================

-- Users can view ratings for published products
CREATE POLICY "Users can view ratings for published products"
ON ratings FOR SELECT
USING (
    (SELECT is_published FROM products WHERE id = product_id) = true OR
    auth.uid() = user_id
);

-- Users can create/update their own ratings
CREATE POLICY "Users can create ratings"
ON ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON ratings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
ON ratings FOR DELETE
USING (auth.uid() = user_id);


-- ============================================
-- COMMENTS RLS POLICIES
-- ============================================

-- Anyone can view comments on public reviews
CREATE POLICY "Anyone can view comments on public reviews"
ON comments FOR SELECT
USING (
    deleted_at IS NULL AND
    (is_flagged = false OR auth.uid() = user_id OR
     (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
);

-- Users can create comments
CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- Admins can moderate comments
CREATE POLICY "Admins can moderate comments"
ON comments FOR UPDATE
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);


-- ============================================
-- UPVOTES RLS POLICIES
-- ============================================

-- Anyone can view vote aggregates (handled in views)
-- Users can create/update their own votes
CREATE POLICY "Users can create upvotes"
ON upvotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own upvotes"
ON upvotes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own upvotes"
ON upvotes FOR DELETE
USING (auth.uid() = user_id);


-- ============================================
-- BOOKMARKS RLS POLICIES
-- ============================================

-- Users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid() = user_id);

-- Users can create bookmarks
CREATE POLICY "Users can create bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE
USING (auth.uid() = user_id);


-- ============================================
-- PRODUCT TAGS RLS POLICIES
-- ============================================

-- Anyone can view product tags
CREATE POLICY "Anyone can view product tags"
ON product_tags FOR SELECT
USING (
    (SELECT is_published FROM products WHERE id = product_id) = true OR
    (SELECT user_id FROM products WHERE id = product_id) = auth.uid()
);

-- Only product owners and admins can manage tags
CREATE POLICY "Product owners can manage tags"
ON product_tags FOR INSERT
WITH CHECK (
    (SELECT user_id FROM products WHERE id = product_id) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Product owners can delete tags"
ON product_tags FOR DELETE
USING (
    (SELECT user_id FROM products WHERE id = product_id) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);


-- ============================================
-- ACTIVITY LOGS RLS POLICIES
-- ============================================

-- Users can view their own activity
CREATE POLICY "Users can view their own activity"
ON activity_logs FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON activity_logs FOR SELECT
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Activity logs are auto-created by triggers (prevent direct insertion)
CREATE POLICY "Only system can insert activity logs"
ON activity_logs FOR INSERT
WITH CHECK (false);


-- ============================================
-- PRODUCT IMAGES RLS POLICIES
-- ============================================

-- Anyone can view images for published products
CREATE POLICY "Anyone can view product images for published products"
ON product_images FOR SELECT
USING (
    (SELECT is_published FROM products WHERE id = product_id) = true OR
    (SELECT user_id FROM products WHERE id = product_id) = auth.uid()
);

-- Only product owners can manage images
CREATE POLICY "Product owners can manage images"
ON product_images FOR INSERT
WITH CHECK (
    (SELECT user_id FROM products WHERE id = product_id) = auth.uid()
);

CREATE POLICY "Product owners can update images"
ON product_images FOR UPDATE
USING (
    (SELECT user_id FROM products WHERE id = product_id) = auth.uid()
)
WITH CHECK (
    (SELECT user_id FROM products WHERE id = product_id) = auth.uid()
);

CREATE POLICY "Product owners can delete images"
ON product_images FOR DELETE
USING (
    (SELECT user_id FROM products WHERE id = product_id) = auth.uid()
);

-- Admins can manage any product images
CREATE POLICY "Admins can manage any product images"
ON product_images FOR ALL
USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
