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
        // We use screen.width/height (actual screen size, not window size)
        // cpuCores and memory help distinguish different physical devices
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
            // 1. Hash the password
            const passwordHash = await this.hashPassword(password)

            // 2. Check if user already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase())
                .single()

            if (existingUser) {
                return { ok: false, error: 'البريد الإلكتروني مسجل بالفعل' }
            }

            // 2.5 Check if phone already exists if provided
            if (phoneNumber) {
                const { data: existingPhone } = await supabase
                    .from('users')
                    .select('id')
                    .eq('phone_number', phoneNumber)
                    .single()

                if (existingPhone) {
                    return { ok: false, error: 'رقم الهاتف مسجل بالفعل' }
                }
            }

            // 3. Create user in database
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert({
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
                console.error('Error creating user:', userError)
                return { ok: false, error: 'فشل في إنشاء الحساب' }
            }

            // 3.5 Skip SMS verification as requested
            /*
            if (phoneNumber) {
                await this.sendSMSVerification(newUser.id, phoneNumber)
            }
            */

            // 4. Generate device fingerprint
            const fingerprintData = await deviceFingerprint.generate()
            const deviceId = deviceFingerprint.generateDeviceId()

            // 5. Save device
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

            // 6. Create session
            const session = await this.createSession(newUser.id, deviceId)
            if (!session) {
                return { ok: false, error: 'فشل في إنشاء الجلسة' }
            }

            // 7. Save to cookies
            saveAuthCookies(session.token, deviceId, newUser.id)

            // 8. Create reading progress record
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
            const { data: devices } = await supabase
                .from('devices')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)

            // 5. Compare fingerprints - flexible matching for cross-browser support
            const matchedDevice = devices?.find(d => {
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

                // Create new session
                const session = await this.createSession(user.id, matchedDevice.device_id)
                if (!session) {
                    return { ok: false, error: 'فشل في إنشاء الجلسة' }
                }

                // Save to cookies
                saveAuthCookies(session.token, matchedDevice.device_id, user.id)

                return { ok: true, userId: user.id }
            } else {
                // Different device or no device registered - reject
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
            console.log(`📱 SMS TO ${phoneNumber}: Your verification code is: ${code}`)
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
     * Request Password Reset
     */
    async forgotPassword(email: string): Promise<AuthResult> {
        try {
            // 1. Find user
            const { data: user, error } = await supabase
                .from('users')
                .select('id, full_name')
                .eq('email', email.toLowerCase())
                .single()

            if (error || !user) {
                // Return success even if user not found for security reasons
                console.log(`Password reset requested for non-existent email: ${email}`)
                return { ok: true, message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رمز تعيين كلمة المرور' }
            }

            // 2. Generate 6-digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString()

            // 3. Store code
            await supabase
                .from('users')
                .update({ verification_code: code })
                .eq('id', user.id)

            // 4. Send real email via Resend
            try {
                const { resend } = await import('./resend')
                const emailResult = await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: [email],
                    subject: 'رمز إعادة تعيين كلمة المرور - خبير التوجيهات الذكية',
                    html: `
                        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #FF6B35;">استعادة كلمة المرور</h2>
                            <p>أهلاً بك يا ${user.full_name || 'مستخدمنا العزيز'}،</p>
                            <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. يرجى استخدام الرمز التالي:</p>
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 10px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; border: 1px dashed #FF6B35; color: #FF6B35;">
                                ${code}
                            </div>
                            <p>إذا لم تكن أنت من طلب هذا، يرجى تجاهل هذا البريد.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #777;">خبير التوجيهات الذكية - جميع الحقوق محفوظة</p>
                        </div>
                    `
                })

                if (emailResult.error) {
                    console.error('❌ Resend logic error:', emailResult.error)
                } else {
                    console.log(`✅ Real email sent! ID: ${emailResult.data?.id}, To: ${email}`)
                }
            } catch (emailErr) {
                console.error('❌ Failed to send real email (catch block):', emailErr)
            }

            return { ok: true, message: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' }
        } catch (err) {
            console.error('forgotPassword error:', err)
            return { ok: false, error: 'حدث خطأ غير متوقع' }
        }
    }

    /**
     * Reset Password
     */
    async resetPassword(email: string, code: string, newPassword: string): Promise<AuthResult> {
        try {
            // 1. Verify user and code
            const { data: user, error } = await supabase
                .from('users')
                .select('id, verification_code')
                .eq('email', email.toLowerCase())
                .single()

            if (error || !user) {
                return { ok: false, error: 'البريد الإلكتروني غير موجود' }
            }

            if (user.verification_code !== code) {
                return { ok: false, error: 'رمز التحقق غير صحيح' }
            }

            // 2. Hash new password
            const passwordHash = await this.hashPassword(newPassword)

            // 3. Update password and clear code
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    password_hash: passwordHash,
                    verification_code: null
                })
                .eq('id', user.id)

            if (updateError) {
                return { ok: false, error: 'فشل في تحديث كلمة المرور' }
            }

            return { ok: true, message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول' }
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
                        last_read_section: -1,
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
}

// Export singleton instance
export const authSystem = new AuthSystem()
