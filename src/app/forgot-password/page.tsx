'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthCard from '@/components/auth/AuthCard'
import AuthInput from '@/components/auth/AuthInput'
import Navigation from '@/components/Navigation'
import { authSystem } from '@/lib/auth_system'
import '@/app/auth.css'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (!email) {
            setError('يرجى إدخال البريد الإلكتروني')
            return
        }

        setIsLoading(true)
        const result = await authSystem.forgotPassword(email)
        setIsLoading(false)

        if (result.ok) {
            setMessage(result.message || 'تم إرسال رمز التحقق')
            // Redirect to reset password after a short delay
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`)
            }, 2000)
        } else {
            setError(result.error || 'حدث خطأ ما')
        }
    }

    return (
        <main className="auth-container">
            <Navigation />

            <AuthCard
                title="استعادة كلمة المرور"
                subtitle="أدخل بريدك الإلكتروني للحصول على رمز التغيير"
            >
                {error && <div className="auth-global-error">{error}</div>}
                {message && <div className="auth-success-box">{message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <AuthInput
                        id="forgot-email"
                        label="البريد الإلكتروني"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-primary mt-md"
                        disabled={isLoading}
                    >
                        {isLoading ? <div className="auth-loader"></div> : "طلب رمز التغيير"}
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
