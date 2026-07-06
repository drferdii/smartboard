'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'
import type { ChatMessage } from './use-overview-state'

import { SemayotMascot } from '@/components/semayot/semayot-mascot'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type OverviewChatPanelProps = {
  chatContainerRef: React.RefObject<HTMLDivElement | null>
  chatError: string | null
  chatInput: string
  chatLoading: boolean
  chatMessages: ChatMessage[]
  isChatExpanded: boolean
  onChatSubmit: (event: React.FormEvent) => Promise<void>
  setChatInput: (value: string) => void
  setIsChatExpanded: (value: boolean) => void
}

export function OverviewChatPanel({
  chatContainerRef,
  chatError,
  chatInput,
  chatLoading,
  chatMessages,
  isChatExpanded,
  onChatSubmit,
  setChatInput,
  setIsChatExpanded,
}: OverviewChatPanelProps) {
  const isReduced = useReducedMotion()

  return (
    <motion.div
      layout
      initial="hidden"
      animate="show"
      variants={getOverviewContainerVariants(isReduced, 0.06)}
      className={`border border-border bg-[#FFF8F9] p-6 flex flex-col justify-between transition-all duration-300 ${
        isChatExpanded ? 'fixed inset-4 md:inset-8 z-[9999] shadow-2xl h-auto' : 'h-[540px]'
      }`}
    >
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 14)}
        className="border-b border-border pb-3 flex justify-between items-start"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={isReduced ? undefined : { rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }}
            transition={
              isReduced ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
            }
            className="w-7 h-7 rounded-full bg-[#FFC2D6] flex items-center justify-center text-xs shadow-sm select-none"
          >
            🐷
          </motion.div>
          <div>
            <span className="font-mono text-xs font-black text-[#FF4F79] uppercase tracking-[0.2em] block">
              Sema Corner
            </span>
            <h3 className="font-display font-semibold text-sm text-foreground uppercase tracking-[-0.02em] leading-none mt-1">
              Konsultasi Agent Sema
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsChatExpanded(!isChatExpanded)}
          className="neumorphic-btn font-mono text-xs font-bold px-3 py-1.5 tracking-widest"
          aria-label={isChatExpanded ? 'Perkecil chatbox' : 'Perbesar chatbox'}
        >
          {isChatExpanded ? '[KECILKAN]' : '[PERBESAR]'}
        </button>
      </motion.div>

      <motion.div
        variants={getOverviewRevealVariants(isReduced, 18)}
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto py-3 space-y-4 font-mono text-sm leading-relaxed pr-2"
      >
        {chatMessages.length === 0 ? (
          <motion.div
            animate={isReduced ? undefined : { opacity: [0.65, 0.9, 0.65] }}
            transition={
              isReduced ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
            }
            className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-75 px-4 select-none"
          >
            <div className="relative">
              <SemayotMascot variant="menu" size={90} />
              {/* Speech bubble "Hai!" */}
              <motion.div
                initial={isReduced ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0, y: 5 }}
                animate={isReduced ? undefined : { scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 15 }}
                className="absolute -top-2 -right-4 bg-[#FFE2EC] border border-[#FF85A1] rounded-full px-2.5 py-0.5 shadow-sm text-[10px] font-bold text-[#FF4F79] font-sans tracking-wide"
              >
                Hai!
                {/* Bubble tail */}
                <div className="absolute -bottom-1 left-3 w-1.5 h-1.5 bg-[#FFE2EC] border-r border-b border-[#FF85A1] transform rotate-45" />
              </motion.div>
            </div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest max-w-[220px] leading-relaxed font-bold">
              Tanyakan apa saja seputar data transaksi hari ini atau analisis menu, Chief.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {chatMessages.map((message, index) => (
              <motion.div
                key={message.id ?? `${message.role}-${index}`}
                initial={isReduced ? false : { opacity: 0, y: 14, scale: 0.98 }}
                animate={isReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={isReduced ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`p-3 border max-w-[90%] ${
                  message.role === 'user'
                    ? 'border-[#1C1917] bg-[#1C1917] text-white ml-auto'
                    : 'border-border bg-background text-foreground'
                }`}
              >
                <div className="text-xs opacity-60 font-bold uppercase tracking-widest mb-1">
                  {message.role === 'user' ? 'CHIEF' : 'AGEN_JEAN'}
                </div>
                <div className="font-sans text-sm whitespace-pre-wrap leading-normal">
                  {message.content}
                </div>
                {message.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/ai/memory', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'save', content: message.content }),
                          })
                          alert(
                            response.ok ? 'Memori berhasil disimpan!' : 'Gagal menyimpan memori.'
                          )
                        } catch {
                          alert('Gagal menyimpan memori.')
                        }
                      }}
                      className="neumorphic-btn font-mono text-xs font-bold px-3 py-1.5 tracking-widest"
                    >
                      [SIMPAN MEMORI]
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {chatLoading && (
          <motion.div
            initial={isReduced ? false : { opacity: 0 }}
            animate={isReduced ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={
              isReduced ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
            }
            className="font-mono text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1"
          >
            Kueri data diproses...
          </motion.div>
        )}
        {chatError && (
          <motion.div
            initial={isReduced ? false : { opacity: 0, y: 8 }}
            animate={isReduced ? undefined : { opacity: 1, y: 0 }}
            className="font-mono text-xs text-red-600 border border-red-600/25 bg-red-600/5 p-3 uppercase tracking-wider"
          >
            ERROR: {chatError}
          </motion.div>
        )}
      </motion.div>

      <motion.form
        variants={getOverviewRevealVariants(isReduced, 12)}
        onSubmit={onChatSubmit}
        className="pt-3 border-t border-border flex gap-2"
      >
        <input
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          placeholder="Tanya agent..."
          className="neumorphic-input flex-1 px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
          disabled={chatLoading}
        />
        <button
          type="submit"
          disabled={chatLoading || !chatInput.trim()}
          className="neumorphic-btn font-mono text-xs font-bold px-4 py-2.5 uppercase tracking-widest disabled:opacity-50 cursor-pointer"
        >
          KIRIM
        </button>
      </motion.form>
    </motion.div>
  )
}
