import { getAuthCookies } from './cookie_utils'

/**
 * Verify if user has a valid session
 * This is a synchronous version for client-side checks
 * For full verification with database, use authSystem.verifySession()
 */
export function verifySession(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for auth cookies from our custom auth system
    const { sessionToken, deviceId, userId } = getAuthCookies();

    const isValid = !!(sessionToken && deviceId && userId);
    console.log('🔍 التحقق من الجلسة:', {
        hasSession: !!sessionToken,
        hasDevice: !!deviceId,
        hasUser: !!userId,
        isValid
    });

    // If all three cookies exist, consider the session valid
    // Note: This is a basic check. For full verification (fingerprint, expiry, etc.)
    // the page should use authSystem.verifySession() on mount
    return isValid;
}
