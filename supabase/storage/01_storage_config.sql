-- ============================================
-- SUPABASE STORAGE CONFIGURATION
-- PS FEEDBACK PLATFORM
-- ============================================

-- This file contains SQL for configuring storage buckets
-- Create buckets via Supabase Dashboard or API

/*
BUCKET CONFIGURATION:

1. Product Logos (product_logos)
   - File Size Limit: 5 MB
   - Allowed MIME Types: image/jpeg, image/png, image/webp, image/svg+xml
   - Public: Yes
   - Path: /products/{product_id}/{filename}

2. Product Images (product_images)
   - File Size Limit: 10 MB
   - Allowed MIME Types: image/jpeg, image/png, image/webp, image/gif
   - Public: Yes
   - Path: /products/{product_id}/images/{filename}

3. User Avatars (avatars)
   - File Size Limit: 5 MB
   - Allowed MIME Types: image/jpeg, image/png, image/webp
   - Public: Yes
   - Path: /avatars/{user_id}/{filename}

4. Category Icons (category_icons)
   - File Size Limit: 2 MB
   - Allowed MIME Types: image/svg+xml, image/png
   - Public: Yes
   - Path: /categories/{category_id}/{filename}

5. Attachments (attachments)
   - File Size Limit: 25 MB
   - Allowed MIME Types: All document types
   - Public: No (private)
   - Path: /attachments/{user_id}/{filename}
*/


-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Product Logos - Anyone can view, owners can upload
CREATE POLICY "Anyone can view product logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product_logos');

CREATE POLICY "Product owners can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product_logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Product owners can delete logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product_logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Product Images - Anyone can view, owners can upload
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product_images');

CREATE POLICY "Product owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Product owners can delete images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- User Avatars - Anyone can view, users can manage their own
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Category Icons - Anyone can view, admins can manage
CREATE POLICY "Anyone can view category icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'category_icons');

CREATE POLICY "Admins can upload category icons"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'category_icons' AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete category icons"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'category_icons' AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Attachments - Users can only access their own
CREATE POLICY "Users can view their own attachments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their attachments"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
