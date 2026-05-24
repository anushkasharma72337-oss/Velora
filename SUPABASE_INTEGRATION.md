# Supabase Integration Guide

This document describes how to use the Supabase integration for your React app.

## Environment Setup

Ensure your `.env.local` file has:

```env
VITE_SUPABASE_URL=https://gmcpytrdxjzunjxqyxos.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_7yrECZRgwzJnYzPZyAkyWg_hsWNYYxg
```

## Structure

- `src/lib/supabase.ts` - Supabase client and type definitions
- `src/lib/api/products.ts` - Product fetching and management functions
- `src/lib/api/reviews.ts` - Review and comment functions
- `src/lib/utils/errors.ts` - Error handling utilities
- `src/lib/hooks.ts` - React hooks for easy integration

## Available Functions

### Products API

#### `fetchProducts(options?)`
Fetch all products with optional filtering.

```typescript
import { fetchProducts } from '@/lib/api/products';

const { data: products, count, error } = await fetchProducts({
  limit: 10,
  offset: 0,
  category: 'SaaS',
  status: 'approved',
  sortBy: 'created_at'
});
```

#### `fetchProductById(productId)`
Get a single product with full details.

```typescript
import { fetchProductById } from '@/lib/api/products';

const { data: product, error } = await fetchProductById('prod_123');
```

#### `addProduct(productData)`
Create a new product (founder/admin only).

```typescript
import { addProduct } from '@/lib/api/products';

const { data: newProduct, error } = await addProduct({
  name: 'My Product',
  description: 'Product description',
  price: 99.99,
  category: 'SaaS',
  image_url: 'https://example.com/image.jpg',
  features: ['Feature 1', 'Feature 2'],
  founder_id: 'founder_123',
  website_url: 'https://myproduct.com',
  demo_url: 'https://demo.myproduct.com',
  rating: 0,
  ai_score: 0,
  ai_summary: '',
  screenshots: [],
  tags: ['productivity', 'tools']
});
```

#### `updateProduct(productId, updates)`
Update product details.

```typescript
import { updateProduct } from '@/lib/api/products';

const { data: updated, error } = await updateProduct('prod_123', {
  name: 'Updated Name',
  description: 'Updated description'
});
```

#### `voteProduct(userId, productId, voteType)`
Vote on a product (upvote/downvote).

```typescript
import { voteProduct } from '@/lib/api/products';

const { data: vote, error } = await voteProduct('user_123', 'prod_123', 'up');
```

#### `saveProduct(userId, productId)`
Save/bookmark a product.

```typescript
import { saveProduct } from '@/lib/api/products';

const { data, error } = await saveProduct('user_123', 'prod_123');
```

#### `removeSavedProduct(userId, productId)`
Remove a saved product.

```typescript
import { removeSavedProduct } from '@/lib/api/products';

const { error } = await removeSavedProduct('user_123', 'prod_123');
```

#### `isProductSaved(userId, productId)`
Check if a product is saved.

```typescript
import { isProductSaved } from '@/lib/api/products';

const { isSaved, error } = await isProductSaved('user_123', 'prod_123');
```

### Reviews API

#### `fetchReviews(productId, options?)`
Get reviews for a product.

```typescript
import { fetchReviews } from '@/lib/api/reviews';

const { data: reviews, count, error } = await fetchReviews('prod_123', {
  limit: 10,
  offset: 0,
  sortBy: 'recent' // 'recent', 'rating_high', 'rating_low', 'helpful'
});
```

#### `submitReview(productId, userId, reviewData)`
Submit a new review.

```typescript
import { submitReview } from '@/lib/api/reviews';

const { data: review, error } = await submitReview('prod_123', 'user_123', {
  rating: 5,
  title: 'Great product!',
  content: 'This product is amazing and solved my problem.'
});
```

#### `updateReview(reviewId, updates)`
Update a review.

```typescript
import { updateReview } from '@/lib/api/reviews';

const { data: updated, error } = await updateReview('review_123', {
  rating: 4,
  content: 'Updated review content'
});
```

#### `deleteReview(reviewId)`
Delete a review.

```typescript
import { deleteReview } from '@/lib/api/reviews';

const { error } = await deleteReview('review_123');
```

#### `flagReview(reviewId, reason)`
Flag a review as inappropriate.

```typescript
import { flagReview } from '@/lib/api/reviews';

const { error } = await flagReview('review_123', 'Spam');
```

#### `markReviewHelpful(reviewId)`
Mark a review as helpful.

```typescript
import { markReviewHelpful } from '@/lib/api/reviews';

const { data, error } = await markReviewHelpful('review_123');
```

### Comments API

#### `fetchComments(productId, options?)`
Get comments on a product.

```typescript
import { fetchComments } from '@/lib/api/reviews';

const { data: comments, count, error } = await fetchComments('prod_123', {
  limit: 20,
  offset: 0
});
```

#### `addComment(productId, userId, content, parentId?)`
Add a comment to a product.

```typescript
import { addComment } from '@/lib/api/reviews';

const { data: comment, error } = await addComment(
  'prod_123',
  'user_123',
  'Great product!',
  null // parentId for nested comments
);
```

#### `deleteComment(commentId)`
Delete a comment.

```typescript
import { deleteComment } from '@/lib/api/reviews';

const { error } = await deleteComment('comment_123');
```

## Using React Hooks

### `useProducts(options?, immediate?)`
Hook for fetching products.

```typescript
import { useProducts } from '@/lib/hooks';

function ProductList() {
  const { products, loading, error, refetch } = useProducts({
    limit: 10,
    category: 'SaaS'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### `useProduct(productId)`
Hook for fetching a single product.

```typescript
import { useProduct } from '@/lib/hooks';

function ProductDetail({ productId }) {
  const { product, loading, error, refetch } = useProduct(productId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return <div>{product.name}</div>;
}
```

### `useReviews(productId, options?)`
Hook for fetching reviews.

```typescript
import { useReviews } from '@/lib/hooks';

function ReviewsList({ productId }) {
  const { reviews, loading, error, refetch } = useReviews(productId, {
    limit: 5
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>{review.title}</div>
      ))}
    </div>
  );
}
```

### `useSubmitReview()`
Hook for submitting reviews.

```typescript
import { useSubmitReview } from '@/lib/hooks';
import { useAuth } from '@/context/AuthContext';

function ReviewForm({ productId }) {
  const { user } = useAuth();
  const { submit, loading, error } = useSubmitReview();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const review = await submit(productId, user.id, {
      rating,
      title,
      content
    });
    if (review) {
      // Success - reset form
      setTitle('');
      setContent('');
      setRating(5);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
}
```

### `useVoteProduct()`
Hook for voting on products.

```typescript
import { useVoteProduct } from '@/lib/hooks';
import { useAuth } from '@/context/AuthContext';

function VoteButtons({ productId }) {
  const { user } = useAuth();
  const { vote, loading, error } = useVoteProduct();

  return (
    <div>
      <button onClick={() => vote(user.id, productId, 'up')} disabled={loading}>
        👍 Upvote
      </button>
      <button onClick={() => vote(user.id, productId, 'down')} disabled={loading}>
        👎 Downvote
      </button>
      {error && <div>{error}</div>}
    </div>
  );
}
```

### `useAddProduct()`
Hook for adding new products.

```typescript
import { useAddProduct } from '@/lib/hooks';
import { useAuth } from '@/context/AuthContext';

function AddProductForm() {
  const { user } = useAuth();
  const { add, loading, error } = useAddProduct();
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = await add({
      name,
      description: '',
      price: 0,
      category: 'SaaS',
      image_url: '',
      features: [],
      founder_id: user.id,
      website_url: '',
      demo_url: '',
      rating: 0,
      ai_score: 0,
      ai_summary: '',
      screenshots: [],
      tags: []
    });
    if (product) {
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Product'}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
}
```

## Error Handling

The API functions return error messages directly:

```typescript
const { data, error } = await fetchProducts();
if (error) {
  console.error('Failed to fetch products:', error);
}
```

For more detailed error handling:

```typescript
import { handleSupabaseError, isNetworkError, isAuthError } from '@/lib/utils/errors';

try {
  const result = await fetchProducts();
} catch (error) {
  const { code, statusCode, message } = handleSupabaseError(error);
  
  if (isNetworkError(error)) {
    console.log('Network error - check your connection');
  } else if (isAuthError(error)) {
    console.log('Authentication failed - please log in');
  }
}
```

## Retry Logic

For transient errors (network issues, temporary server problems):

```typescript
import { retryWithBackoff } from '@/lib/utils/errors';

const products = await retryWithBackoff(() => fetchProducts(), {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000
});
```
