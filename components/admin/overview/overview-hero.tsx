'use client'

import { motion } from 'framer-motion'

import { OverviewAgentBrief } from './overview-agent-brief'
import type { GreetingState } from './overview-data'
import {
  getOverviewContainerVariants,
  getOverviewFloatAnimation,
  getOverviewPulseAnimation,
  getOverviewRevealVariants,
} from './overview-motion'

import { SemayotMascot } from '@/components/semayot/semayot-mascot'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type OverviewHeroProps = {
  agentMessages: string[]
  greeting: GreetingState
  userFullName: string
}

export function OverviewHero({ agentMessages, greeting, userFullName }: OverviewHeroProps) {
  const isReduced = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={getOverviewContainerVariants(isReduced, 0.1)}
      className="border border-border bg-[#FFF0F3] p-10 min-h-[260px] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8 hover:shadow-md transition-shadow duration-300"
    >
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 18)}
        className="space-y-4 z-10 text-center sm:text-left flex flex-col justify-center"
      >
        <motion.span
          variants={getOverviewRevealVariants(isReduced, 12)}
          className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF4F79] font-black block"
        >
          {greeting.title}
        </motion.span>
        <motion.h1
          variants={getOverviewRevealVariants(isReduced, 20)}
          className="font-display text-lg md:text-2xl font-semibold tracking-[-0.04em] text-foreground uppercase leading-tight"
        >
          Selamat Datang Kembali, {userFullName}!
        </motion.h1>
        <motion.div variants={getOverviewRevealVariants(isReduced, 22)}>
          <OverviewAgentBrief key={greeting.title} messages={agentMessages} />
        </motion.div>
      </motion.div>
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 28, 0.94)}
        className="flex-shrink-0 z-10 relative"
      >
        {/* Floating stars around the mascot */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <span className="absolute top-1 left-2 text-[#E6C229] text-sm opacity-80 animate-pulse">
            ✦
          </span>
          <span className="absolute top-6 -right-1 text-[#FF85A1] text-xs opacity-90 animate-bounce">
            ✦
          </span>
          <span className="absolute bottom-2 right-4 text-[#E6C229] text-sm opacity-80 animate-pulse">
            ✦
          </span>
        </div>
        <motion.div
          animate={getOverviewFloatAnimation(isReduced, 8)}
          className="bg-[#FFD5E2] rounded-full p-3 select-none relative z-10 border border-[#F898B6]/30 shadow-inner"
        >
          <SemayotMascot variant="welcome" size={140} />
        </motion.div>
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={getOverviewPulseAnimation(isReduced)}
        className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#FFC2D6]/20 blur-2xl pointer-events-none"
      />
    </motion.div>
  )
}
