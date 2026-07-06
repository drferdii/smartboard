'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import React, { useRef, useCallback } from 'react'

export type MascotVariant = 'welcome' | 'menu' | 'recommendation' | 'thankyou' | 'loading'

interface MascotProps {
  variant?: MascotVariant
  className?: string
  size?: number
  useImage?: boolean
  imageSrc?: string
}

export const SemayotMascot: React.FC<MascotProps> = ({
  variant = 'welcome',
  className = '',
  size = 200,
  useImage = false,
  imageSrc = '/semayot/images/sema2.webp',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Eye-tracking motion values
  const rawEyeX = useMotionValue(0)
  const rawEyeY = useMotionValue(0)
  const eyeX = useSpring(rawEyeX, { stiffness: 150, damping: 20 })
  const eyeY = useSpring(rawEyeY, { stiffness: 150, damping: 20 })

  // Ear wiggle intensity based on proximity
  const earWiggle = useMotionValue(0)
  const earSpring = useSpring(earWiggle, { stiffness: 100, damping: 15 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxMove = 6
      const angle = Math.atan2(dy, dx)
      const clampedDist = Math.min(distance, 200)
      const ratio = clampedDist / 200

      rawEyeX.set(Math.cos(angle) * maxMove * ratio)
      rawEyeY.set(Math.sin(angle) * maxMove * ratio)

      // Ear wiggle proportional to proximity (closer = more wiggle)
      const proximity = Math.max(0, 1 - distance / 300)
      earWiggle.set(proximity * 12)
    },
    [rawEyeX, rawEyeY, earWiggle]
  )

  const handleMouseLeave = useCallback(() => {
    rawEyeX.set(0)
    rawEyeY.set(0)
    earWiggle.set(0)
  }, [rawEyeX, rawEyeY, earWiggle])

  // Blink animation
  const blinkVariants = {
    open: { scaleY: 1 },
    blink: {
      scaleY: 0.1,
      transition: { duration: 0.15 },
    },
  }

  const [blinkState, setBlinkState] = React.useState('open')
  const isReduced = false // Bypassed to force active animations as requested

  React.useEffect(() => {
    if (isReduced) return
    const interval = setInterval(
      () => {
        setBlinkState('blink')
        setTimeout(() => setBlinkState('open'), 150)
      },
      3500 + Math.random() * 1500
    )
    return () => clearInterval(interval)
  }, [isReduced])

  // Float animation (smoother, single direction keyframe with reverse repeat)
  const floatTransition = {
    duration: 3,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
  }

  // If using actual image, render image with animation
  if (useImage) {
    return (
      <motion.div
        ref={containerRef}
        className={`relative select-none flex items-center justify-center ${className}`}
        whileHover={isReduced ? {} : { scale: 1.05, y: -6 }}
        whileTap={isReduced ? {} : { scale: 0.95 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: size, height: size }}
      >
        <motion.div
          className="relative w-full h-full drop-shadow-[0_12px_32px_rgba(255,194,214,0.4)]"
          animate={isReduced ? {} : { y: [0, -12] }}
          transition={isReduced ? {} : floatTransition}
        >
          <Image
            src={imageSrc}
            alt="Maskot Semayot - Babi Lucu"
            fill
            className="object-contain"
            sizes={`${size}px`}
          />
        </motion.div>
      </motion.div>
    )
  }

  // SVG Mascot with full animation
  return (
    <motion.div
      ref={containerRef}
      className={`relative select-none flex items-center justify-center ${className}`}
      whileHover={isReduced ? {} : { scale: 1.05, y: -6 }}
      whileTap={isReduced ? {} : { scale: 0.95 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center"
        animate={isReduced ? {} : { y: [0, -12] }}
        transition={isReduced ? {} : floatTransition}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_12px_32px_rgba(251,146,198,0.25)]"
          role="img"
          aria-label="Maskot Semayot"
        >
          <title>Maskot Semayot - Babi Lucu</title>
          {/* Shadow under mascot */}
          <ellipse cx="100" cy="188" rx="50" ry="7" fill="#EDE5D8" opacity="0.7" />

          {/* Left Ear — animated wiggle */}
          <motion.g
            animate={
              isReduced
                ? {}
                : variant === 'loading'
                  ? { rotate: [0, -10, 0] }
                  : { rotate: [0, 4, -4, 0] }
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '60px 45px' }}
          >
            <motion.path
              d="M 50 65 C 25 35, 45 15, 65 35 C 75 45, 60 55, 50 65 Z"
              fill="#FFAEC9"
              stroke="#F898B6"
              strokeWidth="3"
              style={{
                transformOrigin: '60px 45px',
                rotate: earSpring,
              }}
            />
          </motion.g>
          {/* Right Ear */}
          <motion.path
            d="M 150 65 C 175 35, 155 15, 135 35 C 125 45, 140 55, 150 65 Z"
            fill="#FFAEC9"
            stroke="#F898B6"
            strokeWidth="3"
            animate={
              isReduced
                ? {}
                : variant === 'loading'
                  ? { rotate: [0, 10, 0] }
                  : { rotate: [0, -4, 4, 0] }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '140px 45px' }}
          />

          {/* Main body */}
          <circle cx="100" cy="115" r="65" fill="#FFC2D6" stroke="#F898B6" strokeWidth="4" />

          {/* Rosy cheeks */}
          <circle cx="55" cy="120" r="11" fill="#FF85A1" opacity="0.55" />
          <circle cx="145" cy="120" r="11" fill="#FF85A1" opacity="0.55" />

          {/* Eyes with tracking */}
          {variant === 'thankyou' ? (
            <>
              <path
                d="M 50 102 Q 60 92 70 102"
                stroke="#1C1917"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M 130 102 Q 140 92 150 102"
                stroke="#1C1917"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* Left eye */}
              <motion.g
                variants={blinkVariants}
                animate={blinkState}
                style={{ originX: '60px', originY: '100px' }}
              >
                <circle cx="60" cy="100" r="9" fill="#1C1917" />
                {/* Pupil — tracks mouse */}
                <motion.circle cx="60" cy="100" r="9" fill="#1C1917" style={{ x: eyeX, y: eyeY }} />
                {/* Highlight */}
                <motion.circle cx="57" cy="97" r="3" fill="white" style={{ x: eyeX, y: eyeY }} />
              </motion.g>
              {/* Right eye */}
              <motion.g
                variants={blinkVariants}
                animate={blinkState}
                style={{ originX: '140px', originY: '100px' }}
              >
                <circle cx="140" cy="100" r="9" fill="#1C1917" />
                <motion.circle
                  cx="140"
                  cy="100"
                  r="9"
                  fill="#1C1917"
                  style={{ x: eyeX, y: eyeY }}
                />
                <motion.circle cx="137" cy="97" r="3" fill="white" style={{ x: eyeX, y: eyeY }} />
              </motion.g>
            </>
          )}

          {/* Snout */}
          <g>
            <rect
              x="76"
              y="110"
              width="48"
              height="32"
              rx="16"
              fill="#FFAEC9"
              stroke="#F898B6"
              strokeWidth="3.5"
            />
            <circle cx="90" cy="126" r="4.5" fill="#D75C7E" />
            <circle cx="110" cy="126" r="4.5" fill="#D75C7E" />
          </g>

          {/* Smile */}
          <path
            d="M 92 146 Q 100 155 108 146"
            stroke="#1C1917"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Scarf / Apron */}
          <path
            d="M 62 163 C 70 178, 130 178, 138 163"
            stroke="#FF4F79"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="100" cy="172" r="7" fill="#FF1A53" />

          {/* Variant-specific elements */}
          {variant === 'welcome' && (
            <motion.g
              animate={isReduced ? {} : { y: [0, -3, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '145px 142px' }}
            >
              {/* The Magic Wand stick */}
              <line
                x1="125"
                y1="155"
                x2="155"
                y2="125"
                stroke="#E6C229"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Magic Wand head - pink circular star/gem */}
              <circle cx="155" cy="125" r="15" fill="#FF6B8B" stroke="#D75C7E" strokeWidth="2.5" />
              <circle cx="155" cy="125" r="8" fill="#FFAEC9" />
              {/* Sparkles / Magic lines around wand */}
              <line
                x1="155"
                y1="105"
                x2="155"
                y2="101"
                stroke="#FF85A1"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="173"
                y1="117"
                x2="177"
                y2="115"
                stroke="#FF85A1"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="170"
                y1="135"
                x2="174"
                y2="137"
                stroke="#FF85A1"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Right Hand holding the stick */}
              <circle cx="127" cy="151" r="10" fill="#FFC2D6" stroke="#F898B6" strokeWidth="2.5" />
              {/* Left Hand resting */}
              <circle cx="73" cy="151" r="10" fill="#FFC2D6" stroke="#F898B6" strokeWidth="2.5" />
            </motion.g>
          )}

          {variant === 'menu' && (
            <motion.g
              animate={isReduced ? {} : { y: [0, -3, 0], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '100px 150px' }}
            >
              {/* Clipboard board */}
              <rect
                x="76"
                y="125"
                width="48"
                height="58"
                rx="4"
                fill="#C68B59"
                stroke="#8B5A2B"
                strokeWidth="3"
              />
              {/* Paper */}
              <rect x="82" y="133" width="36" height="44" rx="2" fill="#FFFFFF" />
              {/* Lines on paper */}
              <line
                x1="88"
                y1="142"
                x2="112"
                y2="142"
                stroke="#E5E7EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="88"
                y1="150"
                x2="112"
                y2="150"
                stroke="#E5E7EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="88"
                y1="158"
                x2="104"
                y2="158"
                stroke="#E5E7EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Clipboard Clip */}
              <rect x="92" y="121" width="16" height="8" rx="1.5" fill="#71717A" />

              {/* Left Hand holding clipboard */}
              <circle cx="72" cy="154" r="10" fill="#FFC2D6" stroke="#F898B6" strokeWidth="2.5" />
              {/* Right Hand holding clipboard */}
              <circle cx="128" cy="154" r="10" fill="#FFC2D6" stroke="#F898B6" strokeWidth="2.5" />
            </motion.g>
          )}

          {variant === 'recommendation' && (
            <g>
              <motion.g
                animate={isReduced ? {} : { y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <circle cx="160" cy="120" r="12" fill="#FFC2D6" stroke="#F898B6" strokeWidth="3" />
                <path
                  d="M 175 90 L 178 96 L 184 97 L 179 101 L 181 107 L 175 104 L 169 107 L 171 101 L 166 97 L 172 96 Z"
                  fill="#FFD700"
                  stroke="#FF8C00"
                  strokeWidth="1.5"
                />
              </motion.g>
            </g>
          )}

          {variant === 'thankyou' && (
            <motion.g
              initial={isReduced ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.5 }}
              animate={isReduced ? {} : { scale: [0.8, 1.15, 0.8], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '100px', originY: '35px' }}
            >
              <path
                d="M 100 35 C 95 20, 80 20, 80 35 C 80 50, 100 65, 100 65 C 100 65, 120 50, 120 35 C 120 20, 105 20, 100 35 Z"
                fill="#FF4B72"
              />
            </motion.g>
          )}

          {variant === 'loading' && (
            <motion.g
              animate={isReduced ? {} : { rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '100px', originY: '115px' }}
            >
              <circle
                cx="100"
                cy="115"
                r="76"
                stroke="#FF85A1"
                strokeWidth="2.5"
                strokeDasharray="12 18"
                opacity="0.5"
              />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </motion.div>
  )
}
