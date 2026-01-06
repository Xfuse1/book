'use client'

import { motion } from 'framer-motion'

interface ReadingPaginationProps {
    currentIndex: number
    total: number
    onPrev: () => void
    onNext: () => void
    isFirst: boolean
    isLast: boolean
    isNextLocked: boolean
    onLockedClick: () => void
}

export default function ReadingPagination({
    currentIndex,
    total,
    onPrev,
    onNext,
    isFirst,
    isLast,
    isNextLocked,
    onLockedClick
}: ReadingPaginationProps) {

    const handleNextClick = () => {
        if (isNextLocked) {
            onLockedClick()
        } else {
            onNext()
        }
    }

    return (
        <div className="reading-nav-container">
            <div className="nav-buttons-row">
                {/* Previous Button (Right in RTL start) */}
                <button
                    onClick={onPrev}
                    className="reading-nav-btn prev"
                    disabled={isFirst}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7 15l5-5-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>السابق</span>
                </button>

                {/* Progress Dots (Center) */}
                <div className="pagination-dots">
                    {Array.from({ length: total }).map((_, index) => (
                        <motion.div
                            key={index}
                            className={`reading-dot ${index === currentIndex ? 'reading-dot-active' : 'reading-dot-inactive'}`}
                            layout
                        />
                    ))}
                </div>

                {/* Next Button (Left in RTL end) */}
                <button
                    onClick={handleNextClick}
                    className="reading-nav-btn next"
                >
                    <span>{isLast ? 'العودة للفهرس' : 'التالي'}</span>
                    <svg style={{ transform: 'rotate(180deg)' }} width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7 15l5-5-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
