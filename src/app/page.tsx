'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'
import {
    MagicWand,
    DigitalBrain,
    CodeBrackets,
    SmartBulb,
    PenIcon,
    UICardIcon,
    FlowchartIcon,
    SitemapIcon,
    CheckmarkIcon,
    DatabaseIcon
} from '@/components/FloatingAssets'

export default function Home() {
    return (
        <>
            <Navigation />

            <main className="hero-section">
                {/* Floating Assets */}
                <div className="floating-assets" style={{ pointerEvents: 'none', zIndex: 5 }}>
                    {/* Element 1: Magic Wand (Top Left) */}
                    <motion.div
                        className="floating-asset"
                        style={{ top: '15%', left: '10%', opacity: 0.8, scale: 1.2 }}
                        animate={{
                            y: [0, -30, 0],
                            rotate: [-5, 5, -5],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <MagicWand />
                    </motion.div>

                    {/* New Element: Pen (Top Left Area) */}
                    <motion.div
                        className="floating-asset"
                        style={{ top: '5%', left: '25%', opacity: 0.9, scale: 1.3 }}
                        animate={{
                            y: [0, 20, 0],
                            rotate: [0, 10, 0],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    >
                        <PenIcon />
                    </motion.div>

                    {/* Element 2: Digital Brain (Bottom Left) */}
                    <motion.div
                        className="floating-asset"
                        style={{ bottom: '20%', left: '15%', opacity: 0.8, scale: 1.2 }}
                        animate={{
                            y: [0, 25, 0],
                            scale: [1.2, 1.3, 1.2],
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <DigitalBrain />
                    </motion.div>

                    {/* New Element: Flowchart (Bottom Left Area) */}
                    <motion.div
                        className="floating-asset"
                        style={{ bottom: '8%', left: '5%', opacity: 0.8, scale: 1.2 }}
                        animate={{
                            x: [0, 15, 0],
                            y: [0, -15, 0],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <FlowchartIcon />
                    </motion.div>

                    {/* Element 3: Smart Bulb (Top Right) */}
                    <motion.div
                        className="floating-asset"
                        style={{ top: '20%', right: '10%', opacity: 0.8, scale: 1.2 }}
                        animate={{
                            y: [0, -40, 0],
                            rotate: [10, -10, 10],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <SmartBulb />
                    </motion.div>

                    {/* New Element: Checkmark (Top Right Area) */}
                    <motion.div
                        className="floating-asset"
                        style={{ top: '10%', right: '25%', opacity: 0.9, scale: 1.3 }}
                        animate={{
                            scale: [1.1, 1.3, 1.1],
                            opacity: [0.8, 1, 0.8],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <CheckmarkIcon />
                    </motion.div>

                    {/* Element 4: Code Brackets (Bottom Right) */}
                    <motion.div
                        className="floating-asset"
                        style={{ bottom: '15%', right: '15%', opacity: 0.8, scale: 1.2 }}
                        animate={{
                            y: [0, 35, 0],
                            rotateX: [0, 20, 0],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <CodeBrackets />
                    </motion.div>

                    {/* New Element: Database (Bottom Right Area) */}
                    <motion.div
                        className="floating-asset"
                        style={{ bottom: '5%', right: '30%', opacity: 0.8, scale: 1.2 }}
                        animate={{
                            y: [0, -25, 0],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    >
                        <DatabaseIcon />
                    </motion.div>

                    {/* New Element: UI Card (Middle Right Area) */}
                    <motion.div
                        className="floating-asset"
                        style={{ top: '45%', right: '12%', opacity: 0.8, scale: 1.4 }}
                        animate={{
                            rotateY: [0, 15, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <UICardIcon />
                    </motion.div>

                    {/* New Element: Sitemap (Middle Left Area) */}
                    <motion.div
                        className="floating-asset"
                        style={{ top: '55%', left: '12%', opacity: 0.8, scale: 1.2 }}
                        animate={{
                            rotate: [-5, 5, -5],
                            scale: [1.2, 1.25, 1.2],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <SitemapIcon />
                    </motion.div>

                    {/* Existing Cube (repositioned) */}
                    <motion.div
                        className="floating-asset asset-cube"
                        style={{ top: '40%', left: '5%', width: '100px', height: '100px' }}
                        animate={{
                            y: [0, 40, 0],
                            rotate: [10, -10, 10],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Image src="/assets/cube.png" alt="Glowing Cube" fill style={{ objectFit: 'contain', opacity: 0.5 }} />
                    </motion.div>

                    {/* Existing Gear (repositioned) */}
                    <motion.div
                        className="floating-asset asset-gear"
                        style={{ top: '50%', right: '5%', width: '120px', height: '120px' }}
                        animate={{
                            rotate: 360,
                            y: [0, -30, 0],
                        }}
                        transition={{
                            rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
                            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                        }}
                    >
                        <Image src="/assets/gear.png" alt="Glowing Gear" fill style={{ objectFit: 'contain', opacity: 0.4 }} />
                    </motion.div>

                    <motion.div
                        className="code-window-card"
                        style={{ top: '25%', left: '25%' }}
                        animate={{
                            y: [0, -25, 0],
                            rotate: [-2, 2, -2],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
                        </div>
                        <div style={{ fontSize: '12px', color: '#FF6B35', fontFamily: 'monospace', opacity: 0.8 }}>
                            {'.glow-card {'}
                            <br />
                            {'  light: orange;'}
                            <br />
                            {'  status: expert;'}
                            <br />
                            {'}'}
                        </div>
                    </motion.div>
                </div>

                {/* Hero Content */}
                <div className="container hero-container">
                    <div className="hero-grid">
                        {/* Right Content - Robot (Order swapped for RTL/LTR flow and better mobile stack) */}
                        <motion.div
                            className="hero-image-container"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                        >
                            <Robot
                                size={550}
                                variant="video"
                                videoSrc="https://uusefrutihcozxrtdrat.supabase.co/storage/v1/object/sign/robot%20vedio%202/AZtlkAe6oTEHBCJ7-vdsnw-AZtlkAe7xnD8T7hZ_ktz0A.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZTBiZmNhNC04MWNhLTQ5Y2ItOTBkYy00MzliZTQ5NDA1ZjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyb2JvdCB2ZWRpbyAyL0FadGxrQWU2b1RFSEJDSjctdmRzbnctQVp0bGtBZTd4bkQ4VDdoWl9rdHowQS5tcDQiLCJpYXQiOjE3NjcwMjU3MjgsImV4cCI6MjYzMTAyNTcyOH0.-YfDTaSvVIExsYZWgVYIQDh4xooWvYyTX0oEukVB9uU"
                            />
                            <div className="robot-glow-bg" />
                        </motion.div>

                        {/* Left Content */}
                        <motion.div
                            className="hero-text-container"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <motion.h1 className="hero-title">
                                بناء موقع أو تطبيق
                                <br />
                                <span className="text-gradient">باستخدام البرومبتات</span>
                            </motion.h1>

                            <motion.p className="hero-description">
                                حوّل أفكارك إلى واقع ملموس واحترافي من خلال إتقان فن صياغة الأوامر الذكية.
                            </motion.p>

                            <motion.div className="hero-actions">
                                <Link href="/toc" className="btn btn-primary">
                                    <span>ابدأ القراءة الآن</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </>
    )
}
