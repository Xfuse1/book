'use client'

import Link from 'next/link'
import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navigation() {
    const pathname = usePathname()

    const links = [
        { href: '/', label: 'الرئيسية' },
        { href: '/toc', label: 'الفهرس' },
    ]

    const headerRef = useRef<HTMLElement>(null)

    useEffect(() => {
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
            resizeObserver.disconnect()
            window.removeEventListener('resize', updateHeaderHeight)
        }
    }, [])

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
                </ul>
            </div>
        </motion.nav>
    )
}
