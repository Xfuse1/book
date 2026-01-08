'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthCard from '@/components/auth/AuthCard'
import AuthInput from '@/components/auth/AuthInput'
import Navigation from '@/components/Navigation'
import { authSystem } from '@/lib/auth_system'
import { supabase } from '@/lib/supabase'
import '@/app/auth.css'

function ResetPasswordContent() {
    const router = useRouter()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Check if user came from password reset email link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setIsValidSession(true)
            } else {
                setError('رابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.')
            }
            setChecking(false)
        }
        checkSession()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (!password || !confirmPassword) {
            setError('يرجى ملء جميع الحقول')
            return
        }

        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            return
        }

        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة')
            return
        }

        setIsLoading(true)
        const result = await authSystem.resetPassword(password)
        setIsLoading(false)

        if (result.ok) {
            setMessage(result.message || 'تم تغيير كلمة المرور بنجاح')
            // Sign out and redirect to login
            await supabase.auth.signOut()
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else {
            setError(result.error || 'حدث خطأ ما')
        }
    }

    if (checking) {
        return (
            <main className="auth-container">
                <Navigation />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <div className="auth-loader"></div>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-container">
            <Navigation />

            <AuthCard
                title="تعيين كلمة مرور جديدة"
                subtitle="أدخل كلمة المرور الجديدة"
            >
                {error && <div className="auth-global-error">{error}</div>}
                {message && <div className="auth-success-box">{message}</div>}

                {isValidSession && !message ? (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <AuthInput
                            id="reset-password"
                            label="كلمة المرور الجديدة"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <AuthInput
                            id="reset-confirm-password"
                            label="تأكيد كلمة المرور"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <button
                            type="submit"
                            className="btn btn-primary mt-md"
                            disabled={isLoading}
                        >
                            {isLoading ? <div className="auth-loader"></div> : "تغيير كلمة المرور"}
                        </button>
                    </form>
                ) : !message ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Link href="/forgot-password" className="btn btn-primary">
                            طلب رابط جديد
                        </Link>
                    </div>
                ) : null}

                <div className="auth-footer">
                    <Link href="/login">
                        العودة لتسجيل الدخول
                    </Link>
                </div>
            </AuthCard>
        </main>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-loader"></div></div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
