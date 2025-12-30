'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'
import { section2 } from '@/data/bookData'
import { useEffect, useState } from 'react'

export default function Section2Page() {
    const params = useParams()
    const router = useRouter()
    const pageNum = parseInt(params.page as string) || 1
    const [currentPage, setCurrentPage] = useState(section2[pageNum - 1])

    useEffect(() => {
        const page = section2[pageNum - 1]
        if (page) {
            setCurrentPage(page)
        } else {
            router.push('/toc')
        }
    }, [pageNum, router])

    if (!currentPage) return null

    const totalPages = section2.length
    const isFirstPage = pageNum === 1
    const isLastPage = pageNum === totalPages

    const handleNext = () => {
        if (!isLastPage) {
            router.push(`/read/section-2/${pageNum + 1}`)
        } else {
            router.push('/toc')
        }
    }

    const handlePrev = () => {
        if (!isFirstPage) {
            router.push(`/read/section-2/${pageNum - 1}`)
        }
    }

    return (
        <>
            <Navigation />

            <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '80px' }}>
                {/* Background Particles */}

                <div className="container" style={{ paddingBottom: '40px', maxWidth: '1400px' }}>
                    {/* Header - Centered as in screenshot */}
                    <motion.div
                        style={{ textAlign: 'center', marginBottom: '48px' }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                            margin: '0 0 16px 0',
                            background: 'linear-gradient(to bottom, #fff 40%, #FF6B35)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 900
                        }}>
                            {currentPage.title}
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#b0b0b0', maxWidth: '800px', margin: '0 auto' }}>
                            {currentPage.description}
                        </p>
                    </motion.div>

                    <div className="read-layout-grid">
                        {/* Dense Content Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            key={pageNum}
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            {currentPage.contentBlocks.map((block, index) => (
                                <div key={index}>
                                    {block.type === 'text' && (
                                        <div style={{
                                            padding: '20px 0',
                                            borderRight: index === 0 ? '4px solid #FF6B35' : 'none',
                                            paddingRight: index === 0 ? '20px' : '0'
                                        }}>
                                            <p style={{
                                                fontSize: '1.15rem',
                                                lineHeight: '1.7',
                                                color: index === 0 ? '#fff' : '#b0b0b0',
                                                fontWeight: index === 0 ? 600 : 400
                                            }}>
                                                {block.content}
                                            </p>
                                        </div>
                                    )}
                                    {block.type === 'card' && (
                                        <motion.div
                                            className="card card-glow"
                                            style={{
                                                padding: '24px',
                                                background: 'rgba(255, 107, 53, 0.03)',
                                                border: '1px solid rgba(255, 107, 53, 0.1)',
                                                borderRadius: '16px',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            whileHover={{ y: -5, background: 'rgba(255, 107, 53, 0.05)' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1rem',
                                                    fontWeight: '900',
                                                    color: '#fff',
                                                    flexShrink: 0
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <h3 style={{ fontSize: '1.4rem', margin: 0, color: '#FF6B35' }}>
                                                    {block.title}
                                                </h3>
                                            </div>
                                            <p style={{ fontSize: '1.05rem', color: '#d0d0d0', margin: '0 48px 0 0' }}>
                                                {block.content}
                                            </p>
                                        </motion.div>
                                    )}
                                    {block.type === 'code' && (
                                        <div style={{ marginTop: '10px' }}>
                                            {block.content && <p style={{ color: '#FFB800', marginBottom: '10px', fontSize: '0.9rem' }}>✦ {block.content}</p>}
                                            <div className="code-block" style={{ margin: 0 }}>
                                                <pre><code>{block.code}</code></pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>

                        {/* Interactive Sidebar with Robot and Code Card */}
                        <div style={{
                            position: 'sticky',
                            top: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '30px'
                        }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                style={{ position: 'relative' }}
                            >
                                <Robot size={350} />

                                {/* Floating Code Card like in screenshot */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        top: '60%',
                                        right: '-40px',
                                        width: '280px',
                                        background: 'rgba(15, 15, 15, 0.9)',
                                        border: '1px solid rgba(255, 107, 53, 0.3)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255, 107, 53, 0.1)',
                                        zIndex: 10,
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [-1, 1, -1]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
                                    </div>
                                    <pre style={{ margin: 0, fontSize: '11px', color: '#FF8C42', opacity: 0.9 }}>
                                        <code>{`{
  "prompt": "تحويل الفكرة إلى كود",
  "status": "ready",
  "precision": 1.0
}`}</code>
                                    </pre>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,107,53,0.1), transparent)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,107,53,0.05)',
                                    width: '100%'
                                }}
                            >
                                <h4 style={{ color: '#FF6B35', marginBottom: '8px', fontSize: '1rem' }}>نصيحة تقنية</h4>
                                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    استخدم قوالب المواصفات الجاهزة لتوفير الوقت وضمان تغطية كافة جوانب المشروع بشكل منهجي.
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
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
                            {section2.map((p) => (
                                <motion.div
                                    key={p.id}
                                    style={{
                                        width: p.id === pageNum ? '30px' : '8px',
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: p.id === pageNum
                                            ? 'linear-gradient(90deg, #FF6B35, #FF8C42)'
                                            : 'rgba(255, 107, 53, 0.2)',
                                        boxShadow: p.id === pageNum ? '0 0 10px rgba(255, 107, 53, 0.5)' : 'none'
                                    }}
                                    layoutId="dot"
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
                                <span style={{ fontWeight: 700 }}>{isLastPage ? 'نهاية القسم' : 'التالي'}</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M13 5l-5 5 5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <Link href="/toc" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }} className="hover-orange">
                            العودة إلى الفهرس
                        </Link>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .hover-orange:hover {
                    color: #FF6B35 !important;
                }
            `}</style>
        </>
    )
}
