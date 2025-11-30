/**
 * Centralized error handling utility.
 * Parses various error types (Supabase, Network, JS) into user-friendly messages.
 */

interface AppError {
    title: string;
    message: string;
}

export const handleError = (error: any): AppError => {
    // Log the raw error for debugging
    console.error('[AppError]', error);

    // Default error message
    let title = 'Error';
    let message = 'An unexpected error occurred. Please try again.';

    // Handle Supabase/PostgREST errors
    if (error?.message) {
        message = error.message;
    }

    // Handle specific Supabase error codes (optional refinement)
    if (error?.code) {
        switch (error.code) {
            case '23505': // Unique violation
                title = 'Duplicate Entry';
                message = 'This record already exists.';
                break;
            case '23503': // Foreign key violation
                title = 'Operation Failed';
                message = 'This record cannot be modified because it is referenced elsewhere.';
                break;
            case 'PGRST116': // JSON object requested, multiple (or no) rows returned
                title = 'Data Error';
                message = 'Could not retrieve the requested data.';
                break;
            case '42501': // RLS violation
                title = 'Access Denied';
                message = 'You do not have permission to perform this action.';
                break;
        }
    }

    // Handle Network errors
    if (error?.message === 'Network request failed') {
        title = 'Connection Error';
        message = 'Please check your internet connection and try again.';
    }

    return { title, message };
};
