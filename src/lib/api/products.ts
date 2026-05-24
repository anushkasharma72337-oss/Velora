import { supabase, type Product } from '../supabase';
import { handleSupabaseError } from '../utils/errors';

/**
 * Fetch all products with optional filtering and pagination
 */
export async function fetchProducts(
    options?: {
        limit?: number;
        offset?: number;
        category?: string;
        status?: string;
        sortBy?: 'created_at' | 'rating' | 'upvotes';
    }
) {
    try {
        const { limit = 10, offset = 0, category, status, sortBy = 'created_at' } = options || {};

        let query = supabase
            .from('products')
            .select('*, profiles(full_name, username, avatar_url, is_founder)', { count: 'exact' });

        if (category) {
            query = query.eq('category', category);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query
            .order(sortBy, { ascending: sortBy !== 'upvotes' })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return { data: data as Product[], count, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error fetching products:', message);
        return { data: [], count: 0, error: message };
    }
}

/**
 * Fetch a single product by ID with full details
 */
export async function fetchProductById(productId: string) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, profiles(full_name, username, avatar_url, is_founder)')
            .eq('id', productId)
            .maybeSingle();

        if (error) throw error;

        return { data: data as Product | null, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error(`Error fetching product ${productId}:`, message);
        return { data: null, error: message };
    }
}

/**
 * Fetch products by category
 */
export async function fetchProductsByCategory(
    category: string,
    options?: { limit?: number; offset?: number }
) {
    return fetchProducts({ ...options, category, status: 'approved' });
}

/**
 * Add a new product (founder/admin only)
 */
export async function addProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'upvotes' | 'downvotes' | 'review_count'>
) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    ...productData,
                    status: 'pending',
                    rating: 0,
                    review_count: 0,
                    upvotes: 0,
                    downvotes: 0,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return { data: data as Product, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error adding product:', message);
        return { data: null, error: message };
    }
}

/**
 * Update product (founder/admin only)
 */
export async function updateProduct(
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'created_at'>>
) {
    try {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;

        return { data: data as Product, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error updating product:', message);
        return { data: null, error: message };
    }
}

/**
 * Vote on a product (upvote/downvote)
 */
export async function voteProduct(
    userId: string,
    productId: string,
    voteType: 'up' | 'down'
) {
    try {
        // Check if user already voted
        const { data: existingVote, error: checkError } = await supabase
            .from('votes')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') throw checkError;

        if (existingVote) {
            // Remove existing vote
            const { error: deleteError } = await supabase
                .from('votes')
                .delete()
                .eq('id', existingVote.id);

            if (deleteError) throw deleteError;
        }

        // Add new vote
        const { data, error } = await supabase
            .from('votes')
            .insert([{ user_id: userId, product_id: productId, vote_type: voteType }])
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error voting on product:', message);
        return { data: null, error: message };
    }
}

/**
 * Save/bookmark a product
 */
export async function saveProduct(userId: string, productId: string) {
    try {
        const { data, error } = await supabase
            .from('saved_products')
            .insert([{ user_id: userId, product_id: productId }])
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error saving product:', message);
        return { data: null, error: message };
    }
}

/**
 * Remove a saved product
 */
export async function removeSavedProduct(userId: string, productId: string) {
    try {
        const { error } = await supabase
            .from('saved_products')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error removing saved product:', message);
        return { error: message };
    }
}

/**
 * Check if a product is saved by a user
 */
export async function isProductSaved(userId: string, productId: string) {
    try {
        const { data, error } = await supabase
            .from('saved_products')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        return { isSaved: !!data, error: null };
    } catch (error) {
        const { message } = handleSupabaseError(error);
        console.error('Error checking if product is saved:', message);
        return { isSaved: false, error: message };
    }
}
