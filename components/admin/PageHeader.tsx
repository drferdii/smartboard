import { motion } from 'framer-motion'
import React from 'react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  label: string
  title: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ label, title, action, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-border pb-5',
        className
      )}
    >
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2 font-bold">
          {label}
        </span>
        <h2 className="font-display text-lg md:text-xl font-semibold tracking-tight text-foreground uppercase">
          {title}
        </h2>
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap items-center gap-3"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
