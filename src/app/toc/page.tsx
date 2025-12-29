'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'

const chapters = [
    {
        number: 'معجم المصطلحات',
        title: 'المصطلحات المهمة',
        description: 'شرح للمصطلحات الأكثر تكراراً لضمان فهم فصول الكتاب',
    },
    {
        number: 'المقدمة',
        title: 'التمهيد',
        description: 'مرحباً بك في رحلة بناء المشاريع بالبرومبت',
    },
    {
        number: '01',
        title: 'أساسيات “برومبت مشروع”',
        description: '6 صفحات غنية بالمحتوى المكثف',
    },
    {
        number: '02',
        title: 'من الفكرة إلى “مواصفات قابلة للتنفيذ”',
        description: '20 صفحة',
    },
    {
        number: '03',
        title: 'تصميم التجربة والهيكل (بدون تصميم ولا كود)',
        description: '20 صفحة',
    },
    {
        number: '04',
        title: 'القسم الرابع: كتابة محتوى الواجهة بالبرومبت (16 صفحة)',
        description: 'الفصول 17، 18، و19: نبرة المحتوى، الـ Microcopy، وصفحات البيع',
    },
    {
        number: '05',
        title: 'القسم الخامس: الجودة والتحسين (10 صفحات)',
        description: 'قوائم فحص، برومبتات التصحيح، والمدقق النهائي لضمان مخرجات احترافية',
    },
    {
        number: '06',
        title: 'القسم السادس: الأدوات المستخدمة (18 صفحة)',
        description: 'Frontend vs Backend: اختيار الأدوات الصحيحة وتصميم البيانات بالبرومبت',
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

            <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '100px' }}>
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

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 400px',
                        gap: '60px',
                        alignItems: 'start',
                    }}>
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
                                            index === 0 ? `/read/glossary/1` :
                                                index === 1 ? `/read/intro/1` :
                                                    index === 2 ? `/read/section-1/1` :
                                                        index === 3 ? `/read/section-2/1` :
                                                            index === 4 ? `/read/section-3/1` :
                                                                index === 5 ? `/read/section-4/1` :
                                                                    index === 6 ? `/read/section-5/1` :
                                                                        index === 7 ? `/read/section-6/1` :
                                                                            index === 8 ? `/library/1` :
                                                                                index === 9 ? `/read/appendix/1` :
                                                                                    `/read/lesson-${index - 1}`
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                <div style={{
                                                    fontSize: '3rem',
                                                    fontWeight: '900',
                                                    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                    minWidth: '80px',
                                                }}>
                                                    {chapter.number}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '4px', color: '#fff' }}>
                                                        {chapter.title}
                                                    </h3>
                                                    {chapter.description && (
                                                        <p style={{ fontSize: '0.9rem', color: '#b0b0b0', margin: 0 }}>
                                                            {chapter.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <motion.div whileHover={{ x: -10 }}>
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
