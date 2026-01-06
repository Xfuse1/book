'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthCard from '@/components/auth/AuthCard'
import AuthInput from '@/components/auth/AuthInput'
import DeviceSwitchModal from '@/components/auth/DeviceSwitchModal'
import Navigation from '@/components/Navigation'
import { authSystem } from '@/lib/auth_system'
import '@/app/auth.css'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextPath = searchParams.get('next') || '/toc'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false)

    // Custom auth system login with device fingerprinting
    const login = async (email: string, pass: string) => {
        const result = await authSystem.login(email, pass)
        if (result.ok) {
            return { ok: true }
        } else if (result.deviceMismatch) {
            return { ok: false, reason: 'device_mismatch' as const }
        } else {
            return { ok: false, reason: 'invalid' as const }
        }
    }

    // Switch device using authSystem
    const switchDevice = async (e: string, p: string) => {
        return await authSystem.switchDevice(e, p)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!email || !password) {
            setError('يرجى ملء جميع الحقول')
            return
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('بريد إلكتروني غير صالح')
            return
        }
        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            return
        }

        setIsLoading(true)
        const result = await login(email, password)
        setIsLoading(false)

        if (result.ok) {
            router.push(nextPath)
        } else {
            if (result.reason === 'device_mismatch') {
                setIsDeviceModalOpen(true)
            } else if (result.reason === 'invalid') {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
            } else {
                setError('حدث خطأ في الاتصال، حاول مرة أخرى')
            }
        }
    }

    const handleDeviceConfirm = async () => {
        setIsLoading(true)
        const result = await switchDevice(email, password)
        setIsLoading(false)
        if (result.ok) {
            console.log('✅ تم تبديل الجهاز بنجاح')
            setIsDeviceModalOpen(false)
            // Add small delay to ensure cookies are saved before redirect
            await new Promise(resolve => setTimeout(resolve, 100))
            router.push(nextPath)
        } else {
            setError(result.error || 'فشل في تبديل الجهاز')
            setIsDeviceModalOpen(false)
        }
    }

    return (
        <main className="auth-container">
            <Navigation />

            <AuthCard
                title="تسجيل الدخول"
                subtitle="أهلاً بك مجدداً في رحلتك التعليمية"
            >
                {error && <div id="login-error" className="auth-global-error">{error}</div>}

                <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
                    <AuthInput
                        id="login-email"
                        label="البريد الإلكتروني"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        required
                    />

                    <AuthInput
                        id="login-password"
                        label="كلمة المرور"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary mt-md"
                        disabled={isLoading}
                    >
                        {isLoading ? <div className="auth-loader"></div> : "دخول"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>ليس لديك حساب؟ </span>
                    <Link id="register-link" href={`/register${nextPath !== '/toc' ? `?next=${nextPath}` : ''}`}>
                        إنشاء حساب جديد
                    </Link>
                </div>
            </AuthCard>

            <DeviceSwitchModal
                isOpen={isDeviceModalOpen}
                onClose={() => setIsDeviceModalOpen(false)}
                onConfirm={handleDeviceConfirm}
                isLoading={isLoading}
            />
        </main>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-loader"></div></div>}>
            <LoginContent />
        </Suspense>
    )
}
