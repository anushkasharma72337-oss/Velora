/**
 * AI Review Summarizer Component
 * Analyzes all product reviews and generates insights
 */

import { useState } from 'react';
import { useReviewSummary } from '@/lib/hooks/useGemini';
import { AlertCircle, CheckCircle, Lightbulb, TrendingUp, Loader } from 'lucide-react';

interface ReviewSummarizerProps {
    reviews: string[];
    productName?: string;
}

export default function ReviewSummarizer({ reviews, productName = 'Product' }: ReviewSummarizerProps) {
    const { summarize, loading, error } = useReviewSummary();
    const [summary, setSummary] = useState<any>(null);
    const [hasGenerated, setHasGenerated] = useState(false);

    const handleSummarize = async () => {
        if (reviews.length === 0) {
            alert('No reviews to summarize');
            return;
        }

        const result = await summarize(reviews);
        if (result) {
            setSummary(result);
            setHasGenerated(true);
        }
    };

    if (!hasGenerated && !summary) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Review Summary</h2>
                        <p className="text-gray-600">Analyze {reviews.length} reviews with AI</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                    <p className="text-gray-700 mb-4">
                        This tool uses AI to analyze all reviews and extract key insights about strengths, weaknesses, and
                        requested features.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="bg-blue-50 p-3 rounded">
                            <p className="font-semibold text-blue-900">{reviews.length}</p>
                            <p className="text-blue-700">Total Reviews</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                            <p className="font-semibold text-purple-900">AI Powered</p>
                            <p className="text-purple-700">By Google Gemini</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSummarize}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Analyzing Reviews...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="w-5 h-5" />
                                Generate Summary
                            </>
                        )}
                    </button>

                    {error && <div className="text-red-500 mt-4">{error}</div>}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <div className="bg-white rounded-lg p-12 shadow text-center">
                    <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-gray-700 font-semibold">Analyzing {reviews.length} reviews with AI...</p>
                    <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-800">Error Analyzing Reviews</h3>
                            <p className="text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!summary) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Overall Summary */}
            <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-2">Overall Summary</h3>
                <p className="text-purple-100">{summary.overallSummary}</p>
            </div>

            {/* Strengths */}
            {summary.strengths && summary.strengths.length > 0 && (
                <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            <h3 className="font-bold text-green-900 text-lg">Strengths</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-3">
                            {summary.strengths.map((strength: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                    <span className="text-gray-700">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Weaknesses */}
            {summary.weaknesses && summary.weaknesses.length > 0 && (
                <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            <h3 className="font-bold text-red-900 text-lg">Weaknesses</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-3">
                            {summary.weaknesses.map((weakness: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-red-600 font-bold flex-shrink-0">✕</span>
                                    <span className="text-gray-700">{weakness}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Feature Requests */}
            {summary.featureRequests && summary.featureRequests.length > 0 && (
                <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
                            <h3 className="font-bold text-blue-900 text-lg">Requested Features</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-3">
                            {summary.featureRequests.map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold flex-shrink-0">💡</span>
                                    <span className="text-gray-700">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <div className="flex gap-3">
                <button
                    onClick={() => setSummary(null)}
                    className="flex-1 px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition"
                >
                    Analyze Again
                </button>
            </div>
        </div>
    );
}
