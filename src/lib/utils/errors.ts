/**
 * Custom error types for Supabase operations
 */
export class SupabaseError extends Error {
    constructor(
        public code: string,
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'SupabaseError';
    }
}

/**
 * Handle and standardize Supabase errors
 */
export function handleSupabaseError(error: unknown) {
    if (!error) {
        return {
            code: 'UNKNOWN_ERROR',
            statusCode: 500,
            message: 'An unknown error occurred',
        };
    }

    // Handle Supabase API errors
    if (typeof error === 'object' && 'code' in error && 'message' in error) {
        const supabaseError = error as { code: string; message: string; status?: number };

        const errorMessages: Record<string, string> = {
            '23505': 'This record already exists',
            '23503': 'Invalid reference: The referenced record does not exist',
            '23502': 'Required field is missing',
            '42P01': 'Table not found',
            'PGRST116': 'No records found',
            'PGRST301': 'Authentication failed',
            'invalid_grant': 'Invalid credentials',
            'user_not_found': 'User not found',
            'weak_password': 'Password is too weak',
            'invalid_password': 'Invalid password',
            'email_provider_disabled': 'Email provider is not enabled',
            'user_already_exists': 'User already exists',
            'invalid_request_body': 'Invalid request body',
            'relation_not_found': 'Database table not found',
            'duplicate_schema': 'Schema already exists',
        };

        const message = errorMessages[supabaseError.code] || supabaseError.message;
        const statusCode = (supabaseError.status as number) || 400;

        return {
            code: supabaseError.code,
            statusCode,
            message,
        };
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        return {
            code: 'APPLICATION_ERROR',
            statusCode: 500,
            message: error.message,
        };
    }

    // Handle string errors
    if (typeof error === 'string') {
        return {
            code: 'APPLICATION_ERROR',
            statusCode: 500,
            message: error,
        };
    }

    return {
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        message: 'An unexpected error occurred',
    };
}

/**
 * Format error for user display
 */
export function formatErrorMessage(error: unknown): string {
    const { message } = handleSupabaseError(error);
    return message;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message: string }).message.toLowerCase();
        return (
            message.includes('network') ||
            message.includes('offline') ||
            message.includes('failed to fetch') ||
            message.includes('fetch failed')
        );
    }
    return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
    const { code } = handleSupabaseError(error);
    return ['PGRST301', 'invalid_grant', 'user_not_found', 'invalid_password'].includes(code);
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: unknown): boolean {
    const { code, statusCode } = handleSupabaseError(error);
    return code === 'PGRST103' || statusCode === 403;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    const { code } = handleSupabaseError(error);
    return code === 'invalid_request_body' || code === '23502'; // 23502 is NOT NULL constraint
}

/**
 * Retry logic with exponential backoff for transient errors
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options?: {
        maxRetries?: number;
        baseDelayMs?: number;
        maxDelayMs?: number;
    }
): Promise<T> {
    const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000 } = options || {};

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Check if error is retryable
            if (!isNetworkError(error) || attempt === maxRetries) {
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);

            // Add jitter
            const jitteredDelay = delay + Math.random() * delay * 0.1;

            await new Promise((resolve) => setTimeout(resolve, jitteredDelay));
        }
    }

    throw lastError || new Error('Max retries exceeded');
}
