// Authentication System using Supabase Auth
// Handles user registration, login, device verification, and session management

import { supabase } from './supabase'
import { deviceFingerprint, DeviceFingerprintData } from './fingerprint'
import { TOTAL_BOOK_PAGES } from './config'

// Types
interface UserProfile {
    id: string
    full_name: string | null
    phone_number: string | null
    created_at: string
    is_active: boolean
}

interface Device {
    id: string
    user_id: string
    device_id: string
    device_fingerprint: string
    device_info: object
    registered_at: string
    last_used: string
    is_active: boolean
}

// Result types
export interface AuthResult {
    ok: boolean
    error?: string
    message?: string
    userId?: string
    deviceMismatch?: boolean
    needsVerification?: boolean
    needsEmailConfirmation?: boolean
}

export interface SessionVerifyResult {
    valid: boolean
    userId?: string
    error?: string
}

class AuthSystem {
    /**
     * Compare device fingerprints flexibly
     * Allows same device across different browsers by comparing hardware properties
     */
    private isMatchingDevice(savedDeviceInfo: any, currentFingerprint: DeviceFingerprintData): boolean {
        if (!savedDeviceInfo) {
            console.log('❌ No saved device info')
            return false
        }

        // Log comparison details
        console.log('🔍 Comparing devices:')
        console.log('   Saved:', {
            p: savedDeviceInfo.platform,
            t: savedDeviceInfo.timezone,
            cd: savedDeviceInfo.colorDepth,
            screen: savedDeviceInfo.screenResolution,
            cpu: savedDeviceInfo.cpuCores,
            mem: savedDeviceInfo.memory
        })
        console.log('   Current:', {
            p: currentFingerprint.info.platform,
            t: currentFingerprint.info.timezone,
            cd: currentFingerprint.info.colorDepth,
            screen: currentFingerprint.info.screenResolution,
            cpu: currentFingerprint.info.cpuCores,
            mem: currentFingerprint.info.memory
        })

        // Compare core hardware properties that are identical across all browsers
        const isSameDevice = (
            savedDeviceInfo.platform === currentFingerprint.info.platform &&
            savedDeviceInfo.timezone === currentFingerprint.info.timezone &&
            savedDeviceInfo.colorDepth === currentFingerprint.info.colorDepth &&
            savedDeviceInfo.screenResolution === currentFingerprint.info.screenResolution &&
            savedDeviceInfo.cpuCores === currentFingerprint.info.cpuCores &&
            savedDeviceInfo.memory === currentFingerprint.info.memory
        )

        if (isSameDevice) {
            console.log('✅ Device matched by hardware properties (cross-browser compatible)')
        } else {
            console.log('❌ Device NOT matched - different device detected')
        }

        return isSameDevice
    }

    /**
     * Register a new user using Supabase Auth
     */
    async register(fullName: string, email: string, password: string, phoneNumber?: string): Promise<AuthResult> {
        try {
            // 1. Register with Supabase Auth (profile is created automatically by trigger)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.toLowerCase(),
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone_number: phoneNumber || null
                    }
                }
            })

            if (authError) {
                console.error('Supabase Auth error:', authError)
                if (authError.message.includes('already registered')) {
                    return { ok: false, error: 'البريد الإلكتروني مسجل بالفعل' }
                }
                return { ok: false, error: authError.message }
            }

            if (!authData.user) {
                return { ok: false, error: 'فشل في إنشاء الحساب' }
            }

            const userId = authData.user.id

            // 2. Generate device fingerprint and save device
            const fingerprintData = await deviceFingerprint.generate()
            const deviceId = deviceFingerprint.generateDeviceId()

            const { error: deviceError } = await supabase.from('devices').insert({
                user_id: userId,
                device_id: deviceId,
                device_fingerprint: fingerprintData.hash,
                device_info: fingerprintData.info,
                is_active: true,
            })

            if (deviceError) {
                console.error('Error saving device:', deviceError)
            }

            // 3. Create reading progress record
            const { error: progressError } = await supabase.from('reading_progress').insert({
                user_id: userId,
                current_page: 1,
                total_pages: TOTAL_BOOK_PAGES,
                bookmarks: [],
                completion_percentage: 0,
            })

            if (progressError) {
                console.error('Error creating reading progress:', progressError)
            }

            // Check if email confirmation is needed
            if (!authData.session) {
                return {
                    ok: true,
                    userId: userId,
                    needsEmailConfirmation: true,
                    message: 'تم إنشاء الحساب. يرجى تأكيد بريدك الإلكتروني.'
                }
            }

            return {
                ok: true,
                userId: userId,
                message: 'تم إنشاء الحساب بنجاح'
            }
        } catch (err) {
            console.error('Registration error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Login an existing user using Supabase Auth
     */
    async login(email: string, password: string): Promise<AuthResult> {
        try {
            // 1. Login with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password
            })

            if (authError) {
                console.error('Login error:', authError)
                if (authError.message.includes('Invalid login credentials')) {
                    return { ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
                }
                if (authError.message.includes('Email not confirmed')) {
                    return { ok: false, error: 'يرجى تأكيد بريدك الإلكتروني أولاً' }
                }
                return { ok: false, error: authError.message }
            }

            if (!authData.user) {
                return { ok: false, error: 'فشل في تسجيل الدخول' }
            }

            const userId = authData.user.id

            // 2. Check if user profile is active
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_active')
                .eq('id', userId)
                .single()

            if (profile && !profile.is_active) {
                await supabase.auth.signOut()
                return { ok: false, error: 'الحساب غير مفعل' }
            }

            // 3. Generate current device fingerprint
            const currentFingerprint = await deviceFingerprint.generate()

            // 4. Get registered devices for this user
            const { data: devices } = await supabase
                .from('devices')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)

            // 5. If no device registered, register this one (first login after registration)
            if (!devices || devices.length === 0) {
                const newDeviceId = deviceFingerprint.generateDeviceId()
                await supabase.from('devices').insert({
                    user_id: userId,
                    device_id: newDeviceId,
                    device_fingerprint: currentFingerprint.hash,
                    device_info: currentFingerprint.info,
                    is_active: true
                })
                console.log('✅ First device registered for user')
                return { ok: true, userId: userId }
            }

            // 6. Compare fingerprints - flexible matching for cross-browser support
            const matchedDevice = devices.find(d => {
                // First: try exact hash match
                if (d.device_fingerprint === currentFingerprint.hash) {
                    console.log('✅ Exact fingerprint match')
                    return true
                }
                // Second: try flexible hardware-based match (for different browsers on same device)
                return this.isMatchingDevice(d.device_info, currentFingerprint)
            })

            if (matchedDevice) {
                // Same device - allow login
                // Update last_used and fingerprint (to keep it current)
                await supabase
                    .from('devices')
                    .update({
                        last_used: new Date().toISOString(),
                        device_fingerprint: currentFingerprint.hash,
                        device_info: currentFingerprint.info
                    })
                    .eq('id', matchedDevice.id)

                return { ok: true, userId: userId }
            } else {
                // Different device - reject and sign out
                await supabase.auth.signOut()
                return {
                    ok: false,
                    error: 'لا يمكن تسجيل الدخول من جهاز جديد. تم تحديد جهاز آخر سابقًا.',
                    deviceMismatch: true,
                }
            }
        } catch (err) {
            console.error('Login error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Switch device - delete old device and register new one
     */
    async switchDevice(email: string, password: string): Promise<AuthResult> {
        try {
            // 1. Verify credentials with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password
            })

            if (authError || !authData.user) {
                return { ok: false, error: 'فشل في التحقق من البيانات' }
            }

            const userId = authData.user.id

            // 2. Delete all old devices for this user
            await supabase.from('devices').delete().eq('user_id', userId)

            // 3. Generate new device fingerprint
            const newFingerprint = await deviceFingerprint.generate()
            const newDeviceId = deviceFingerprint.generateDeviceId()

            // 4. Save new device
            await supabase.from('devices').insert({
                user_id: userId,
                device_id: newDeviceId,
                device_fingerprint: newFingerprint.hash,
                device_info: newFingerprint.info,
                is_active: true,
            })

            console.log('🔐 تم تغيير الجهاز بنجاح:', { deviceId: newDeviceId, userId })

            return { ok: true, userId: userId, message: 'تم تغيير الجهاز بنجاح' }
        } catch (err) {
            console.error('Switch device error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Verify current session using Supabase Auth
     */
    async verifySession(): Promise<SessionVerifyResult> {
        try {
            // 1. Get current session from Supabase Auth
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error || !session) {
                return { valid: false, error: 'لا توجد جلسة' }
            }

            const userId = session.user.id

            // 2. Check if user profile is active
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_active')
                .eq('id', userId)
                .single()

            if (profile && !profile.is_active) {
                await supabase.auth.signOut()
                return { valid: false, error: 'الحساب غير مفعل' }
            }

            // 3. Verify device fingerprint
            const currentFingerprint = await deviceFingerprint.generate()

            const { data: devices } = await supabase
                .from('devices')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)

            if (!devices || devices.length === 0) {
                await supabase.auth.signOut()
                return { valid: false, error: 'الجهاز غير مسجل' }
            }

            // 4. Compare fingerprints - flexible matching
            const matchedDevice = devices.find(d => {
                const isExactMatch = d.device_fingerprint === currentFingerprint.hash
                const isFlexibleMatch = this.isMatchingDevice(d.device_info, currentFingerprint)
                return isExactMatch || isFlexibleMatch
            })

            if (!matchedDevice) {
                await supabase.auth.signOut()
                return { valid: false, error: 'تم الكشف عن تغيير في الجهاز' }
            }

            // Update fingerprint if needed
            if (matchedDevice.device_fingerprint !== currentFingerprint.hash) {
                await supabase
                    .from('devices')
                    .update({
                        device_fingerprint: currentFingerprint.hash,
                        device_info: currentFingerprint.info,
                        last_used: new Date().toISOString()
                    })
                    .eq('id', matchedDevice.id)
            } else {
                // Just update last_used
                await supabase
                    .from('devices')
                    .update({ last_used: new Date().toISOString() })
                    .eq('id', matchedDevice.id)
            }

            return { valid: true, userId }
        } catch (err) {
            console.error('Session verification error:', err)
            return { valid: false, error: 'خطأ في التحقق من الجلسة' }
        }
    }

    /**
     * Request Password Reset using Supabase Auth
     */
    async forgotPassword(email: string): Promise<AuthResult> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) {
                console.error('forgotPassword error:', error)
                // Don't reveal if email exists or not for security
            }

            // Always return success for security (don't reveal if email exists)
            return { 
                ok: true, 
                message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابط إعادة تعيين كلمة المرور' 
            }
        } catch (err) {
            console.error('forgotPassword error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Reset Password using Supabase Auth (called after clicking email link)
     */
    async resetPassword(newPassword: string): Promise<AuthResult> {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) {
                console.error('resetPassword error:', error)
                return { ok: false, error: 'فشل في تحديث كلمة المرور' }
            }

            return { ok: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' }
        } catch (err) {
            console.error('resetPassword error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Logout using Supabase Auth
     */
    async logout(): Promise<void> {
        try {
            await supabase.auth.signOut()
        } catch (err) {
            console.error('Logout error:', err)
        }
    }

    /**
     * Get current user ID from Supabase Auth
     */
    async getCurrentUserId(): Promise<string | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            return session?.user?.id || null
        } catch {
            return null
        }
    }

    /**
     * Get user info by ID
     */
    async getUserInfo(userId: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error || !data) {
                console.error('Error fetching user info:', error)
                return null
            }

            return data as UserProfile
        } catch (err) {
            console.error('getUserInfo error:', err)
            return null
        }
    }

    /**
     * Get current user's email from Supabase Auth
     */
    async getCurrentUserEmail(): Promise<string | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            return session?.user?.email || null
        } catch {
            return null
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: { fullName?: string, email?: string, password?: string }): Promise<AuthResult> {
        try {
            // Update auth email/password if needed
            if (updates.email || updates.password) {
                const authUpdates: any = {}
                if (updates.email) authUpdates.email = updates.email.toLowerCase()
                if (updates.password) authUpdates.password = updates.password

                const { error: authError } = await supabase.auth.updateUser(authUpdates)
                if (authError) {
                    console.error('Error updating auth:', authError)
                    if (authError.message.includes('already registered')) {
                        return { ok: false, error: 'البريد الإلكتروني مستخدم بالفعل' }
                    }
                    return { ok: false, error: authError.message }
                }
            }

            // Update profile if fullName changed
            if (updates.fullName) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .update({ full_name: updates.fullName })
                    .eq('id', userId)

                if (profileError) {
                    console.error('Error updating profile:', profileError)
                    return { ok: false, error: 'فشل في تحديث الملف الشخصي' }
                }
            }

            return { ok: true, message: 'تم تحديث الملف الشخصي بنجاح' }
        } catch (err) {
            console.error('updateProfile error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع أثناء التحديث' }
        }
    }

    /**
     * Get user reading progress
     */
    async getReadingProgress(userId: string): Promise<any | null> {
        try {
            const { data, error } = await supabase
                .from('reading_progress')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()

            if (error) {
                console.error('Error fetching reading progress:', error)
                return null
            }

            // If no record exists, create one
            if (!data) {
                const { data: newProgress, error: insertError } = await supabase
                    .from('reading_progress')
                    .insert({
                        user_id: userId,
                        current_page: 1,
                        total_pages: TOTAL_BOOK_PAGES,
                        bookmarks: [],
                        completion_percentage: 0,
                    })
                    .select()
                    .single()

                if (insertError) {
                    console.error('Error creating reading progress:', insertError)
                    return null
                }
                return newProgress
            }

            return data
        } catch (err) {
            console.error('getReadingProgress error:', err)
            return null
        }
    }

    /**
     * Update user reading progress
     */
    async updateReadingProgress(userId: string, updates: { currentPage?: number, completionPercentage?: number, lastReadSection?: number }): Promise<boolean> {
        try {
            const payload: any = {}
            if (updates.currentPage !== undefined) payload.current_page = updates.currentPage
            if (updates.completionPercentage !== undefined) payload.completion_percentage = updates.completionPercentage

            if (updates.lastReadSection !== undefined) {
                // التأكد من أن التقدم للأمام فقط
                const { data: current } = await supabase
                    .from('reading_progress')
                    .select('last_read_section')
                    .eq('user_id', userId)
                    .maybeSingle()

                if (!current || updates.lastReadSection > (current.last_read_section ?? -1)) {
                    payload.last_read_section = updates.lastReadSection
                }
            }

            if (Object.keys(payload).length === 0) return true

            const { error } = await supabase
                .from('reading_progress')
                .update(payload)
                .eq('user_id', userId)

            if (error) {
                console.error('Error updating reading progress:', error)
                return false
            }

            return true
        } catch (err) {
            console.error('updateReadingProgress error:', err)
            return false
        }
    }

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback)
    }
}

// Export singleton instance
export const authSystem = new AuthSystem()
