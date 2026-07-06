'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { useReducedMotion } from '@/hooks/use-reduced-motion'

type OverviewAgentBriefProps = {
  messages?: string[]
}

const TYPE_SPEED_MS = 20
const HOLD_MS = 2200
const FADE_OUT_MS = 240
const FALLBACK_MESSAGES = ['Sema Agent siap memberikan pembaruan operasional.']

export function OverviewAgentBrief({ messages }: OverviewAgentBriefProps) {
  const isReduced = useReducedMotion()
  const resolvedMessages =
    Array.isArray(messages) && messages.length > 0 ? messages : FALLBACK_MESSAGES
  const messagesSignature = resolvedMessages.join('\u0001')
  const firstMessage = resolvedMessages[0] ?? FALLBACK_MESSAGES[0]
  const [messageIndex, setMessageIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [phase, setPhase] = useState<'typing' | 'holding' | 'transitioning'>('typing')
  const [isMessageVisible, setIsMessageVisible] = useState(true)
  const currentMessage = resolvedMessages[messageIndex] ?? ''
  const longestMessage = resolvedMessages.reduce(
    (longest, current) => (current.length > longest.length ? current : longest),
    firstMessage
  )

  useEffect(() => {
    if (isReduced) {
      return
    }

    if (phase === 'typing') {
      if (displayText.length < currentMessage.length) {
        const timeoutId = window.setTimeout(() => {
          setDisplayText(currentMessage.slice(0, displayText.length + 1))
        }, TYPE_SPEED_MS)
        return () => window.clearTimeout(timeoutId)
      }

      const timeoutId = window.setTimeout(() => {
        setPhase('holding')
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }

    if (phase === 'holding') {
      const timeoutId = window.setTimeout(() => {
        setIsMessageVisible(false)
        setPhase('transitioning')
      }, HOLD_MS)
      return () => window.clearTimeout(timeoutId)
    }

    const timeoutId = window.setTimeout(() => {
      setMessageIndex((prev) => (prev + 1) % resolvedMessages.length)
      setDisplayText('')
      setIsMessageVisible(true)
      setPhase('typing')
    }, FADE_OUT_MS)
    return () => window.clearTimeout(timeoutId)
  }, [currentMessage, displayText, isReduced, phase, resolvedMessages.length])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (isReduced) {
        setDisplayText(firstMessage)
        setIsMessageVisible(true)
        setPhase('holding')
        return
      }

      setMessageIndex(0)
      setDisplayText('')
      setIsMessageVisible(true)
      setPhase('typing')
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [firstMessage, isReduced, messagesSignature])

  const visibleText = isReduced ? firstMessage : displayText

  return (
    <motion.div
      initial={{ opacity: 0, y: isReduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isReduced ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
      className="max-w-[54ch] border border-border/60 bg-background px-4 py-3 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF4F79] font-black">
          SEMA_AGENT
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </div>
      <div className="relative font-sans text-[15px] text-foreground leading-[1.55]">
        <div aria-hidden="true" className="invisible min-h-[3.5rem] whitespace-pre-wrap">
          {longestMessage}
        </div>
        <motion.div
          animate={
            isReduced
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : {
                  opacity: isMessageVisible ? 1 : 0,
                  y: isMessageVisible ? 0 : 4,
                  filter: isMessageVisible ? 'blur(0px)' : 'blur(1.5px)',
                }
          }
          transition={{
            duration: isReduced ? 0.01 : 0.24,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 min-h-[3.5rem] whitespace-pre-wrap"
        >
          {visibleText}
          {!isReduced && (
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              className="ml-0.5 inline-block text-[#FF4F79]"
            >
              |
            </motion.span>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
