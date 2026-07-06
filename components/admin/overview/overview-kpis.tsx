'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import type { KpiCard } from './use-overview-state';
import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion';

type OverviewKpisProps = {
  kpis: KpiCard[];
};

export function OverviewKpis({ kpis }: OverviewKpisProps) {
  const isReduced = useReducedMotion();

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={getOverviewContainerVariants(isReduced, 0.08)}
      className="space-y-4"
    >
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF4F79] block font-black">
        METRIK OPERASIONAL UTAMA
      </span>
      <motion.div variants={getOverviewContainerVariants(isReduced, 0.1)} className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={getOverviewRevealVariants(isReduced, 20)}
            whileHover={isReduced ? undefined : { y: -6, scale: 1.015 }}
            className="border border-border border-top-[3px] border-t-foreground p-5 bg-card hover:bg-background transition-colors duration-300 flex flex-col justify-between"
            style={{ borderTopWidth: '3px' }}
          >
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2">
                {kpi.label}
              </div>
              <div
                className={`tracking-tight text-foreground ${
                  kpi.unavailable
                    ? 'font-sans text-sm leading-relaxed'
                    : 'font-display text-2xl font-semibold tabular-nums'
                }`}
              >
                {kpi.value}
              </div>
            </div>
            <div className="mt-4">
              <div
                className="neumorphic-chip font-mono text-xs"
                data-tone={kpi.deltaTone}
              >
                {kpi.deltaLabel}
              </div>
              {kpi.spark ? (
                <motion.div
                  initial={isReduced ? false : { opacity: 0, y: 6 }}
                  whileInView={isReduced ? undefined : { opacity: 0.3, y: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3 h-5 opacity-30"
                >
                  <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <motion.polyline
                      points={kpi.spark}
                      fill="none"
                      stroke="var(--foreground)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      initial={isReduced ? false : { pathLength: 0, opacity: 0.3 }}
                      whileInView={isReduced ? undefined : { pathLength: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <polygon points={`${kpi.spark} 100,24 0,24`} fill="var(--foreground)" opacity="0.05" />
                  </svg>
                </motion.div>
              ) : (
                <div className="mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  Tanpa data historis
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
