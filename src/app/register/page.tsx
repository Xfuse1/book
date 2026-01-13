'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthCard from '@/components/auth/AuthCard'
import AuthInput from '@/components/auth/AuthInput'
import Navigation from '@/components/Navigation'
import { authSystem } from '@/lib/auth_system'
import '@/app/auth.css'

function RegisterContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextPath = searchParams.get('next') || '/toc'

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // Custom auth system registration with verification code
    const register = async (name: string, email: string, pass: string, phone: string) => {
        return await authSystem.registerWithVerification(name, email, pass, phone)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!form.fullName || !form.email || !form.password || !form.confirmPassword || !form.phoneNumber) {
            setError('يرجى ملء جميع الحقول')
            return
        }
        if (!/\S+@\S+\.\S+/.test(form.email)) {
            setError('بريد إلكتروني غير صالح')
            return
        }
        if (form.password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            return
        }
        if (form.password !== form.confirmPassword) {
            setError('كلمات المرور غير متطابقة')
            return
        }
        if (!form.phoneNumber || form.phoneNumber.length < 10) {
            setError('يرجى إدخال رقم هاتف صحيح')
            return
        }

        setIsLoading(true)
        const result = await register(form.fullName, form.email, form.password, form.phoneNumber)
        setIsLoading(false)

        if (result.ok && result.userId) {
            // Redirect to verify code page
            router.push(`/verify-code?uid=${result.userId}`)
        } else {
            setError(result.error || 'حدث خطأ غير متوقع')
        }
    }

    return (
        <main className="auth-container">
            <Navigation />

            <AuthCard
                title="إنشاء حساب"
                subtitle="ابدأ رحلتك في تعلم توجيهات الذكاء الاصطناعي"
            >
                {error && <div id="register-error" className="auth-global-error">{error}</div>}

                <form id="register-form" className="auth-form" onSubmit={handleSubmit}>
                    <AuthInput
                        id="register-name"
                        label="الاسم الكامل"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="اكتب اسمك هنا"
                        required
                    />

                    <AuthInput
                        id="register-email"
                        label="البريد الإلكتروني"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                        required
                    />

                    <AuthInput
                        id="register-phone"
                        label="رقم الهاتف"
                        name="phoneNumber"
                        type="tel"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        placeholder="05xxxxxxx"
                        required
                    />

                    <AuthInput
                        id="register-password"
                        label="كلمة المرور"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <AuthInput
                        id="register-confirm-password"
                        label="تأكيد كلمة المرور"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <button
                        id="register-submit"
                        type="submit"
                        className="btn btn-primary mt-md"
                        disabled={isLoading}
                    >
                        {isLoading ? <div className="auth-loader"></div> : "إنشاء الحساب"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>لديك حساب بالفعل؟ </span>
                    <Link id="login-link" href={`/login${nextPath !== '/toc' ? `?next=${nextPath}` : ''}`}>
                        تسجيل الدخول
                    </Link>
                </div>
            </AuthCard>
        </main>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-loader"></div></div>}>
            <RegisterContent />
        </Suspense>
    )
}
