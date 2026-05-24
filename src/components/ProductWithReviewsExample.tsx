/**
 * Example Component: Product Display with Reviews and Interactions
 * This component demonstrates how to use the Supabase API functions and hooks
 */

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProduct, useReviews, useSubmitReview, useVoteProduct } from '@/lib/hooks';
import StarRating from '@/components/ui/StarRating';
import ReviewCard from '@/components/ReviewCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProductWithReviewsExampleProps {
    productId: string;
}

export default function ProductWithReviewsExample({ productId }: ProductWithReviewsExampleProps) {
    const { user } = useAuth();

    // Fetch product data
    const { product, loading: productLoading, error: productError } = useProduct(productId);

    // Fetch reviews
    const { reviews, loading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useReviews(productId, {
        limit: 10,
    });

    // Vote hook
    const { vote, loading: voteLoading, error: voteError } = useVoteProduct();

    // Submit review hook
    const { submit: submitReview, loading: submitLoading, error: submitError } = useSubmitReview();

    // Local review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewFormData, setReviewFormData] = useState({
        rating: 5,
        title: '',
        content: '',
    });

    // Handle review submission
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Please log in to submit a review');
            return;
        }

        const review = await submitReview(productId, user.id, reviewFormData);

        if (review) {
            // Success
            setReviewFormData({ rating: 5, title: '', content: '' });
            setShowReviewForm(false);
            // Refresh reviews
            await refetchReviews();
        }
    };

    // Handle voting
    const handleVote = async (voteType: 'up' | 'down') => {
        if (!user) {
            alert('Please log in to vote');
            return;
        }

        await vote(user.id, productId, voteType);
    };

    if (productLoading) {
        return <LoadingSpinner />;
    }

    if (productError) {
        return <div className="text-red-500">Error loading product: {productError}</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Product Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>

                {/* Product Stats */}
                <div className="flex gap-6 mb-6">
                    <div>
                        <div className="text-2xl font-bold">{product.rating.toFixed(1)}</div>
                        <StarRating rating={product.rating} size="sm" readOnly />
                        <div className="text-sm text-gray-500">{product.review_count} reviews</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{product.upvotes}</div>
                        <div className="text-sm text-gray-500">Upvotes</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">${product.price}</div>
                        <div className="text-sm text-gray-500">Price</div>
                    </div>
                </div>

                {/* Vote Buttons */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => handleVote('up')}
                        disabled={voteLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {voteLoading ? 'Voting...' : '👍 Upvote'}
                    </button>
                    <button
                        onClick={() => handleVote('down')}
                        disabled={voteLoading}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        {voteLoading ? 'Voting...' : '👎 Downvote'}
                    </button>
                    {voteError && <div className="text-red-500">{voteError}</div>}
                </div>

                {/* Product Links */}
                <div className="flex gap-4">
                    {product.website_url && (
                        <a href={product.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            Visit Website
                        </a>
                    )}
                    {product.demo_url && (
                        <a href={product.demo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            Try Demo
                        </a>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Reviews ({product.review_count})</h2>
                    <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        {showReviewForm ? 'Cancel' : 'Write Review'}
                    </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <StarRating
                                    rating={reviewFormData.rating}
                                    onRate={(rating) => setReviewFormData({ ...reviewFormData, rating })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={reviewFormData.title}
                                    onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                                    placeholder="Give your review a title"
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Review</label>
                                <textarea
                                    value={reviewFormData.content}
                                    onChange={(e) => setReviewFormData({ ...reviewFormData, content: e.target.value })}
                                    placeholder="Share your thoughts about this product"
                                    className="w-full px-3 py-2 border rounded h-24"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {submitLoading ? 'Submitting...' : 'Submit Review'}
                            </button>

                            {submitError && <div className="text-red-500 mt-2">{submitError}</div>}
                        </form>
                    </div>
                )}

                {/* Reviews List */}
                {reviewsLoading ? (
                    <LoadingSpinner />
                ) : reviewsError ? (
                    <div className="text-red-500">Error loading reviews: {reviewsError}</div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</div>
                )}
            </div>

            {/* Product Details */}
            {product.features && product.features.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Features</h3>
                    <ul className="list-disc list-inside space-y-2">
                        {product.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Screenshots */}
            {product.screenshots && product.screenshots.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Screenshots</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {product.screenshots.map((screenshot, index) => (
                            <img key={index} src={screenshot} alt={`Screenshot ${index + 1}`} className="rounded" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
