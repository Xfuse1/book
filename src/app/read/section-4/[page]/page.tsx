'use client'

import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'
import { section4 } from '@/data/bookData'
import { useEffect, useState } from 'react'

export default function Section4Page() {
    const params = useParams()
    const router = useRouter()
    const pageNum = parseInt(params.page as string) || 1
    const [currentPage, setCurrentPage] = useState(section4[pageNum - 1])

    useEffect(() => {
        const page = section4[pageNum - 1]
        if (page) {
            setCurrentPage(page)
        } else {
            router.push('/toc')
        }
    }, [pageNum, router])

    if (!currentPage) return null

    const totalPages = section4.length
    const isFirstPage = pageNum === 1
    const isLastPage = pageNum === totalPages

    const handleNext = () => {
        if (!isLastPage) {
            router.push(`/read/section-4/${pageNum + 1}`)
        } else {
            router.push('/toc')
        }
    }

    const handlePrev = () => {
        if (!isFirstPage) {
            router.push(`/read/section-4/${pageNum - 1}`)
        }
    }

    return (
        <>
            <Navigation />

            <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '0' }}>

                <div className="container" style={{ paddingBottom: '40px', maxWidth: '1400px' }}>
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

                    <div className="read-layout-grid">
                        {/* Left Column: Stacked Content Blocks */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            key={pageNum}
                            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                        >
                            {currentPage.contentBlocks.map((block, index) => (
                                <div key={index}>
                                    {block.type === 'text' && (
                                        <div style={{
                                            padding: '16px 24px',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            borderRadius: '12px',
                                            borderRight: '4px solid #FF6B35'
                                        }}>
                                            {block.title && <h4 style={{ color: '#FF6B35', marginBottom: '8px' }}>{block.title}</h4>}
                                            <p style={{
                                                fontSize: '1.1rem',
                                                lineHeight: '1.8',
                                                color: '#d0d0d0',
                                                margin: 0,
                                                whiteSpace: 'pre-line'
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
                                                background: 'rgba(255, 107, 53, 0.04)',
                                                border: '1px solid rgba(255, 107, 53, 0.15)',
                                                borderRadius: '16px',
                                            }}
                                            whileHover={{ y: -5, background: 'rgba(255, 107, 53, 0.06)' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: '#FF6B35',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    color: '#fff'
                                                }}>
                                                    ✦
                                                </div>
                                                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#FFB800' }}>
                                                    {block.title}
                                                </h3>
                                            </div>
                                            {block.content && (
                                                <p style={{ fontSize: '1.05rem', color: '#fff', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: block.items ? '16px' : '0' }}>
                                                    {block.content}
                                                </p>
                                            )}

                                            {block.items && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {block.items.map((item, idx) => (
                                                        <details
                                                            key={idx}
                                                            style={{
                                                                background: 'rgba(255, 255, 255, 0.03)',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                border: '1px solid rgba(255, 255, 255, 0.05)'
                                                            }}
                                                        >
                                                            <summary style={{
                                                                padding: '12px 16px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold',
                                                                color: '#e0e0e0',
                                                                fontSize: '0.95rem',
                                                                userSelect: 'none',
                                                                outline: 'none'
                                                            }}>
                                                                {item.title}
                                                            </summary>
                                                            <div style={{
                                                                padding: '0 16px 16px 16px',
                                                                fontSize: '0.9rem',
                                                                color: '#b0b0b0',
                                                                lineHeight: '1.5'
                                                            }}>
                                                                {item.content}
                                                            </div>
                                                        </details>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                    {block.type === 'code' && (
                                        <div style={{ marginTop: '10px' }}>
                                            {block.title && <h3 style={{ color: '#FF6B35', marginBottom: '12px', fontSize: '1.4rem' }}>{block.title}</h3>}
                                            <div className="code-block" style={{ margin: 0, padding: '24px', position: 'relative' }}>
                                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}><code style={{ color: '#FFB800' }}>{block.code}</code></pre>
                                                {block.content && (
                                                    <div style={{
                                                        marginTop: '16px',
                                                        paddingTop: '16px',
                                                        borderTop: '1px solid rgba(255,107,53,0.2)',
                                                        fontSize: '0.9rem',
                                                        color: '#888',
                                                        whiteSpace: 'pre-line'
                                                    }}>
                                                        {block.content}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>

                        {/* Right Column: Robot + Floating Prompt Card */}
                        <div style={{
                            position: 'sticky',
                            top: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '40px'
                        }}>
                            <div style={{ position: 'relative' }}>
                                <Robot size={320} />

                                {/* Prompt Box Overlay */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        bottom: '-20px',
                                        left: '-40px',
                                        width: '300px',
                                        background: 'rgba(10, 10, 10, 0.95)',
                                        border: '1px solid #FF6B35',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(255,107,53,0.2)',
                                        zIndex: 10,
                                        backdropFilter: 'blur(8px)'
                                    }}
                                    animate={{
                                        y: [0, -12, 0],
                                        rotate: [-0.5, 0.5, -0.5]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff5f56' }} />
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffbd2e' }} />
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#27c93f' }} />
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#FF6B35', fontFamily: 'monospace' }}>
                                        {`{
  "section": 4,
  "status": "UX Writing",
  "theme": "Content Strategy",
  "ai_mode": "Expert"
}`}
                                    </div>
                                </motion.div>
                            </div>

                            <div style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, rgba(255,107,53,0.08), transparent)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,107,53,0.1)'
                            }}>
                                <h4 style={{ color: '#FFB800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>💡</span> نصيحة القسم
                                </h4>
                                <p style={{ color: '#b0b0b0', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                                    نبرة المحتوى هي شخصية مشروعك. اجعلها ثابتة وواضحة، واعلم أن الـ Microcopy الصحيح هو ما يحول الزائر العادي إلى مستخدم مخلص.
                                </p>
                            </div>
                        </div>
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
                            {section4.map((p) => (
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
                </div>
            </main>
        </>
    )
}
