'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'
import { introData } from '@/data/bookData'
import { useEffect, useState } from 'react'
import { verifySession } from '@/lib/auth'
import LockedOverlay from '@/components/reading/LockedOverlay'
import ReadingPagination from '@/components/reading/ReadingPagination'

export default function IntroPage() {
    const params = useParams()
    const router = useRouter()
    const pageNum = parseInt(params.page as string) || 1

    const [isAuthed, setIsAuthed] = useState(false)
    const [isLockOverlayOpen, setIsLockOverlayOpen] = useState(false)

    const currentPage = introData[pageNum - 1]
    const totalPages = introData.length
    const isFirstPage = pageNum === 1
    const isLastPage = pageNum === totalPages

    // Intro pages are always free
    const isCurrentPageLocked = false

    useEffect(() => {
        const authed = verifySession()
        setIsAuthed(authed)
    }, [pageNum])

    if (!currentPage) {
        if (typeof window !== 'undefined' && params.page) router.push('/toc')
        return null
    }

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

            {/* Locked Overlay (available if needed, though intro is free) */}
            <LockedOverlay
                isOpen={isLockOverlayOpen}
                onClose={() => setIsLockOverlayOpen(false)}
                nextPath={`/read/intro/${pageNum}`}
            />

            <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>

                <div className="container" style={{
                    paddingBottom: '40px',
                    filter: isCurrentPageLocked ? 'blur(8px)' : 'none',
                    pointerEvents: isCurrentPageLocked ? 'none' : 'auto',
                    opacity: isCurrentPageLocked ? 0.3 : 1
                }}>
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
                        <p style={{ fontSize: '1.25rem', color: '#b0b0b0' }}>
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
                    <ReadingPagination
                        currentIndex={pageNum - 1}
                        total={totalPages}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        isFirst={isFirstPage}
                        isLast={isLastPage}
                        isNextLocked={false} // Intro never locks next button as it leads to free Part 1
                    />

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

