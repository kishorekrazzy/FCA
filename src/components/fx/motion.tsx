import { AnimatePresence, motion } from 'motion/react'
import { useLocation } from 'react-router-dom'

const EASE = [0.22, 1, 0.36, 1] as const

/** Wraps the routed page content so every navigation gets a soft fade + rise on
 * enter instead of an instant hard cut — applied once at the app shell, so every
 * page (including the ones that didn't get a bespoke pass) benefits automatically.
 * Deliberately enter-only, not a true exit-coordinated AnimatePresence transition:
 * `<Routes>` swaps its matched child the instant the location changes, so trying to
 * hold the old page on-screen for an exit animation fights React Router's own
 * render rather than complementing it. Keying on pathname still gives every new
 * page a clean, snappy "arrive" animation without that risk. */
export function PageTransition({ children }: { children: React.ReactNode }) {
 const location = useLocation()
 return <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: EASE }}>
  {children}
 </motion.div>
}

/** Spring-physics hover/tap tilt — the gesture-driven upgrade over the plain CSS
 * `.book-card:hover` transition, used where a card should feel physically "picked up". */
export function TiltCard({ children, className, style, tilt = 8, lift = 6 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; tilt?: number; lift?: number }) {
 return <motion.div className={className} style={{ ...style, transformPerspective: 900 }} whileHover={{ rotateY: -tilt, y: -lift, scale: 1.015 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}>
  {children}
 </motion.div>
}

/** Mount/unmount presence wrapper for things that used to hard-swap via a boolean
 * (a game board opening, a tray appearing) — scale+fade instead of popping in. */
export function Pop({ show, children, className }: { show: boolean; children: React.ReactNode; className?: string }) {
 return <AnimatePresence>
  {show && <motion.div className={className} initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 6 }} transition={{ duration: 0.24, ease: EASE }}>
   {children}
  </motion.div>}
 </AnimatePresence>
}

/** Crossfade between two mutually-exclusive children, keyed by an id — used for tab
 * content swaps (Friends/New/Trending) instead of an instant re-render. */
export function Crossfade({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
 return <AnimatePresence mode="wait">
  <motion.div key={id} className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
   {children}
  </motion.div>
 </AnimatePresence>
}
