'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthCard from '@/components/auth/AuthCard'
import AuthInput from '@/components/auth/AuthInput'
import Navigation from '@/components/Navigation'
import { authSystem } from '@/lib/auth_system'
import '@/app/auth.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (!email) {
            setError('يرجى إدخال البريد الإلكتروني')
            return
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('بريد إلكتروني غير صالح')
            return
        }

        setIsLoading(true)
        const result = await authSystem.forgotPassword(email)
        setIsLoading(false)

        if (result.ok) {
            setMessage(result.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
            setEmailSent(true)
        } else {
            setError(result.error || 'حدث خطأ ما')
        }
    }

    return (
        <main className="auth-container">
            <Navigation />

            <AuthCard
                title="استعادة كلمة المرور"
                subtitle={emailSent ? "تم إرسال الرابط!" : "أدخل بريدك الإلكتروني للحصول على رابط التغيير"}
            >
                {error && <div className="auth-global-error">{error}</div>}
                {message && <div className="auth-success-box">{message}</div>}

                {!emailSent ? (
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
                            {isLoading ? <div className="auth-loader"></div> : "إرسال رابط التغيير"}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <p style={{ marginBottom: '20px', color: '#666' }}>
                            تحقق من بريدك الإلكتروني واضغط على الرابط لإعادة تعيين كلمة المرور.
                        </p>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setEmailSent(false)
                                setMessage('')
                                setEmail('')
                            }}
                        >
                            إرسال مرة أخرى
                        </button>
                    </div>
                )}

                <div className="auth-footer">
                    <Link href="/login">
                        العودة لتسجيل الدخول
                    </Link>
                </div>
            </AuthCard>
        </main>
    )
}
