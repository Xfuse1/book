'use client'

import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { authSystem } from '@/lib/auth_system'

export default function Navigation() {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const links = [
        { href: '/', label: 'الرئيسية' },
        { href: '/toc', label: 'الفهرس' },
    ]

    const headerRef = useRef<HTMLElement>(null)

    useEffect(() => {
        // Verify session with database
        const verifyUserSession = async () => {
            const userId = await authSystem.getCurrentUserId()
            if (userId) {
                // Verify with database - this will clear cookies if session is invalid
                const result = await authSystem.verifySession()
                if (!result.valid) {
                    // Session was just invalidated (e.g. from another device)
                    // We need a full reload to ensure all components (LockedOverlay, etc.) 
                    // react to the cleared cookies immediately.
                    window.location.reload()
                }
                setIsLoggedIn(result.valid)
            } else {
                setIsLoggedIn(false)
            }
        }

        // Initial check
        verifyUserSession()

        // Background check every 10 seconds to catch invalidation from other devices
        const intervalId = setInterval(async () => {
            // Only check if we have a userId cookie, otherwise we're already logged out
            const userId = await authSystem.getCurrentUserId()
            if (userId) {
                verifyUserSession()
            }
        }, 10000)

        if (!headerRef.current) return

        const updateHeaderHeight = () => {
            const height = headerRef.current?.offsetHeight || 0
            document.documentElement.style.setProperty('--header-h', `${height}px`)
        }

        const resizeObserver = new ResizeObserver(updateHeaderHeight)
        resizeObserver.observe(headerRef.current)

        // Initial set and window resize fallback
        updateHeaderHeight()
        window.addEventListener('resize', updateHeaderHeight)

        return () => {
            clearInterval(intervalId)
            resizeObserver.disconnect()
            window.removeEventListener('resize', updateHeaderHeight)
        }
    }, [pathname]) // Trigger on every route change, also resets interval


    const handleLogout = async () => {
        await authSystem.logout()
        setIsLoggedIn(false)
        router.push('/')
        router.refresh()
    }

    return (
        <motion.nav
            ref={headerRef}
            className="nav"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="nav-content">
                <Link href="/" className="nav-logo">
                    خبير التوجيهات الذكية
                </Link>

                <ul className="nav-links">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    {isLoggedIn && (
                        <li>
                            <Link
                                href="/profile"
                                className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}
                            >
                                الملف الشخصي
                            </Link>
                        </li>
                    )}
                    <li>
                        {isLoggedIn ? (
                            <motion.button
                                onClick={handleLogout}
                                className="nav-link"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'inherit',
                                    font: 'inherit',
                                    padding: 'var(--spacing-xs) 0',
                                    transition: 'color var(--transition-fast)'
                                }}
                                whileHover={{ color: 'var(--color-orange-glow)' }}
                            >
                                تسجيل الخروج
                            </motion.button>
                        ) : (
                            <Link
                                href="/login"
                                className={`nav-link ${pathname === '/login' ? 'active' : ''}`}
                            >
                                تسجيل الدخول
                            </Link>
                        )}
                    </li>
                </ul>
            </div>
        </motion.nav>
    )
}
