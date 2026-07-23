import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** GSAP-driven staggered reveal for a group of direct-child elements — used in place
 * of the plain CSS `Reveal` wrapper when a section wants a real scroll-scrubbed
 * cascade (course grids, stat rows) rather than a single fade-up. */
export function ScrollStagger({ children, className = '', y = 26, stagger = 0.08, start = 'top 85%' }: { children: React.ReactNode; className?: string; y?: number; stagger?: number; start?: string }) {
 const ref = useRef<HTMLDivElement>(null)
 useGSAP(() => {
  const items = ref.current ? Array.from(ref.current.children) : []
  if (!items.length) return
  if (reducedMotion()) { gsap.set(items, { opacity: 1, y: 0 }); return }
  gsap.set(items, { opacity: 0, y })
  const reveal = (batch: Element[]) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger, ease: 'power3.out', overwrite: true })
  // Content that resolves after mount (async store data) can arrive once the section
  // has already scrolled past the trigger line — a fresh `once` ScrollTrigger would
  // then never fire, leaving items stuck at opacity:0. Reveal immediately in that case.
  const startPercent = Number(/(\d+)%/.exec(start)?.[1] ?? 85)
  const alreadyPast = ref.current!.getBoundingClientRect().top < window.innerHeight * (startPercent / 100)
  if (alreadyPast) { reveal(items); return }
  ScrollTrigger.batch(items, { start, once: true, onEnter: reveal })
 }, { scope: ref, dependencies: [children] })
 return <div ref={ref} className={className}>{children}</div>
}

/** Subtle scroll-tied vertical drift for decorative background elements — the kind
 * of parallax that's awkward to fake well with pure CSS scroll-timelines. */
export function Parallax({ children, speed = 0.25, className = '' }: { children?: React.ReactNode; speed?: number; className?: string }) {
 const ref = useRef<HTMLDivElement>(null)
 useGSAP(() => {
  if (!ref.current || reducedMotion()) return
  gsap.to(ref.current, { yPercent: speed * 100, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
 }, { scope: ref })
 return <div ref={ref} className={className}>{children}</div>
}

/** A GSAP timeline reveal for a hero-style block: children (by CSS selector) animate
 * in as one choreographed sequence on mount, rather than each independently fading —
 * used for the handful of "first thing you see" hero sections. */
export function useHeroTimeline(selectors: string[], scope: React.RefObject<HTMLElement | null>) {
 useGSAP(() => {
  if (reducedMotion()) return
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  selectors.forEach((selector, index) => {
   const el = scope.current?.querySelectorAll(selector)
   if (!el || !el.length) return
   tl.from(el, { opacity: 0, y: 22, duration: 0.8 }, index === 0 ? 0 : '-=0.5')
  })
 }, { scope })
}
