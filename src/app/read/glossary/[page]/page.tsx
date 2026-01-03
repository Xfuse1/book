'use client'

import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'
import { glossaryData, PageContent } from '@/data/bookData'
import { useEffect, useState } from 'react'

export default function GlossaryPage() {
    const params = useParams()
    const router = useRouter()
    const pageNum = parseInt(params.page as string) || 1
    const [currentPage, setCurrentPage] = useState<PageContent | undefined>(glossaryData[pageNum - 1])

    useEffect(() => {
        const page = glossaryData[pageNum - 1]
        if (page) {
            setCurrentPage(page)
        } else {
            if (params.page) {
                router.push('/toc')
            }
        }
    }, [pageNum, router, params.page])

    if (!currentPage) return null

    const totalPages = glossaryData.length
    const isFirstPage = pageNum === 1
    const isLastPage = pageNum === totalPages

    const handleNext = () => {
        if (!isLastPage) {
            router.push(`/read/glossary/${pageNum + 1}`)
        } else {
            router.push('/toc')
        }
    }

    const handlePrev = () => {
        if (!isFirstPage) {
            router.push(`/read/glossary/${pageNum - 1}`)
        }
    }

    return (
        <>
            <Navigation />

            <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '0' }}>

                <div className="container" style={{ paddingBottom: '40px', maxWidth: '1000px' }}>
                    <motion.div
                        style={{ textAlign: 'center', marginBottom: '48px' }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{
                            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                            margin: '0 0 16px 0',
                            background: 'linear-gradient(to bottom, #fff 40%, #FF6B35)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 900
                        }}>
                            {currentPage.title}
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#b0b0b0', maxWidth: '800px', margin: '0 auto' }}>
                            {currentPage.description}
                        </p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                        {currentPage.contentBlocks.map((block, index) => {
                            if (block.type !== 'card') return null;

                            // Split title into Arabic and English
                            const titleParts = block.title?.split(' — ') || [];
                            const arabicName = titleParts[0];
                            const englishName = titleParts[1];

                            return (
                                <motion.div
                                    key={index}
                                    className="card card-glow"
                                    style={{
                                        padding: '28px',
                                        background: 'rgba(255, 107, 53, 0.04)',
                                        border: '1px solid rgba(255, 107, 53, 0.15)',
                                        borderRadius: '20px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    whileHover={{ y: -5, background: 'rgba(255, 107, 53, 0.08)' }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: '0',
                                        right: '0',
                                        width: '100px',
                                        height: '100px',
                                        background: 'radial-gradient(circle at top right, rgba(255, 107, 53, 0.1), transparent 70%)',
                                        pointerEvents: 'none'
                                    }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '1.6rem', margin: 0, color: '#FF6B35', fontWeight: '800' }}>
                                            {arabicName}
                                        </h3>
                                        {englishName && (
                                            <span style={{
                                                fontSize: '1.1rem',
                                                color: '#888',
                                                fontWeight: '500',
                                                fontFamily: 'Outfit, sans-serif',
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '4px 12px',
                                                borderRadius: '20px'
                                            }}>
                                                {englishName}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{
                                        fontSize: '1.1rem',
                                        color: '#d0d0d0',
                                        lineHeight: '1.7',
                                        margin: 0,
                                        maxWidth: '100%'
                                    }}>
                                        {block.content}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Navigation */}
                    <div style={{
                        marginTop: '60px',
                        paddingTop: '40px',
                        borderTop: '1px solid rgba(255, 107, 53, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '30px'
                    }}>
                        {/* Progress Dots */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {glossaryData.map((p) => (
                                <motion.div
                                    key={p.id}
                                    style={{
                                        width: p.id === pageNum ? '32px' : '8px',
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: p.id === pageNum
                                            ? 'linear-gradient(90deg, #FF6B35, #FF8C42)'
                                            : 'rgba(255, 107, 53, 0.2)',
                                        boxShadow: p.id === pageNum ? '0 0 12px rgba(255, 107, 53, 0.4)' : 'none'
                                    }}
                                    layout
                                />
                            ))}
                        </div>

                        <div className="nav-buttons-container">
                            <button
                                onClick={handlePrev}
                                className={`btn btn-secondary nav-action-btn ${isFirstPage ? 'disabled' : ''}`}
                                disabled={isFirstPage}
                                style={{
                                    opacity: isFirstPage ? 0.3 : 1
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: 'rotate(180deg)' }}>
                                    <path d="M13 5l-5 5 5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>السابق</span>
                            </button>

                            <button
                                onClick={handleNext}
                                className="btn btn-primary nav-action-btn nav-action-btn-next"
                            >
                                <span style={{ fontWeight: 800 }}>{isLastPage ? 'العودة للفهرس' : 'التالي'}</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M13 5l-5 5 5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Link href="/toc" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                            العودة إلى الفهرس
                        </Link>
                    </div>
                </div>
            </main>
        </>
    )
}
