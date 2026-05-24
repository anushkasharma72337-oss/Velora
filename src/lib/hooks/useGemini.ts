/**
 * React hooks for Gemini AI integration
 */

import { useCallback, useState } from 'react';
import {
    generateContent,
    generateProductInsight,
    analyzeReviewSentiment,
    generateProductTags,
    generateFeatureHighlights,
    answerProductQuestion,
    generateReviewResponse,
    compareProducts,
    summarizeReviews,
    type ReviewSummary,
} from './api/gemini';

/**
 * Hook for generating content with Gemini
 */
export function useGeminiContent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(
        async (prompt: string, options?: { temperature?: number; maxTokens?: number }) => {
            setLoading(true);
            setError(null);
            try {
                const result = await generateContent(prompt, options);
                if (result.error) {
                    setError(result.error);
                    return null;
                }
                return result.text;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { generate, loading, error };
}

/**
 * Hook for generating product insights
 */
export function useProductInsight() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(
        async (productName: string, description: string, reviews: string[]) => {
            setLoading(true);
            setError(null);
            try {
                const result = await generateProductInsight(productName, description, reviews);
                if (result.error) {
                    setError(result.error);
                    return null;
                }
                return result.insight;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { generate, loading, error };
}

/**
 * Hook for analyzing review sentiment
 */
export function useReviewSentiment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = useCallback(async (reviewText: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await analyzeReviewSentiment(reviewText);
            if (result.error) {
                setError(result.error);
                return null;
            }
            return {
                sentiment: result.sentiment,
                confidence: result.confidence,
                summary: result.summary,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { analyze, loading, error };
}

/**
 * Hook for generating product tags
 */
export function useProductTags() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(async (productName: string, description: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await generateProductTags(productName, description);
            if (result.error) {
                setError(result.error);
                return [];
            }
            return result.tags || [];
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return { generate, loading, error };
}

/**
 * Hook for generating feature highlights
 */
export function useFeatureHighlights() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(async (description: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await generateFeatureHighlights(description);
            if (result.error) {
                setError(result.error);
                return [];
            }
            return result.features || [];
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return { generate, loading, error };
}

/**
 * Hook for answering product questions
 */
export function useProductQuestion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const answer = useCallback(async (productName: string, productInfo: string, question: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await answerProductQuestion(productName, productInfo, question);
            if (result.error) {
                setError(result.error);
                return null;
            }
            return result.answer;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { answer, loading, error };
}

/**
 * Hook for generating review responses
 */
export function useReviewResponse() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(async (reviewText: string, context?: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await generateReviewResponse(reviewText, context);
            if (result.error) {
                setError(result.error);
                return null;
            }
            return result.response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { generate, loading, error };
}

/**
 * Hook for comparing products
 */
export function useProductComparison() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const compare = useCallback(
        async (products: Array<{ name: string; description: string; price: number }>) => {
            setLoading(true);
            setError(null);
            try {
                const result = await compareProducts(products);
                if (result.error) {
                    setError(result.error);
                    return null;
                }
                return result.comparison;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { compare, loading, error };
}

/**
 * Hook for summarizing all reviews
 */
export function useReviewSummary() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const summarize = useCallback(async (reviews: string[]) => {
        setLoading(true);
        setError(null);
        try {
            const result = await summarizeReviews(reviews);
            if (result.error) {
                setError(result.error);
                return null;
            }
            return result.summary as ReviewSummary | null;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { summarize, loading, error };
}
