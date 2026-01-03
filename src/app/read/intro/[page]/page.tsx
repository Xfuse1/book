'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'
import { introData } from '@/data/bookData'
import { useEffect, useState } from 'react'

export default function IntroPage() {
    const params = useParams()
    const router = useRouter()
    const pageNum = parseInt(params.page as string) || 1
    const [currentPage, setCurrentPage] = useState(introData[pageNum - 1])

    useEffect(() => {
        const page = introData[pageNum - 1]
        if (page) {
            setCurrentPage(page)
        } else {
            router.push('/toc')
        }
    }, [pageNum, router])

    if (!currentPage) return null

    const totalPages = introData.length
    const isFirstPage = pageNum === 1
    const isLastPage = pageNum === totalPages

    const handleNext = () => {
        if (!isLastPage) {
            router.push(`/read/intro/${pageNum + 1}`)
        } else {
            router.push('/read/section-1/1') // Navigate to first chapter
        }
    }

    const handlePrev = () => {
        if (!isFirstPage) {
            router.push(`/read/intro/${pageNum - 1}`)
        } else {
            router.push('/toc')
        }
    }

    return (
        <>
            <Navigation />

            <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>

                <div className="container" style={{ paddingBottom: '40px' }}>
                    {/* Header */}
                    <motion.div
                        style={{ marginBottom: '24px' }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: '900',
                                color: '#FF6B35',
                            }}>
                                {pageNum < 10 ? `0${pageNum}` : pageNum}
                            </span>
                            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0 }}>
                                {currentPage.title}
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.125rem', color: '#b0b0b0' }}>
                            {currentPage.description}
                        </p>
                    </motion.div>

                    <div className="lesson-grid">
                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            key={pageNum} // Re-animate on page change
                        >
                            {currentPage.contentBlocks.map((block, index) => (
                                <div key={index} style={{ marginBottom: '32px' }}>
                                    {block.type === 'text' && (
                                        <p style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
                                            {block.content.split('\n').map((line, i) => (
                                                <span key={i}>
                                                    {line}
                                                    <br />
                                                </span>
                                            ))}
                                        </p>
                                    )}
                                    {block.type === 'card' && (
                                        <div className="card" style={{ padding: '24px' }}>
                                            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.25rem',
                                                    fontWeight: '900',
                                                }}>
                                                    {index + 1}
                                                </span>
                                                {block.title}
                                            </h3>
                                            <div style={{ fontSize: '1rem', color: '#b0b0b0', marginRight: '52px' }}>
                                                {block.content.split('\n').map((line, i) => (
                                                    <span key={i}>
                                                        {line}
                                                        <br />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div
                            className="lesson-sidebar"
                            style={{
                                position: 'sticky',
                                top: '120px',
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <Robot size={300} />
                        </motion.div>
                    </div>

                    {/* Navigation Buttons */}
                    <motion.div
                        className="lesson-nav-footer"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '40px',
                            paddingTop: '32px',
                            borderTop: '1px solid rgba(255, 107, 53, 0.2)',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <button
                            onClick={handlePrev}
                            className="btn btn-secondary"
                            style={{ cursor: 'pointer' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ transform: 'rotate(180deg)' }}>
                                <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                            <span>{isFirstPage ? 'الفهرس' : 'السابق'}</span>
                        </button>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '300px' }}>
                            {introData.map((p) => (
                                <div
                                    key={p.id}
                                    style={{
                                        width: p.id === pageNum ? '24px' : '6px',
                                        height: '6px',
                                        borderRadius: '3px',
                                        background: p.id === pageNum
                                            ? 'linear-gradient(135deg, #FF6B35, #FF8C42)'
                                            : 'rgba(255, 107, 53, 0.3)',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            ))}
                        </div>

                        <button onClick={handleNext} className="btn btn-primary">
                            <span>{isLastPage ? 'ابدأ الفصل الأول' : 'التالي'}</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </button>
                    </motion.div>

                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Link href="/toc" style={{ color: '#b0b0b0', textDecoration: 'none', fontSize: '0.9rem' }}>
                            العودة إلى الفهرس
                        </Link>
                    </div>
                </div>
            </main>
        </>
    )
}
