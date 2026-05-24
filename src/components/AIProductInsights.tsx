/**
 * Example Component: AI-Powered Product Insights
 * Demonstrates Gemini AI integration
 */

import { useState } from 'react';
import {
    useProductInsight,
    useReviewSentiment,
    useProductTags,
    useFeatureHighlights,
    useProductQuestion,
} from '@/lib/hooks/useGemini';
import { Brain, Loader } from 'lucide-react';

interface AIProductInsightsProps {
    productName: string;
    description: string;
    reviews?: string[];
}

export default function AIProductInsights({ productName, description, reviews = [] }: AIProductInsightsProps) {
    const [activeTab, setActiveTab] = useState<'insight' | 'sentiment' | 'tags' | 'features' | 'ask'>('insight');
    const [question, setQuestion] = useState('');
    const [reviewToAnalyze, setReviewToAnalyze] = useState('');

    // Hooks for different AI features
    const { generate: generateInsight, loading: insightLoading, error: insightError } = useProductInsight();
    const { analyze: analyzeSentiment, loading: sentimentLoading, error: sentimentError } = useReviewSentiment();
    const { generate: generateTags, loading: tagsLoading, error: tagsError } = useProductTags();
    const { generate: generateFeatures, loading: featuresLoading, error: featuresError } = useFeatureHighlights();
    const { answer: answerQuestion, loading: questionLoading, error: questionError } = useProductQuestion();

    // State for results
    const [insight, setInsight] = useState<string | null>(null);
    const [sentimentResult, setSentimentResult] = useState<any>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);
    const [answer, setAnswer] = useState<string | null>(null);

    // Generate product insight
    const handleGenerateInsight = async () => {
        const result = await generateInsight(productName, description, reviews);
        setInsight(result);
    };

    // Analyze review sentiment
    const handleAnalyzeSentiment = async () => {
        if (!reviewToAnalyze.trim()) {
            alert('Please enter a review to analyze');
            return;
        }
        const result = await analyzeSentiment(reviewToAnalyze);
        setSentimentResult(result);
    };

    // Generate tags
    const handleGenerateTags = async () => {
        const result = await generateTags(productName, description);
        setTags(result || []);
    };

    // Generate features
    const handleGenerateFeatures = async () => {
        const result = await generateFeatures(description);
        setFeatures(result || []);
    };

    // Answer question
    const handleAskQuestion = async () => {
        if (!question.trim()) {
            alert('Please ask a question');
            return;
        }
        const result = await answerQuestion(productName, description, question);
        setAnswer(result);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Brain className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-800">AI Insights</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {(['insight', 'sentiment', 'tags', 'features', 'ask'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded font-medium transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {tab === 'insight' && 'Product Insight'}
                        {tab === 'sentiment' && 'Sentiment Analysis'}
                        {tab === 'tags' && 'Auto Tags'}
                        {tab === 'features' && 'Features'}
                        {tab === 'ask' && 'Ask AI'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg p-6 shadow">
                {/* Product Insight Tab */}
                {activeTab === 'insight' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Product Insight</h3>
                        <p className="text-gray-600 mb-4">
                            Get AI-powered insights about this product based on its description and user reviews.
                        </p>
                        <button
                            onClick={handleGenerateInsight}
                            disabled={insightLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {insightLoading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Insight'
                            )}
                        </button>
                        {insightError && <div className="text-red-500 mt-4">{insightError}</div>}
                        {insight && (
                            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                                <p className="text-gray-800">{insight}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Sentiment Analysis Tab */}
                {activeTab === 'sentiment' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Review Sentiment Analysis</h3>
                        <textarea
                            value={reviewToAnalyze}
                            onChange={(e) => setReviewToAnalyze(e.target.value)}
                            placeholder="Paste a review here to analyze its sentiment..."
                            className="w-full p-3 border rounded mb-4 h-24"
                        />
                        <button
                            onClick={handleAnalyzeSentiment}
                            disabled={sentimentLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {sentimentLoading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Sentiment'
                            )}
                        </button>
                        {sentimentError && <div className="text-red-500 mt-4">{sentimentError}</div>}
                        {sentimentResult && (
                            <div className="mt-6 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded">
                                <div className="mb-2">
                                    <span className="font-bold">Sentiment:</span>{' '}
                                    <span
                                        className={`font-bold ${sentimentResult.sentiment === 'positive'
                                                ? 'text-green-600'
                                                : sentimentResult.sentiment === 'negative'
                                                    ? 'text-red-600'
                                                    : 'text-yellow-600'
                                            }`}
                                    >
                                        {sentimentResult.sentiment?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold">Confidence:</span> {(sentimentResult.confidence * 100).toFixed(0)}%
                                </div>
                                <div>
                                    <span className="font-bold">Summary:</span> {sentimentResult.summary}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Auto Tags Tab */}
                {activeTab === 'tags' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Auto-Generated Tags</h3>
                        <p className="text-gray-600 mb-4">Generate relevant tags for this product automatically.</p>
                        <button
                            onClick={handleGenerateTags}
                            disabled={tagsLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {tagsLoading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Tags'
                            )}
                        </button>
                        {tagsError && <div className="text-red-500 mt-4">{tagsError}</div>}
                        {tags.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Feature Highlights</h3>
                        <p className="text-gray-600 mb-4">Extract key features from the product description.</p>
                        <button
                            onClick={handleGenerateFeatures}
                            disabled={featuresLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {featuresLoading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Features'
                            )}
                        </button>
                        {featuresError && <div className="text-red-500 mt-4">{featuresError}</div>}
                        {features.length > 0 && (
                            <ul className="mt-6 space-y-2">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Ask AI Tab */}
                {activeTab === 'ask' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Ask AI about this Product</h3>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask any question about this product..."
                            className="w-full p-3 border rounded mb-4 h-24"
                        />
                        <button
                            onClick={handleAskQuestion}
                            disabled={questionLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {questionLoading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Thinking...
                                </>
                            ) : (
                                'Ask'
                            )}
                        </button>
                        {questionError && <div className="text-red-500 mt-4">{questionError}</div>}
                        {answer && (
                            <div className="mt-6 p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
                                <p className="text-gray-800">{answer}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <strong>Note:</strong> Make sure to add your Gemini API key to the <code>.env.local</code> file as{' '}
                <code>VITE_GEMINI_API_KEY</code> to use these AI features.
            </div>
        </div>
    );
}
