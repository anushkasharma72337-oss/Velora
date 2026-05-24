/**
 * Example: Integrating Review Summarizer with Product Page
 * This shows how to add the summarizer to an existing product detail page
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct, useReviews } from '@/lib/hooks';
import ReviewSummarizer from '@/components/ReviewSummarizer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProductDetailWithSummary() {
    const { id } = useParams<{ id: string }>();
    const { product, loading: productLoading, error: productError } = useProduct(id || null);
    const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews(id || null, { limit: 50 });

    const [activeTab, setActiveTab] = useState<'details' | 'summary'>('details');

    // Extract review text content for summarization
    const reviewTexts = reviews.map((r) => r.content);
    const hasReviews = reviewTexts.length > 0;

    if (productLoading) return <LoadingSpinner />;
    if (productError) return <div className="text-red-500">{productError}</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Product Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'details'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Product Details
                </button>
                <button
                    onClick={() => setActiveTab('summary')}
                    disabled={!hasReviews}
                    className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'summary'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900 disabled:opacity-50'
                        }`}
                >
                    AI Review Summary {hasReviews && `(${reviewTexts.length})`}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'details' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    {/* Product image */}
                    {product.image_url && (
                        <img src={product.image_url} alt={product.name} className="w-full h-64 object-cover rounded mb-6" />
                    )}

                    {/* Product stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded">
                            <div className="text-2xl font-bold text-blue-600">${product.price}</div>
                            <div className="text-blue-600">Price</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded">
                            <div className="text-2xl font-bold text-yellow-600">{product.rating.toFixed(1)}</div>
                            <div className="text-yellow-600">{product.review_count} reviews</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                            <div className="text-2xl font-bold text-green-600">{product.upvotes}</div>
                            <div className="text-green-600">Upvotes</div>
                        </div>
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-3">Features</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {product.features.map((feature, i) => (
                                    <li key={i} className="text-gray-700">
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Website links */}
                    {(product.website_url || product.demo_url) && (
                        <div className="flex gap-3">
                            {product.website_url && (
                                <a
                                    href={product.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Visit Website
                                </a>
                            )}
                            {product.demo_url && (
                                <a
                                    href={product.demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Try Demo
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'summary' && (
                <div>
                    {reviewsLoading ? (
                        <LoadingSpinner />
                    ) : reviewsError ? (
                        <div className="text-red-500">{reviewsError}</div>
                    ) : hasReviews ? (
                        <ReviewSummarizer reviews={reviewTexts} productName={product.name} />
                    ) : (
                        <div className="bg-gray-50 p-6 rounded text-center text-gray-600">
                            No reviews available for analysis yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
