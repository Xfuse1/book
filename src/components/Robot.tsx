'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface RobotProps {
    size?: number
    className?: string
    variant?: 'image' | 'video'
    videoSrc?: string
}

export default function Robot({
    size = 400,
    className = '',
    variant = 'image',
    videoSrc
}: RobotProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    // Smooth springs for mouse movement
    const springConfig = { stiffness: 100, damping: 20 }
    const mouseX = useSpring(0, springConfig)
    const mouseY = useSpring(0, springConfig)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const x = (clientX - window.innerWidth / 2) / 25
            const y = (clientY - window.innerHeight / 2) / 25
            mouseX.set(x)
            mouseY.set(y)
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', handleMouseMove)
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('mousemove', handleMouseMove)
            }
        }
    }, [mouseX, mouseY])

    const rotateY = useTransform(mouseX, (v) => v * 0.5)
    const rotateX = useTransform(mouseY, (v) => -v * 0.5)

    return (
        <motion.div
            className={`robot-container ${className}`}
            style={{
                width: size,
                height: size,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: isHovered ? 1.05 : 1,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Dynamic Glow Base */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    width: '60%',
                    height: '20px',
                    background: 'radial-gradient(ellipse at center, rgba(255, 107, 53, 0.6) 0%, transparent 70%)',
                    filter: 'blur(10px)',
                    zIndex: 0,
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />

            {/* Robot Image or Video with Floating and Mouse Rotation */}
            <motion.div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    zIndex: 1,
                    x: mouseX,
                    y: mouseY,
                    rotateY,
                    rotateX,
                }}
                animate={{
                    y: [0, -15, 0],
                }}
                transition={{
                    y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }
                }}
            >
                {variant === 'video' && videoSrc ? (
                    <video
                        src={videoSrc}
                        poster="/assets/robot.png"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    >
                        <source src={videoSrc} type="video/mp4" />
                        {/* Fallback to Image if video tag isn't supported */}
                        <Image
                            src="/assets/robot.png"
                            alt="Robot Mascot Fallback"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </video>
                ) : (
                    <Image
                        src="/assets/robot.png"
                        alt="Robot Mascot"
                        fill
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                )}

                {/* Extra Glow overlay on the robot */}
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 60%)',
                        pointerEvents: 'none',
                    }}
                    animate={{
                        opacity: [0, 0.3, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                />
            </motion.div>

        </motion.div>
    )
}
