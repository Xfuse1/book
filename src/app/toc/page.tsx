'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'
import { useEffect, useState } from 'react'

const chapters = [
    {
        number: 'المحطة 0',
        title: 'شرارة الانطلاق (التمهيد)',
        description: 'مرحباً بك في رحلة بناء المشاريع بالبرومبت',
        status: 'قراءة مجانية',
    },
    {
        number: 'المحطة 1',
        title: 'لغة المستقبل (أساسيات البرومبت)',
        description: 'تحويل التفكير من الدردشة إلى إدارة مشروع',
        status: 'عينة مجانية',
    },
    {
        number: 'المحطة 2',
        title: 'جسر التحول (من الفكرة للتنفيذ)',
        description: 'تحويل الخيال إلى نقاط عمل تقنية منظمة',
    },
    {
        number: 'المحطة 3',
        title: 'بناء الأساس (الهيكل والتصميم)',
        description: 'تخطيط رحلة المستخدم وبناء هيكل الموقع المتكامل',
    },
    {
        number: 'المحطة 4',
        title: 'سحر الكلمات (فنون الصياغة)',
        description: 'إتقان نبرة المحتوى وكتابة نصوص الواجهات والبيع',
    },
    {
        number: 'المحطة 5',
        title: 'معيار الإتقان (الجودة والتحليل)',
        description: 'قوائم التدقيق والتحسين لضمان جودة المخرجات النهائية',
    },
    {
        number: 'المحطة 6',
        title: 'أسرار النخبة (الأدوات المتقدمة)',
        description: 'اختيار التقنيات المناسبة وتصميم البيانات بالبرومبت',
    },
    {
        number: 'المحطة 7',
        title: 'مكتبة القوالب — 30 قالب برومبت',
        description: 'قوالب جاهزة للنسخ تحطي كافة مراحل بناء المشروع',
    },
    {
        number: 'المحطة 8',
        title: 'كنز المعرفة (الملحق)',
        description: 'تمارين سريعة + إجابات نموذجية مختصرة لصقل مهاراتك',
    },
]

export default function TOCPage() {
    useEffect(() => {
        // Any initial data loading can go here
    }, [])

    return (
        <>
            <Navigation />

            <main style={{ minHeight: 'calc(100vh - var(--header-h, 80px))', position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>
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
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                        <h3 className="toc-card-title" style={{ margin: 0 }}>
                                                            {chapter.title}
                                                        </h3>
                                                        {(chapter as any).status && (
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                background: 'rgba(255, 107, 53, 0.1)',
                                                                border: '1px solid rgba(255, 107, 53, 0.3)',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                color: '#FF6B35',
                                                                fontWeight: 'bold',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {(chapter as any).status}
                                                            </span>
                                                        )}
                                                    </div>
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
