import { supabase, type Review, type Comment } from '../supabase';
import { handleSupabaseError } from '../utils/errors';

/**
 * Fetch reviews for a product
 */
export async function fetchReviews(
    productId: string,
    options?: {
        limit?: number;
        offset?: number;
        sortBy?: 'recent' | 'rating_high' | 'rating_low' | 'helpful';
    }
) {
    try {
        const { limit = 10, offset = 0, sortBy = 'recent' } = options || {};

        let query = supabase
            .from('reviews')
            .select(
                'id, rating, title, content, sentiment, is_flagged, created_at, profiles(full_name, username, avatar_url)',
                { count: 'exact' }
            )
            .eq('product_id', productId);

        // Apply sorting
        const sortMap: Record<string, { column: string; ascending: boolean }> = {
            recent: { column: 'created_at', ascending: false },
            rating_high: { column: 'rating', ascending: false },
            rating_low: { column: 'rating', ascending: true },
            helpful: { column: 'helpful_count', ascending: false },
        };

        const { column, ascending } = sortMap[sortBy] || sortMap.recent;
        query = query.order(column, { ascending });

        const { data, error, count } = await query.range(offset, offset + limit - 1);

        if (error) throw error;

        return { data: data as Review[], count, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error fetching reviews:', message);
        return { data: [], count: 0, error: message };
    }
}

/**
 * Fetch a single review by ID
 */
export async function fetchReviewById(reviewId: string) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(full_name, username, avatar_url), products(name)')
            .eq('id', reviewId)
            .maybeSingle();

        if (error) throw error;

        return { data: data as Review | null, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error(`Error fetching review ${reviewId}:`, message);
        return { data: null, error: message };
    }
}

/**
 * Add a new review for a product
 */
export async function submitReview(
    productId: string,
    userId: string,
    reviewData: {
        rating: number;
        title: string;
        content: string;
    }
) {
    try {
        // Validate input
        if (reviewData.rating < 1 || reviewData.rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        if (!reviewData.title?.trim() || !reviewData.content?.trim()) {
            throw new Error('Title and content are required');
        }

        // Check if user already reviewed this product
        const { data: existingReview, error: checkError } = await supabase
            .from('reviews')
            .select('id')
            .eq('product_id', productId)
            .eq('user_id', userId)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') throw checkError;

        if (existingReview) {
            throw new Error('You have already reviewed this product');
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert([
                {
                    product_id: productId,
                    user_id: userId,
                    rating: reviewData.rating,
                    title: reviewData.title,
                    content: reviewData.content,
                    sentiment: 'neutral', // Can be updated by backend analysis
                    is_flagged: false,
                },
            ])
            .select('*, profiles(full_name, username, avatar_url)')
            .single();

        if (error) throw error;

        return { data: data as Review, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error submitting review:', message);
        return { data: null, error: message };
    }
}

/**
 * Update a review
 */
export async function updateReview(
    reviewId: string,
    updates: Partial<Omit<Review, 'id' | 'created_at' | 'product_id' | 'user_id' | 'profiles'>>
) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .update(updates)
            .eq('id', reviewId)
            .select('*, profiles(full_name, username, avatar_url)')
            .single();

        if (error) throw error;

        return { data: data as Review, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error updating review:', message);
        return { data: null, error: message };
    }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
    try {
        const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error deleting review:', message);
        return { error: message };
    }
}

/**
 * Fetch comments for a product
 */
export async function fetchComments(
    productId: string,
    options?: {
        limit?: number;
        offset?: number;
    }
) {
    try {
        const { limit = 20, offset = 0 } = options || {};

        const { data, error, count } = await supabase
            .from('comments')
            .select(
                'id, content, parent_id, created_at, profiles(full_name, username, avatar_url)',
                { count: 'exact' }
            )
            .eq('product_id', productId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return { data: data as Comment[], count, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error fetching comments:', message);
        return { data: [], count: 0, error: message };
    }
}

/**
 * Add a comment to a product
 */
export async function addComment(
    productId: string,
    userId: string,
    content: string,
    parentId?: string | null
) {
    try {
        if (!content?.trim()) {
            throw new Error('Comment content is required');
        }

        const { data, error } = await supabase
            .from('comments')
            .insert([
                {
                    product_id: productId,
                    user_id: userId,
                    content: content.trim(),
                    parent_id: parentId || null,
                },
            ])
            .select('*, profiles(full_name, username, avatar_url)')
            .single();

        if (error) throw error;

        return { data: data as Comment, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error adding comment:', message);
        return { data: null, error: message };
    }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
    try {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error deleting comment:', message);
        return { error: message };
    }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string) {
    try {
        const { data, error } = await supabase.rpc('increment_helpful', {
            review_id: reviewId,
        });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error marking review as helpful:', message);
        return { data: null, error: message };
    }
}

/**
 * Flag a review as inappropriate
 */
export async function flagReview(reviewId: string, reason: string) {
    try {
        const { error } = await supabase
            .from('reviews')
            .update({ is_flagged: true })
            .eq('id', reviewId);

        if (error) throw error;

        // Log the flag
        await supabase.from('moderation_logs').insert([
            {
                review_id: reviewId,
                reason,
                status: 'pending',
            },
        ]);

        return { error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error flagging review:', message);
        return { error: message };
    }
}
