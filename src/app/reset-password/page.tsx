'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthCard from '@/components/auth/AuthCard'
import AuthInput from '@/components/auth/AuthInput'
import Navigation from '@/components/Navigation'
import { authSystem } from '@/lib/auth_system'
import '@/app/auth.css'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const emailParam = searchParams.get('email') || ''

    const [email, setEmail] = useState(emailParam)
    const [code, setCode] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (!email || !code || !password) {
            setError('يرجى ملء جميع الحقول')
            return
        }

        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            return
        }

        setIsLoading(true)
        const result = await authSystem.resetPassword(email, code, password)
        setIsLoading(false)

        if (result.ok) {
            setMessage(result.message || 'تم تغيير كلمة المرور بنجاح')
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } else {
            setError(result.error || 'حدث خطأ ما')
        }
    }

    return (
        <main className="auth-container">
            <Navigation />

            <AuthCard
                title="تعيين كلمة مرور جديدة"
                subtitle="أدخل الرمز المرسل وكلمة المرور الجديدة"
            >
                {error && <div className="auth-global-error">{error}</div>}
                {message && <div className="auth-success-box">{message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <AuthInput
                        id="reset-email"
                        label="البريد الإلكتروني"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        required
                    />

                    <AuthInput
                        id="reset-code"
                        label="رمز التحقق"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        required
                    />

                    <AuthInput
                        id="reset-password"
                        label="كلمة المرور الجديدة"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
