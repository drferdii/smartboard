"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"

const testimonials = [
  {
    quote: "Babi asapnya luar biasa! Aroma kayu bakar meresap sempurna, dagingnya empuk dan gurih. Pasti balik lagi!",
    author: "Budi Santoso",
    role: "Pelanggan Setia",
    company: "Bengkayang",
  },
  {
    quote: "Tumis daun singkongnya pedas pas, bumbu rempah Dayak-nya autentik banget. Tempatnya juga nyaman untuk keluarga.",
    author: "Rina Hartati",
    role: "Wisatawan",
    company: "Pontianak",
  },
  {
    quote: "Pelayanannya ramah dan cepat. Makanan enak, harga bersahabat. Rumah makan favorit kami sekeluarga!",
    author: "Ahmad Fauzi",
    role: "Pekerja Perbatasan",
    company: "Jagoi Babang",
  },
]

export function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  const numberX = useTransform(x, [-200, 200], [-20, 20])
  const numberY = useTransform(y, [-200, 200], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    }
  }

  const goNext = () => setActiveIndex((prev) => (prev + 1) % testimonials.length)
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  useEffect(() => {
    const timer = setInterval(goNext, 6000)
    return () => clearInterval(timer)
  }, [])

  const current = testimonials[activeIndex]

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto py-12" onMouseMove={handleMouseMove}>
      {/* Oversized index number */}
      <motion.div
        className="absolute -left-8 top-1/2 -translate-y-1/2 text-[28rem] font-bold text-[#1C1917]/[0.03] select-none pointer-events-none leading-none tracking-tighter font-display"
        style={{ x: numberX, y: numberY }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {String(activeIndex + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Main content */}
      <div className="relative flex">
        {/* Left column - vertical text */}
        <div className="hidden md:flex flex-col items-center justify-center pr-16 border-r border-[#E7E5E4]">
          <motion.span
            className="text-xs font-mono text-[#A8A29E] tracking-widest uppercase"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Ulasan Pelanggan
          </motion.span>

          <div className="relative h-32 w-px bg-[#E7E5E4] mt-8">
            <motion.div
              className="absolute top-0 left-0 w-full bg-[#FF4F79] origin-top"
              animate={{
                height: `${((activeIndex + 1) / testimonials.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Center - main content */}
        <div className="flex-1 md:pl-16 py-8 md:py-12 px-4 md:px-0">
          {/* Company badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 text-xs font-mono text-[#A8A29E] border border-[#E7E5E4] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F79]" />
                {current.company}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Quote */}
          <div className="relative mb-12 min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeIndex}
                className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1C1917] leading-[1.15] tracking-tight font-display"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                &ldquo;{current.quote.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.3em]"
                    variants={{
                      hidden: { opacity: 0, y: 20, rotateX: 90 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        transition: {
                          duration: 0.5,
                          delay: i * 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      exit: {
                        opacity: 0,
                        y: -10,
                        transition: { duration: 0.2, delay: i * 0.02 },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}&rdquo;
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Author row */}
          <div className="flex items-end justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  className="w-8 h-px bg-[#1C1917]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ originX: 0 }}
                />
                <div>
                  <p className="text-base font-medium text-[#1C1917]">{current.author}</p>
                  <p className="text-sm text-[#A8A29E]">{current.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={goPrev}
                className="group relative w-12 h-12 rounded-full border border-[#E7E5E4] flex items-center justify-center overflow-hidden hover:border-[#1C1917] transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-[#1C1917]"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="relative z-10 text-[#1C1917] group-hover:text-white transition-colors"
                >
                  <path
                    d="M10 12L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>

              <motion.button
                onClick={goNext}
                className="group relative w-12 h-12 rounded-full border border-[#E7E5E4] flex items-center justify-center overflow-hidden hover:border-[#1C1917] transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-[#1C1917]"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="relative z-10 text-[#1C1917] group-hover:text-white transition-colors"
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="absolute -bottom-16 left-0 right-0 overflow-hidden opacity-[0.06] pointer-events-none">
        <motion.div
          className="flex whitespace-nowrap text-6xl font-bold tracking-tight font-display"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8">
              Bengkayang • Semayot • Dayak • Asap • Rempah •
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
