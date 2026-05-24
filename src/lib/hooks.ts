import { useCallback, useState } from 'react';
import { formatErrorMessage, isNetworkError } from '../utils/errors';
import type { Product, Review } from '../supabase';

export interface UseAsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export interface UseAsyncActions<T> {
    reset: () => void;
    execute: () => Promise<void>;
}

/**
 * Custom hook for handling async operations with loading and error states
 */
export function useAsync<T>(
    asyncFunction: () => Promise<{ data: T | null; error: string | null }>,
    immediate = true
): UseAsyncState<T> & UseAsyncActions<T> {
    const [state, setState] = useState<UseAsyncState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const result = await asyncFunction();
            if (result.error) {
                setState({ data: null, loading: false, error: result.error });
            } else {
                setState({ data: result.data, loading: false, error: null });
            }
        } catch (err) {
            const message = formatErrorMessage(err);
            setState({ data: null, loading: false, error: message });
        }
    }, [asyncFunction]);

    // Execute immediately if enabled
    useState(() => {
        if (immediate) {
            execute();
        }
    });

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        reset: () => setState({ data: null, loading: false, error: null }),
        execute,
    };
}

/**
 * Hook for fetching products
 */
export function useProducts(
    options?: {
        limit?: number;
        category?: string;
    },
    immediate = true
) {
    const { data, loading, error, execute } = useAsync(
        async () => {
            const { fetchProducts } = await import('./api/products');
            return fetchProducts(options);
        },
        immediate
    );

    return { products: data || [], loading, error, refetch: execute };
}

/**
 * Hook for fetching a single product
 */
export function useProduct(productId: string | null) {
    const { data, loading, error, execute } = useAsync(
        async () => {
            if (!productId) return { data: null, error: null };
            const { fetchProductById } = await import('./api/products');
            return fetchProductById(productId);
        },
        !!productId
    );

    return { product: data, loading, error, refetch: execute };
}

/**
 * Hook for fetching product reviews
 */
export function useReviews(productId: string | null, options?: { limit?: number }) {
    const { data, loading, error, execute } = useAsync(
        async () => {
            if (!productId) return { data: null, error: null };
            const { fetchReviews } = await import('./api/reviews');
            return fetchReviews(productId, options);
        },
        !!productId
    );

    return { reviews: data || [], loading, error, refetch: execute };
}

/**
 * Hook for submitting a review
 */
export function useSubmitReview() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(
        async (
            productId: string,
            userId: string,
            reviewData: { rating: number; title: string; content: string }
        ) => {
            setLoading(true);
            setError(null);
            try {
                const { submitReview } = await import('./api/reviews');
                const result = await submitReview(productId, userId, reviewData);
                if (result.error) {
                    setError(result.error);
                    return null;
                }
                return result.data;
            } catch (err) {
                const message = formatErrorMessage(err);
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { submit, loading, error };
}

/**
 * Hook for voting on a product
 */
export function useVoteProduct() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const vote = useCallback(
        async (userId: string, productId: string, voteType: 'up' | 'down') => {
            setLoading(true);
            setError(null);
            try {
                const { voteProduct } = await import('./api/products');
                const result = await voteProduct(userId, productId, voteType);
                if (result.error) {
                    setError(result.error);
                    return false;
                }
                return true;
            } catch (err) {
                const message = formatErrorMessage(err);
                setError(message);
                return false;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { vote, loading, error };
}

/**
 * Hook for adding a product
 */
export function useAddProduct() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const add = useCallback(
        async (productData: Omit<Product, 'id' | 'created_at' | 'upvotes' | 'downvotes' | 'review_count'>) => {
            setLoading(true);
            setError(null);
            try {
                const { addProduct } = await import('./api/products');
                const result = await addProduct(productData);
                if (result.error) {
                    setError(result.error);
                    return null;
                }
                return result.data;
            } catch (err) {
                const message = formatErrorMessage(err);
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { add, loading, error };
}
