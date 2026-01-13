'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import '@/app/auth.css'
import './dashboard.css'

interface VerificationRecord {
    id: string
    user_id: string
    code: string
    created_at: string
    is_used: boolean
    used_at: string | null
    user?: {
        full_name: string
        email: string
        phone_number: string
    }
}

export default function AdminDashboard() {
    const [records, setRecords] = useState<VerificationRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [adminPassword, setAdminPassword] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState<'all' | 'pending' | 'used'>('pending')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Simple admin password check (you should change this)
    const ADMIN_PASSWORD = 'admin2024secret'

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (adminPassword === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
            setError('')
            localStorage.setItem('admin_auth', 'true')
        } else {
            setError('كلمة المرور غير صحيحة')
        }
    }

    useEffect(() => {
        // Check if already authenticated
        const isAuth = localStorage.getItem('admin_auth')
        if (isAuth === 'true') {
            setIsAuthenticated(true)
        }
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            fetchRecords()
            // Auto-refresh every 10 seconds
            const interval = setInterval(fetchRecords, 10000)
            return () => clearInterval(interval)
        }
    }, [isAuthenticated, filter])

    const fetchRecords = async () => {
        setIsLoading(true)
        try {
            let query = supabase
                .from('verification_codes')
                .select(`
                    *,
                    user:users(full_name, email, phone_number)
                `)
                .order('created_at', { ascending: false })

            if (filter === 'pending') {
                query = query.eq('is_used', false)
            } else if (filter === 'used') {
                query = query.eq('is_used', true)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching records:', error)
                return
            }

            setRecords(data || [])
        } catch (err) {
            console.error('Fetch error:', err)
        }
        setIsLoading(false)
    }

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_auth')
        setIsAuthenticated(false)
        setAdminPassword('')
    }

    if (!isAuthenticated) {
        return (
            <main className="admin-login-container">
                <div className="admin-login-card">
                    <h1 className="admin-title">🔐 لوحة الإدارة</h1>
                    <p className="admin-subtitle">أدخل كلمة المرور للوصول</p>
                    
                    {error && <div className="auth-global-error">{error}</div>}
                    
                    <form onSubmit={handleAdminLogin} className="admin-login-form">
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="كلمة المرور"
                            className="auth-input"
                        />
                        <button type="submit" className="btn btn-primary">
                            دخول
                        </button>
                    </form>
                </div>
            </main>
        )
    }

    return (
        <main className="admin-container">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>🔐 لوحة أكواد التحقق</h1>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                        تسجيل الخروج
                    </button>
                </div>
            </header>

            <div className="admin-controls">
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        ⏳ في الانتظار
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'used' ? 'active' : ''}`}
                        onClick={() => setFilter('used')}
                    >
                        ✅ تم الاستخدام
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        📋 الكل
                    </button>
                </div>
                <button onClick={fetchRecords} className="btn btn-secondary btn-sm refresh-btn">
                    🔄 تحديث
                </button>
            </div>

            {isLoading ? (
                <div className="admin-loading">
                    <div className="auth-loader"></div>
                    <p>جاري التحميل...</p>
                </div>
            ) : records.length === 0 ? (
                <div className="admin-empty">
                    <p>📭 لا توجد سجلات</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>البريد</th>
                                <th>الهاتف</th>
                                <th>الكود</th>
                                <th>تاريخ الإنشاء</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record.id} className={record.is_used ? 'used-row' : 'pending-row'}>
                                    <td>{record.user?.full_name || 'غير معروف'}</td>
                                    <td>{record.user?.email || 'غير معروف'}</td>
                                    <td className="phone-cell">{record.user?.phone_number || 'غير متوفر'}</td>
                                    <td className="code-cell">
                                        <span className="verification-code">{record.code}</span>
                                    </td>
                                    <td>{formatDate(record.created_at)}</td>
                                    <td>
                                        {record.is_used ? (
                                            <span className="status-badge used">✅ مُستخدم</span>
                                        ) : (
                                            <span className="status-badge pending">⏳ في الانتظار</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => copyCode(record.code, record.id)}
                                            className="btn btn-copy"
                                            disabled={record.is_used}
                                        >
                                            {copiedId === record.id ? '✓ تم النسخ' : '📋 نسخ'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="admin-stats">
                <div className="stat-card">
                    <span className="stat-number">{records.filter(r => !r.is_used).length}</span>
                    <span className="stat-label">في الانتظار</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{records.filter(r => r.is_used).length}</span>
                    <span className="stat-label">تم التفعيل</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{records.length}</span>
                    <span className="stat-label">الإجمالي</span>
                </div>
            </div>
        </main>
    )
}
