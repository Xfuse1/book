'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Robot from '@/components/Robot'
import { useEffect, useState } from 'react'
import { verifySession } from '@/lib/auth'
import LockedOverlay from '@/components/reading/LockedOverlay'
import ReadingPagination from '@/components/reading/ReadingPagination'

export default function Lesson1() {
    const router = useRouter()
    const [isAuthed, setIsAuthed] = useState(false)
    const [isLockOverlayOpen, setIsLockOverlayOpen] = useState(false)

    useEffect(() => {
        const authed = verifySession()
        setIsAuthed(authed)
    }, [])

    const handleNext = () => {
        router.push('/read/section-1/1')
    }

    const handlePrev = () => {
        router.push('/toc')
    }

    return (
        <>
            <Navigation />

            {/* Locked Overlay */}
            <LockedOverlay
                isOpen={isLockOverlayOpen}
                onClose={() => setIsLockOverlayOpen(false)}
                nextPath="/read/lesson-1"
            />

            <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>

                <div className="container" style={{
                    paddingBottom: '80px',
                    filter: isAuthed ? 'none' : 'none', // Keeping it free for now as it's lesson 1
                    opacity: 1
                }}>
                    {/* Header */}
                    <motion.div
                        style={{ marginBottom: '40px' }}
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
                                01
                            </span>
                            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0 }}>
                                الأولى مع البرومبتات
                            </h1>
                            <span style={{
                                padding: '6px 16px',
                                background: 'rgba(255, 107, 53, 0.15)',
                                border: '1px solid #FF6B35',
                                borderRadius: '30px',
                                fontSize: '0.85rem',
                                color: '#FF6B35',
                                fontWeight: '900',
                            }}>
                                درس تمهيدي مجاني
                            </span>
                        </div>
                        <p style={{ fontSize: '1.25rem', color: '#b0b0b0' }}>
                            مقدمة حول كيفية عمل البرومبتات ومتعددة استخدامها في البرمجة
                        </p>
                    </motion.div>

                    <div className="lesson-grid">
                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Section 1 */}
                            <section style={{ marginBottom: '48px' }}>
                                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '20px' }}>
                                    ما هي البرومبتات؟
                                </h2>
                                <p style={{ fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '16px' }}>
                                    البرومبتات (Prompts) هي تعليمات نصية محددة تُعطى لنماذج الذكاء الاصطناعي (مثل ChatGPT أو Claude)
                                    لتوجيهها نحو تنفيذ مهام معينة. في سياق البرمجة، يمكن استخدام البرومبتات لإنشاء كود برمجي،
                                    تصميم واجهات مستخدم، حل مشاكل تقنية، وأكثر من ذلك بكثير.
                                </p>
                                <p style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
                                    البرومبتات ليست مجرد أسئلة بسيطة - إنها أدوات قوية يمكنها تحويل أفكارك إلى واقع ملموس
                                    عندما تُصاغ بشكل صحيح ومنظم.
                                </p>
                            </section>

                            {/* Code Example */}
                            <motion.div
                                className="code-block"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <pre><code>{`<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مثال على استخدام البرومبتات</title>
</head>
<body>
    <h1>مرحباً بك في عالم البرومبتات</h1>
    <p>هذا الكود تم إنشاؤه باستخدام البرومبتات</p>
</body>
</html>`}</code></pre>
                            </motion.div>

                            {/* Section 2 */}
                            <section style={{ marginTop: '48px', marginBottom: '48px' }}>
                                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '20px' }}>
                                    فائدة البرومبتات في البرمجة
                                </h2>

                                <motion.div
                                    className="card card-glow"
                                    style={{
                                        marginBottom: '20px',
                                        padding: '24px',
                                        background: 'rgba(255, 107, 53, 0.04)',
                                        border: '1px solid rgba(255, 107, 53, 0.15)',
                                        borderRadius: '16px',
                                    }}
                                    whileHover={{ y: -5, background: 'rgba(255, 107, 53, 0.06)' }}
                                >
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                        {`تسريع عملية التطوير`}
                                    </h3>
                                    <p style={{ fontSize: '1.05rem', color: '#b0b0b0', marginRight: '40px', lineHeight: '1.6' }}>
                                        البرومبتات تساعدك على إنشاء الكود بشكل أسرع بكثير من الكتابة اليدوية التقليدية،
                                        مما يتيح لك التركيز على المنطق والإبداع بدلاً من التفاصيل الروتينية.
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="card card-glow"
                                    style={{
                                        marginBottom: '20px',
                                        padding: '24px',
                                        background: 'rgba(255, 107, 53, 0.04)',
                                        border: '1px solid rgba(255, 107, 53, 0.15)',
                                        borderRadius: '16px',
                                    }}
                                    whileHover={{ y: -5, background: 'rgba(255, 107, 53, 0.06)' }}
                                >
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                        {`تعلم أفضل الممارسات`}
                                    </h3>
                                    <p style={{ fontSize: '1.05rem', color: '#b0b0b0', marginRight: '40px', lineHeight: '1.6' }}>
                                        عند استخدام البرومبتات بشكل صحيح، يمكنك الحصول على كود يتبع أفضل الممارسات
                                        والمعايير الصناعية، مما يساعدك على تعلم تقنيات جديدة.
                                    </p>
                                </motion.div>

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
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                        {`حل المشاكل بسرعة`}
                                    </h3>
                                    <p style={{ fontSize: '1.05rem', color: '#b0b0b0', marginRight: '40px', lineHeight: '1.6' }}>
                                        يمكنك استخدام البرومبتات لتشخيص الأخطاء وإيجاد حلول للمشاكل التقنية
                                        بشكل أسرع وأكثر فعالية.
                                    </p>
                                </motion.div>
                            </section>
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
                        currentIndex={0}
                        total={1}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        isFirst={true}
                        isLast={true}
                        isNextLocked={false}
                        onLockedClick={() => setIsLockOverlayOpen(true)}
                    />
                </div>
            </main>
        </>
    )
}
