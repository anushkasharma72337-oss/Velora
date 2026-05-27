"""
API Usage Examples

This file contains example requests for the API endpoints.
"""

# ==================== Authentication ====================

# Register a new user
# POST /api/auth/register
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "full_name": "John Doe",
    "role": "user"
}

# Login
# POST /api/auth/login
{
    "email": "john@example.com",
    "password": "securepassword123"
}

# Response
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
}

# Get current user
# GET /api/auth/me
# Headers: Authorization: Bearer {access_token}

# Update profile
# PUT /api/auth/me
{
    "full_name": "John Doe Updated",
    "bio": "Founder and product enthusiast",
    "avatar_url": "https://example.com/avatar.jpg"
}


# ==================== Products ====================

# Get all products
# GET /api/products?skip=0&limit=10&category_id=1

# Create product (founder)
# POST /api/products/
{
    "name": "My Awesome Product",
    "slug": "my-awesome-product",
    "description": "This is an amazing SaaS product",
    "logo_url": "https://example.com/logo.png",
    "website_url": "https://myproduct.com",
    "category_id": 1
}

# Get product by ID
# GET /api/products/1

# Get product by slug
# GET /api/products/slug/my-awesome-product

# Update product
# PUT /api/products/1
{
    "name": "My Updated Product",
    "description": "Updated description",
    "is_published": true
}

# Delete product
# DELETE /api/products/1

# Save product
# POST /api/products/1/save

# Get saved products
# GET /api/products/saved?skip=0&limit=10

# Unsave product
# DELETE /api/products/1/save


# ==================== Reviews ====================

# Create review
# POST /api/reviews?product_id=1
{
    "title": "Great product!",
    "content": "This product has been game-changing for our business...",
    "rating": 5
}

# Get product reviews
# GET /api/reviews/product/1?skip=0&limit=10

# Get review details
# GET /api/reviews/1

# Update review
# PUT /api/reviews/1
{
    "title": "Still great!",
    "content": "Updated review content",
    "rating": 4
}

# Delete review
# DELETE /api/reviews/1

# Rate product
# POST /api/reviews/rating
{
    "product_id": 1,
    "score": 5
}

# Get user rating for product
# GET /api/reviews/rating/1

# Delete rating
# DELETE /api/reviews/rating/1


# ==================== Comments ====================

# Create comment on review
# POST /api/comments?review_id=1
{
    "content": "I agree with this review!"
}

# Get review comments
# GET /api/reviews/1/comments?skip=0&limit=10

# Update comment
# PUT /api/comments/1
{
    "content": "Updated comment content"
}

# Delete comment
# DELETE /api/comments/1

# Flag comment for moderation
# POST /api/comments/1/flag


# ==================== Votes ====================

# Vote on review (upvote)
# POST /api/votes
{
    "review_id": 1,
    "vote_type": "upvote"
}

# Vote on review (downvote)
# POST /api/votes
{
    "review_id": 1,
    "vote_type": "downvote"
}

# Get user vote on review
# GET /api/votes/review/1

# Remove vote
# DELETE /api/votes/review/1


# ==================== Admin ====================

# Get flagged comments
# GET /api/admin/comments/flagged?skip=0&limit=10
# Headers: Authorization: Bearer {admin_token}

# Unflag comment
# PUT /api/admin/comments/1/unflag
# Headers: Authorization: Bearer {admin_token}

# Delete comment as admin
# DELETE /api/admin/comments/1
# Headers: Authorization: Bearer {admin_token}

# Feature product
# PUT /api/admin/products/1/feature
# Headers: Authorization: Bearer {admin_token}

# Unfeature product
# PUT /api/admin/products/1/unfeature
# Headers: Authorization: Bearer {admin_token}
