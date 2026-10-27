import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { House, Sparkles, UserRound } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import Today from './screens/Today.jsx'
import Urge from './screens/Urge.jsx'
import Proof from './screens/Proof.jsx'
import Settings from './screens/Settings.jsx'

const TABS = [
  { id: 'today', label: 'Vandaag', Icon: House },
  { id: 'proof', label: 'Bewijs', Icon: Sparkles },
  { id: 'settings', label: 'Ik', Icon: UserRound },
]

// De snelkoppeling op het app-icoon opent /?drang=1 en gaat meteen naar het protocol.
function openedFromShortcut() {
  const params = new URLSearchParams(location.search)
  if (!params.has('drang')) return false
  history.replaceState(null, '', location.pathname)
  return true
}

export default function App() {
  const [tab, setTab] = useState('today')
  const [urgeOpen, setUrgeOpen] = useState(openedFromShortcut)

  return (
    <MotionConfig reducedMotion="user">
      <Toaster position="top-center" />
      {urgeOpen ? (
        <Urge onClose={() => setUrgeOpen(false)} />
      ) : (
        <div className="mx-auto min-h-dvh w-full max-w-xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={tab}
              className="flex flex-col gap-4 px-4 pt-6 pb-36 sm:px-6 sm:pt-10"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {tab === 'today' && <Today onUrge={() => setUrgeOpen(true)} goTo={setTab} />}
              {tab === 'proof' && <Proof />}
              {tab === 'settings' && <Settings />}
            </motion.main>
          </AnimatePresence>

          <nav
            aria-label="Hoofdmenu"
            className="fixed inset-x-0 bottom-[calc(12px+env(safe-area-inset-bottom))] z-40 mx-auto flex w-[min(34rem,calc(100%-2rem))] gap-1 rounded-[1.4rem] border bg-card/80 p-1.5 shadow-soft backdrop-blur-xl"
          >
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-13 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-semibold text-muted-foreground transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    active && 'text-secondary-foreground',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-2xl bg-secondary"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className="relative size-5" strokeWidth={active ? 2.4 : 1.9} aria-hidden="true" />
                  <span className="relative">{label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </MotionConfig>
  )
}
