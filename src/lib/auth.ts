import { supabase } from './supabase'

/**
 * Verify if user has a valid session
 * This is a synchronous version for client-side checks
 * For full verification with database, use authSystem.verifySession()
 */
export function verifySession(): boolean {
    if (typeof window === 'undefined') return false;

    // With Supabase Auth, we check localStorage for session
    // This is a quick sync check - for full verification use authSystem.verifySession()
    const supabaseKey = `sb-pqqaupbkamtfjweajkjo-auth-token`
    const storedSession = localStorage.getItem(supabaseKey)

    const isValid = !!storedSession
    console.log('🔍 التحقق من الجلسة:', { isValid });

    return isValid;
}

/**
 * Async version to check session with Supabase
 */
export async function verifySessionAsync(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
        const { data: { session } } = await supabase.auth.getSession()
        return !!session
    } catch {
        return false
    }
}
