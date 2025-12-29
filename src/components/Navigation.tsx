'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navigation() {
    const pathname = usePathname()

    const links = [
        { href: '/', label: 'الرئيسية' },
        { href: '/toc', label: 'الفهرس' },
    ]

    return (
        <motion.nav
            className="nav"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="nav-content">
                <Link href="/" className="nav-logo">
                    خبير البرومبتات
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
