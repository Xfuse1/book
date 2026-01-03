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

const chapters = [
    {
        number: 'المقدمة',
        title: 'التمهيد',
        description: 'مرحباً بك في رحلة بناء المشاريع بالبرومبت',
    },
    {
        number: '01',
        title: 'أساسيات “برومبت مشروع”',
        description: 'تحويل التفكير من الدردشة إلى إدارة مشروع',
    },
    {
        number: '02',
        title: 'من الفكرة إلى مواصفات قابلة للتنفيذ',
        description: 'تحويل الخيال إلى نقاط عمل تقنية منظمة',
    },
    {
        number: '03',
        title: 'تصميم التجربة والهيكل (بدون تصميم ولا كود)',
        description: 'تخطيط رحلة المستخدم وبناء هيكل الموقع المتكامل',
    },
    {
        number: '04',
        title: 'القسم الرابع: كتابة محتوى الواجهة بالبرومبت',
        description: 'إتقان نبرة المحتوى وكتابة نصوص الواجهات والبيع',
    },
    {
        number: '05',
        title: 'القسم الخامس: الجودة والتحسين',
        description: 'قوائم التدقيق والتحسين لضمان جودة المخرجات النهائية',
    },
    {
        number: '06',
        title: 'القسم السادس: الأدوات المستخدمة',
        description: 'اختيار التقنيات المناسبة وتصميم البيانات بالبرومبت',
    },
    {
        number: '07',
        title: 'مكتبة القوالب — 30 قالب برومبت قابل للنسخ',
        description: 'قوالب جاهزة للنسخ تحطي كافة مراحل بناء المشروع',
    },
    {
        number: '08',
        title: 'الملحق',
        description: 'تمارين سريعة + إجابات نموذجية مختصرة لصقل مهاراتك',
    },
]

export default function TOCPage() {
    return (
        <>
            <Navigation />

            <main style={{ minHeight: 'calc(100vh - var(--header-h, 80px))', position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>
                {/* Floating Assets */}
                <div className="floating-assets" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
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

                    {/* --- MAIN IMAGE ASSETS --- */}

                    {/* 1. Flow/Process (Top Left) */}
                    <motion.div
                        className="floating-asset asset-flow"
                        style={{ top: '15%', left: '5%', width: '200px', height: '200px', zIndex: 2 }}
                        animate={{
                            y: [0, 30, 0],
                            rotate: [2, -2, 2],
                        }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Image src="/assets/flow.png" alt="Process Flow" fill style={{ objectFit: 'contain', opacity: 0.6 }} />
                    </motion.div>

                    {/* 2. Quality Badge (Top Right) */}
                    <motion.div
                        className="floating-asset asset-quality"
                        style={{ top: '18%', right: '8%', width: '160px', height: '160px', zIndex: 2 }}
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [-5, 5, -5],
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    >
                        <Image src="/assets/quality.png" alt="Quality Badge" fill style={{ objectFit: 'contain', opacity: 0.8 }} />
                    </motion.div>

                    {/* 3. Cube (Middle Left) */}
                    <motion.div
                        className="floating-asset asset-cube"
                        style={{ top: '45%', left: '4%', width: '180px', height: '180px', zIndex: 1 }}
                        animate={{
                            y: [0, 40, 0],
                            rotate: [10, -10, 10],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Image src="/assets/cube.png" alt="Glowing Cube" fill style={{ objectFit: 'contain', opacity: 0.5 }} />
                    </motion.div>

                    {/* 4. UI Card (Middle Right) */}
                    <motion.div
                        className="floating-asset asset-card"
                        style={{ top: '42%', right: '12%', width: '220px', height: '220px', zIndex: 1 }}
                        animate={{
                            y: [0, -30, 0],
                            rotateY: [0, 10, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    >
                        <Image src="/assets/card.png" alt="UI Card" fill style={{ objectFit: 'contain', opacity: 0.6 }} />
                    </motion.div>

                    {/* 5. Gear (Bottom Right) */}
                    <motion.div
                        className="floating-asset asset-gear"
                        style={{ top: '70%', right: '5%', width: '200px', height: '200px', zIndex: 2 }}
                        animate={{
                            rotate: 360,
                            y: [0, -20, 0],
                        }}
                        transition={{
                            rotate: { duration: 50, repeat: Infinity, ease: 'linear' },
                            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                        }}
                    >
                        <Image src="/assets/gear.png" alt="Glowing Gear" fill style={{ objectFit: 'contain', opacity: 0.5 }} />
                    </motion.div>

                    {/* 6. Server (Bottom Center-Left) */}
                    <motion.div
                        className="floating-asset asset-server"
                        style={{ bottom: '8%', left: '20%', width: '240px', height: '240px', zIndex: 1 }}
                        animate={{
                            y: [0, -25, 0],
                            rotate: [-3, 3, -3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                    >
                        <Image src="/assets/server.png" alt="Floating Server" fill style={{ objectFit: 'contain', opacity: 0.7 }} />
                    </motion.div>

                    <motion.div
                        className="code-window-card"
                        style={{ top: '28%', left: '30%', opacity: 0.6 }}
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
                        <div style={{ fontSize: '10px', color: '#FF6B35', fontFamily: 'monospace', opacity: 0.8 }}>
                            {'.ui-card {'}
                            <br />
                            {'  float: true;'}
                            <br />
                            {'  style: cinematic;'}
                            <br />
                            {'}'}
                        </div>
                    </motion.div>
                </div>
                <div className="container" style={{ paddingBottom: '80px' }}>
                    {/* Header */}
                    <motion.div
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '16px' }}>
                            فهرس الدليل
                        </h1>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#b0b0b0', maxWidth: '800px', margin: '0 auto' }}>
                            اكتشف محتويات الدليل وتعلم كيفية تحويل أفكارك إلى مواقع أو تطبيقات باستخدام البرومبتات
                        </p>
                    </motion.div>

                    <div className="toc-grid">
                        {/* Chapters List */}
                        <div>
                            {chapters.map((chapter, index) => (
                                <motion.div
                                    key={chapter.number}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Link
                                        href={
                                            index === 0 ? `/read/intro/1` :
                                                index === 1 ? `/read/section-1/1` :
                                                    index === 2 ? `/read/section-2/1` :
                                                        index === 3 ? `/read/section-3/1` :
                                                            index === 4 ? `/read/section-4/1` :
                                                                index === 5 ? `/read/section-5/1` :
                                                                    index === 6 ? `/read/section-6/1` :
                                                                        index === 7 ? `/library/1` :
                                                                            index === 8 ? `/read/appendix/1` :
                                                                                `/read/lesson-${index}`
                                        }
                                        style={{ textDecoration: 'none', display: 'block' }}
                                    >
                                        <motion.div
                                            className="card card-glow"
                                            style={{
                                                marginBottom: '24px',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="toc-card-content">
                                                <div className="toc-card-number">
                                                    {chapter.number}
                                                </div>
                                                <div className="toc-card-info">
                                                    <h3 className="toc-card-title">
                                                        {chapter.title}
                                                    </h3>
                                                    {chapter.description && (
                                                        <p className="toc-card-desc">
                                                            {chapter.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <motion.div className="toc-card-icon" whileHover={{ x: -10 }}>
                                                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                                                        <path d="M18 8l-8 7 8 7" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Sidebar */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                            <Robot size={350} />
                        </motion.div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '60px' }}>
                        <Link href="/" className="btn btn-secondary">
                            <span>العودة إلى الصفحة الرئيسية</span>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    )
}
