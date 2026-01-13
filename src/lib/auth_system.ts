// Authentication System
// Handles user registration, login, device verification, and session management

import { supabase } from './supabase'
import { deviceFingerprint, DeviceFingerprintData } from './fingerprint'
import { saveAuthCookies, getAuthCookies, clearAuthCookies } from './cookie_utils'
import { SESSION_DURATION_MS, TOTAL_BOOK_PAGES } from './config'

// Types for our custom tables
interface User {
    id: string
    email: string
    password_hash: string
    full_name: string | null
    phone_number: string | null
    is_phone_verified: boolean
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

interface Session {
    id: string
    user_id: string
    device_id: string
    session_token: string
    expires_at: string
    created_at: string
}

// Result types
export interface AuthResult {
    ok: boolean
    error?: string
    message?: string
    userId?: string
    deviceMismatch?: boolean
    needsVerification?: boolean
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
            return false
        }

        // 1. Core properties that MUST match
        const platformMatch = savedDeviceInfo.platform === currentFingerprint.info.platform
        const timezoneMatch = savedDeviceInfo.timezone === currentFingerprint.info.timezone
        const colorDepthMatch = savedDeviceInfo.colorDepth === currentFingerprint.info.colorDepth

        // 2. Hardware properties (can be null/undefined or vary slightly between browsers)
        // We allow match if they are equal OR if one of them is missing (some browsers hide these)
        const cpuMatch = !savedDeviceInfo.cpuCores || !currentFingerprint.info.cpuCores ||
            savedDeviceInfo.cpuCores === currentFingerprint.info.cpuCores

        const memMatch = !savedDeviceInfo.memory || !currentFingerprint.info.memory ||
            savedDeviceInfo.memory === currentFingerprint.info.memory

        const isSameDevice = platformMatch && timezoneMatch && colorDepthMatch && cpuMatch && memMatch

        // Log comparison details for debugging
        console.log('📱 Device Match Check:', {
            isSameDevice,
            matches: {
                platform: platformMatch,
                timezone: timezoneMatch,
                colorDepth: colorDepthMatch,
                cpu: cpuMatch,
                mem: memMatch
            }
        })

        return isSameDevice
    }

    /**
     * Hash a password using SHA-256
     */
    private async hashPassword(password: string): Promise<string> {
        return await deviceFingerprint.hashString(password)
    }

    /**
     * Generate a random session token
     */
    private generateSessionToken(): string {
        return 'sess_' + crypto.randomUUID() + '_' + Date.now().toString(36)
    }

    /**
     * Create a new session in the database
     */
    private async createSession(userId: string, deviceId: string): Promise<{ token: string; expiresAt: Date } | null> {
        const token = this.generateSessionToken()
        const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

        const { error } = await supabase.from('sessions').insert({
            user_id: userId,
            device_id: deviceId,
            session_token: token,
            expires_at: expiresAt.toISOString(),
        })

        if (error) {
            console.error('Error creating session:', error)
            return null
        }

        return { token, expiresAt }
    }

    /**
     * Register a new user
     */
    async register(fullName: string, email: string, password: string, phoneNumber?: string): Promise<AuthResult> {
        try {
            // 1. Hash the local password
            const passwordHash = await this.hashPassword(password)

            // 2. Check if user already exists in our table
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase())
                .single()

            if (existingUser) {
                return { ok: false, error: 'البريد الإلكتروني مسجل بالفعل' }
            }

            // 3. Register in Supabase Auth FIRST to get the official ID
            const { data: authData, error: sbAuthError } = await supabase.auth.signUp({
                email: email.toLowerCase(),
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })

            if (sbAuthError) {
                console.error('Supabase Auth error:', sbAuthError)
                return { ok: false, error: 'فشل في إنشاء الحساب (Auth): ' + sbAuthError.message }
            }

            if (!authData.user) {
                return { ok: false, error: 'فشل في الحصول على بيانات المستخدم' }
            }

            const authUserId = authData.user.id

            // 4. Create user in our public.users table using the SAME ID
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert({
                    id: authUserId, // Use the ID from Supabase Auth!
                    email: email.toLowerCase(),
                    password_hash: passwordHash,
                    full_name: fullName,
                    phone_number: phoneNumber || null,
                    is_phone_verified: true,
                    is_active: true,
                })
                .select()
                .single()

            if (userError || !newUser) {
                console.error('Error creating public user:', userError)
                // If this fails, we might have an orphaned Auth user, but that's okay for now
                return { ok: false, error: 'فشل في إكمال بيانات الحساب' }
            }

            // 5. Generate device fingerprint
            const fingerprintData = await deviceFingerprint.generate()
            const deviceId = deviceFingerprint.generateDeviceId()

            // 6. Save device
            const { error: deviceError } = await supabase.from('devices').insert({
                user_id: newUser.id,
                device_id: deviceId,
                device_fingerprint: fingerprintData.hash,
                device_info: fingerprintData.info,
                is_active: true,
            })

            if (deviceError) {
                console.error('Error saving device:', deviceError)
            }

            // 7. Create session
            const session = await this.createSession(newUser.id, deviceId)
            if (!session) {
                return { ok: false, error: 'فشل في إنشاء الجلسة' }
            }

            // 8. Save to cookies
            saveAuthCookies(session.token, deviceId, newUser.id)

            // 9. Create reading progress record
            await supabase.from('reading_progress').insert({
                user_id: newUser.id,
                current_page: 1,
                total_pages: TOTAL_BOOK_PAGES,
                bookmarks: [],
                completion_percentage: 0,
            })

            return {
                ok: true,
                userId: newUser.id,
                needsVerification: false
            }
        } catch (err) {
            console.error('Registration error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Login an existing user
     */
    async login(email: string, password: string): Promise<AuthResult> {
        try {
            // 1. Hash the password
            const passwordHash = await this.hashPassword(password)

            // 2. Find user
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('password_hash', passwordHash)
                .single()

            if (userError || !user) {
                return { ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
            }

            if (!user.is_active) {
                return { ok: false, error: 'الحساب غير مفعل' }
            }

            /* Phone verification disabled
            if (user.phone_number && !user.is_phone_verified) {
                return { ok: true, userId: user.id, needsVerification: true }
            }
            */

            // 3. Generate current device fingerprint
            const currentFingerprint = await deviceFingerprint.generate()

            // 4. Get registered devices for this user
            const { data: devices, error: devicesError } = await supabase
                .from('devices')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)


            if (devicesError) {
                console.error('Error fetching devices:', devicesError)
            }

            // 5. Compare fingerprints - flexible matching for cross-browser support
            const matchedDevice = devices?.find(d => {
                // First: try exact hash match
                if (d.device_fingerprint === currentFingerprint.hash) {
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

                // Create new session
                const session = await this.createSession(user.id, matchedDevice.device_id)
                if (!session) {
                    return { ok: false, error: 'فشل في إنشاء الجلسة' }
                }

                // Save to cookies
                saveAuthCookies(session.token, matchedDevice.device_id, user.id)

                return { ok: true, userId: user.id }
            } else {

                // If NO devices are registered at all, this might be an account created before
                // the devices table was set up correctly. Allow registering this device.
                if (!devices || devices.length === 0) {

                    const deviceId = deviceFingerprint.generateDeviceId()

                    // Save device
                    const { error: deviceError } = await supabase.from('devices').insert({
                        user_id: user.id,
                        device_id: deviceId,
                        device_fingerprint: currentFingerprint.hash,
                        device_info: currentFingerprint.info,
                        is_active: true,
                    })

                    if (deviceError) {
                        console.error('Error saving device:', deviceError)
                        return { ok: false, error: 'فشل في تسجيل الجهاز' }
                    }

                    // Create new session
                    const session = await this.createSession(user.id, deviceId)
                    if (!session) {
                        return { ok: false, error: 'فشل في إنشاء الجلسة' }
                    }

                    // Save to cookies
                    saveAuthCookies(session.token, deviceId, user.id)

                    return { ok: true, userId: user.id }
                }

                // Different device - reject
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
            // 1. Verify credentials
            const passwordHash = await this.hashPassword(password)

            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('password_hash', passwordHash)
                .single()

            if (userError || !user) {
                return { ok: false, error: 'فشل في التحقق من البيانات' }
            }

            // 2. Delete all old devices for this user
            await supabase.from('devices').delete().eq('user_id', user.id)

            // 3. Delete all old sessions for this user
            await supabase.from('sessions').delete().eq('user_id', user.id)

            // 4. Generate new device fingerprint
            const newFingerprint = await deviceFingerprint.generate()
            const newDeviceId = deviceFingerprint.generateDeviceId()

            // 5. Save new device
            await supabase.from('devices').insert({
                user_id: user.id,
                device_id: newDeviceId,
                device_fingerprint: newFingerprint.hash,
                device_info: newFingerprint.info,
                is_active: true,
            })

            // 6. Create new session
            const session = await this.createSession(user.id, newDeviceId)
            if (!session) {
                return { ok: false, error: 'فشل في إنشاء الجلسة' }
            }

            // 7. Save to cookies
            saveAuthCookies(session.token, newDeviceId, user.id)
            console.log('🔐 تم حفظ بيانات الجلسة الجديدة في Cookies:', { deviceId: newDeviceId, userId: user.id })

            return { ok: true, userId: user.id, message: 'تم تغيير الجهاز بنجاح' }
        } catch (err) {
            console.error('Switch device error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Verify current session
     */
    async verifySession(): Promise<SessionVerifyResult & { needsVerification?: boolean }> {
        try {
            // 1. Get cookies
            const { sessionToken, deviceId, userId } = getAuthCookies()

            if (!sessionToken || !deviceId || !userId) {
                return { valid: false, error: 'لا توجد جلسة' }
            }

            // 2. Find session in database
            const { data: session } = await supabase
                .from('sessions')
                .select('*')
                .eq('session_token', sessionToken)
                .eq('user_id', userId)
                .eq('device_id', deviceId)
                .single()

            if (!session) {
                clearAuthCookies()
                return { valid: false, error: 'الجلسة غير موجودة' }
            }

            // 3. Check if session expired
            if (new Date(session.expires_at) < new Date()) {
                // Delete expired session
                await supabase.from('sessions').delete().eq('id', session.id)
                clearAuthCookies()
                return { valid: false, error: 'الجلسة منتهية' }
            }

            // 4. Verify device fingerprint
            const currentFingerprint = await deviceFingerprint.generate()

            const { data: device } = await supabase
                .from('devices')
                .select('*')
                .eq('device_id', deviceId)
                .eq('user_id', userId)
                .single()

            if (!device) {
                clearAuthCookies()
                return { valid: false, error: 'الجهاز غير مسجل' }
            }

            // 5. Compare fingerprints - flexible matching for cross-browser support
            const isExactMatch = device.device_fingerprint === currentFingerprint.hash
            const isFlexibleMatch = this.isMatchingDevice(device.device_info, currentFingerprint)

            if (!isExactMatch && !isFlexibleMatch) {
                // Fingerprint changed and hardware doesn't match - invalidate session
                await supabase.from('sessions').delete().eq('id', session.id)
                clearAuthCookies()
                return { valid: false, error: 'تم الكشف عن تغيير في الجهاز' }
            }

            // Update fingerprint if it changed but device matched
            if (!isExactMatch && isFlexibleMatch) {
                await supabase
                    .from('devices')
                    .update({
                        device_fingerprint: currentFingerprint.hash,
                        device_info: currentFingerprint.info
                    })
                    .eq('id', device.id)
            }

            /* Phone verification disabled
            if (user && user.phone_number && !user.is_phone_verified) {
                return { valid: true, userId, needsVerification: true }
            }
            */

            // 6. Update last_used
            await supabase
                .from('devices')
                .update({ last_used: new Date().toISOString() })
                .eq('id', device.id)

            return { valid: true, userId }
        } catch (err) {
            console.error('Session verification error:', err)
            return { valid: false, error: 'خطأ في التحقق من الجلسة' }
        }
    }

    /**
     * Send SMS Verification Code (Mock)
     */
    async sendSMSVerification(userId: string, phoneNumber: string): Promise<boolean> {
        try {
            // Generate 6-digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString()

            // Store code in database (you'll need to add verification_code column)
            const { error } = await supabase
                .from('users')
                .update({ verification_code: code })
                .eq('id', userId)

            if (error) throw error

            // Mock sending SMS
            // alert(`تم إرسال رمز التحقق إلى ${phoneNumber}: ${code}`) // For demo purposes

            return true
        } catch (err) {
            console.error('sendSMSVerification error:', err)
            return false
        }
    }

    /**
     * Verify Phone Code
     */
    async verifyPhoneCode(userId: string, code: string): Promise<AuthResult> {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('verification_code')
                .eq('id', userId)
                .single()

            if (error || !user) {
                return { ok: false, error: 'فشل في العثور على المستخدم' }
            }

            if (user.verification_code === code) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({
                        is_phone_verified: true,
                        verification_code: null
                    })
                    .eq('id', userId)

                if (updateError) {
                    return { ok: false, error: 'فشل في تحديث حالة التحقق' }
                }

                return { ok: true, message: 'تم التحقق من رقم الهاتف بنجاح' }
            } else {
                return { ok: false, error: 'رمز التحقق غير صحيح' }
            }
        } catch (err) {
            console.error('verifyPhoneCode error:', err)
            return { ok: false, error: 'حدث خطأ أثناء التحقق' }
        }
    }

    /**
     * Request password reset using Supabase Auth
     */
    async requestPasswordReset(email: string): Promise<AuthResult> {
        try {
            // 1. Check if user exists in our public.users first
            const { data: user, error: publicError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase())
                .single()

            if (publicError || !user) {
                return { ok: false, error: 'البريد الإلكتروني غير مسجل' }
            }

            // 2. Call Supabase Auth to send reset email
            // This will send an email with a link to our site
            const redirectTo = `${window.location.origin}/reset-password`
            console.log('🔗 Requesting reset with redirect to:', redirectTo)

            const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
                redirectTo: redirectTo,
            })

            if (error) {
                console.error('Supabase reset error:', error)
                return { ok: false, error: 'فشل في إرسال البريد: ' + error.message }
            }

            return { ok: true, message: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. يرجى مراجعة البريد (والبريد العشوائي/Spam).' }
        } catch (err) {
            console.error('requestPasswordReset error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Reset password using Supabase Auth session
     */
    async resetPassword(newPassword: string): Promise<AuthResult> {
        try {
            // 1. Update password in Supabase Auth
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) {
                return { ok: false, error: 'فشل في تحديث كلمة المرور: ' + error.message }
            }

            // 2. ALSO Update password in our public.users table (synced)
            if (data?.user?.email) {
                const passwordHash = await this.hashPassword(newPassword)
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ password_hash: passwordHash })
                    .eq('email', data.user.email.toLowerCase())

                if (updateError) {
                    console.error('Error syncing password to public.users:', updateError)
                }
            }

            return { ok: true, message: 'تم تغيير كلمة المرور بنجاح' }
        } catch (err) {
            console.error('resetPassword error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Logout - clear session and cookies
     */
    async logout(): Promise<void> {
        try {
            const { sessionToken } = getAuthCookies()

            if (sessionToken) {
                // Delete session from database
                await supabase.from('sessions').delete().eq('session_token', sessionToken)
            }

            // Clear cookies
            clearAuthCookies()
        } catch (err) {
            console.error('Logout error:', err)
            // Clear cookies anyway
            clearAuthCookies()
        }
    }

    /**
     * Get current user ID from cookies
     */
    getCurrentUserId(): string | null {
        const { userId } = getAuthCookies()
        return userId
    }

    /**
     * Get user info by ID
     */
    async getUserInfo(userId: string): Promise<User | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error || !data) {
                console.error('Error fetching user info:', error)
                return null
            }

            return data as User
        } catch (err) {
            console.error('getUserInfo error:', err)
            return null
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: { fullName?: string, email?: string, password?: string }): Promise<AuthResult> {
        try {
            const updatePayload: any = {}

            if (updates.fullName) {
                updatePayload.full_name = updates.fullName
            }

            if (updates.email) {
                // Check if email is already taken by another user
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', updates.email.toLowerCase())
                    .neq('id', userId)
                    .single()

                if (existingUser) {
                    return { ok: false, error: 'البريد الإلكتروني مستخدم بالفعل من قبل حساب آخر' }
                }
                updatePayload.email = updates.email.toLowerCase()
            }

            if (updates.password) {
                const passwordHash = await this.hashPassword(updates.password)
                updatePayload.password_hash = passwordHash
            }

            if (Object.keys(updatePayload).length === 0) {
                return { ok: true, message: 'لا يوجد تغييرات لتحديثها' }
            }

            const { error } = await supabase
                .from('users')
                .update(updatePayload)
                .eq('id', userId)

            if (error) {
                console.error('Error updating profile:', error)
                return { ok: false, error: 'فشل في تحديث بيانات الملف الشخصي' }
            }

            return { ok: true, message: 'تم تحديث الملف الشخصي بنجاح' }
        } catch (err) {
            console.error('updateProfile error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع أثناء التحديث' }
        }
    }

    /**
     * Update reading progress for the current user
     */
    async updateReadingProgress(pageNumber: number): Promise<void> {
        try {
            const userId = this.getCurrentUserId()
            if (!userId) {
                console.log('⚠️ updateReadingProgress: No userId found in cookies')
                return
            }

            console.log(`📊 Attempting to update progress for user ${userId} to page ${pageNumber}`)

            // 1. Get current total pages (fallback to config)
            let totalPages = TOTAL_BOOK_PAGES
            const { data: currentProgress, error: fetchError } = await supabase
                .from('reading_progress')
                .select('current_page, total_pages')
                .eq('user_id', userId)
                .maybeSingle()

            if (fetchError) {
                console.warn('⚠️ Note fetching existing progress:', fetchError.message)
            }

            if (currentProgress && currentProgress.total_pages) {
                totalPages = currentProgress.total_pages
            }

            // 2. Update current page (always save where the user is)
            // But we don't necessarily want to treat it as "progress" if they jump around
            // For now, we update it so "Resume Reading" works, but Roadmap checkmarks
            // will now use the dedicated 'completed_chapters' column.

            // 3. Upsert current page progress
            const { error: upsertError } = await supabase
                .from('reading_progress')
                .upsert({
                    user_id: userId,
                    current_page: pageNumber,
                    total_pages: totalPages,
                    last_read_time: new Date().toISOString()
                }, {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                })

            if (upsertError) {
                console.error('❌ Error saving reading progress:', upsertError)
            } else {
                console.log(`✅ Progress advanced: Page ${pageNumber}`)
            }
        } catch (err) {
            console.error('💥 Unexpected error in updateReadingProgress:', err)
        }
    }

    /**
     * Get reading progress for the current user
     */
    /**
     * Get detailed reading progress including completed chapters
     */
    async getDetailedProgress(): Promise<{ currentPage: number, totalPages: number, percentage: number, completedChapters: number[] } | null> {
        try {
            const userId = this.getCurrentUserId()
            if (!userId) return null

            const { data, error } = await supabase
                .from('reading_progress')
                .select('current_page, total_pages, completion_percentage, completed_chapters')
                .eq('user_id', userId)
                .maybeSingle()

            if (error || !data) return null

            // Map string array to number array for chapter indices
            const completedChapters = (data.completed_chapters || []).map((id: string) => parseInt(id))

            return {
                currentPage: data.current_page || 1,
                totalPages: data.total_pages || TOTAL_BOOK_PAGES,
                percentage: data.completion_percentage || 0,
                completedChapters
            }
        } catch (err) {
            console.error('getDetailedProgress error:', err)
            return null
        }
    }

    /**
     * Mark a specific chapter as completed
     */
    async completeChapter(chapterIndex: number): Promise<void> {
        try {
            const userId = this.getCurrentUserId()
            if (!userId) return

            // 1. Get current completed chapters
            const { data } = await supabase
                .from('reading_progress')
                .select('completed_chapters')
                .eq('user_id', userId)
                .single()

            const current = data?.completed_chapters || []
            const indexStr = chapterIndex.toString()

            if (current.includes(indexStr)) return

            // 2. Update with new chapter
            const updated = [...current, indexStr]

            // 3. Calculate new percentage (9 total chapters)
            const TOTAL_CHAPTERS = 9
            const percentage = Math.min(Math.round((updated.length / TOTAL_CHAPTERS) * 100), 100)

            await supabase
                .from('reading_progress')
                .update({
                    completed_chapters: updated,
                    completion_percentage: percentage
                })
                .eq('user_id', userId)

            console.log(`✅ Chapter ${chapterIndex} marked as completed (${percentage}%)`)
        } catch (err) {
            console.error('completeChapter error:', err)
        }
    }

    /**
     * Generate a random verification code (6 characters)
     */
    private generateVerificationCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded confusing chars: 0,O,1,I
        let code = ''
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }

    /**
     * Register a new user with verification code (requires admin approval)
     */
    async registerWithVerification(fullName: string, email: string, password: string, phoneNumber: string): Promise<AuthResult & { userId?: string }> {
        try {
            // 1. Hash the local password
            const passwordHash = await this.hashPassword(password)

            // 2. Check if user already exists in our table
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase())
                .single()

            if (existingUser) {
                return { ok: false, error: 'البريد الإلكتروني مسجل بالفعل' }
            }

            // 3. Register in Supabase Auth FIRST to get the official ID
            const { data: authData, error: sbAuthError } = await supabase.auth.signUp({
                email: email.toLowerCase(),
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })

            if (sbAuthError) {
                console.error('Supabase Auth error:', sbAuthError)
                return { ok: false, error: 'فشل في إنشاء الحساب: ' + sbAuthError.message }
            }

            if (!authData.user) {
                return { ok: false, error: 'فشل في الحصول على بيانات المستخدم' }
            }

            const authUserId = authData.user.id

            // 4. Create user in our public.users table (NOT ACTIVE YET)
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert({
                    id: authUserId,
                    email: email.toLowerCase(),
                    password_hash: passwordHash,
                    full_name: fullName,
                    phone_number: phoneNumber,
                    is_phone_verified: false,
                    is_verified: false,
                    is_active: false, // Not active until code verification
                })
                .select()
                .single()

            if (userError || !newUser) {
                console.error('Error creating public user:', userError)
                return { ok: false, error: 'فشل في إكمال بيانات الحساب' }
            }

            // 5. Generate verification code
            const verificationCode = this.generateVerificationCode()

            // 6. Save verification code to database
            const { error: codeError } = await supabase.from('verification_codes').insert({
                user_id: newUser.id,
                code: verificationCode,
                is_used: false,
            })

            if (codeError) {
                console.error('Error saving verification code:', codeError)
                return { ok: false, error: 'فشل في إنشاء كود التحقق' }
            }

            // 7. Create reading progress record (for later use)
            await supabase.from('reading_progress').insert({
                user_id: newUser.id,
                current_page: 1,
                total_pages: TOTAL_BOOK_PAGES,
                bookmarks: [],
                completion_percentage: 0,
            })


            return {
                ok: true,
                userId: newUser.id,
                needsVerification: true,
                message: 'تم إنشاء الحساب بنجاح، يرجى إدخال الكود السري'
            }
        } catch (err) {
            console.error('Registration error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Login user directly using userId (after code verification)
     */
    async loginWithUserId(userId: string): Promise<AuthResult> {
        try {
            // 1. Find user
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (userError || !user) {
                return { ok: false, error: 'المستخدم غير موجود' }
            }

            // 2. Generate device fingerprint
            const fingerprintData = await deviceFingerprint.generate()
            const deviceId = deviceFingerprint.generateDeviceId()

            // 3. Save device
            const { error: deviceError } = await supabase.from('devices').insert({
                user_id: user.id,
                device_id: deviceId,
                device_fingerprint: fingerprintData.hash,
                device_info: fingerprintData.info,
                is_active: true,
            })

            if (deviceError) {
                console.error('Error saving device:', deviceError)
            }

            // 4. Create session
            const session = await this.createSession(user.id, deviceId)
            if (!session) {
                return { ok: false, error: 'فشل في إنشاء الجلسة' }
            }

            // 5. Save to cookies
            saveAuthCookies(session.token, deviceId, user.id)

            return {
                ok: true,
                userId: user.id
            }
        } catch (err) {
            console.error('Login with userId error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }
}

// Export singleton instance
export const authSystem = new AuthSystem()
