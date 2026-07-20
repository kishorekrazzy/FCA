import { useEffect, useRef, useState } from 'react'

export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } }, { threshold })
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, inView }
}

export function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return <div ref={ref} className={`fx-reveal ${inView ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

export function BlurText({ text, startDelay = 0, step = 80, className = '' }: { text: string; startDelay?: number; step?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.3)
  return <span ref={ref} className={`fx-blur-text ${inView ? 'in' : ''} ${className}`}>{text.split(' ').map((word, index) => <span key={index} style={{ transitionDelay: `${startDelay + index * step}ms` }}>{word}{index < text.split(' ').length - 1 ? ' ' : ''}</span>)}</span>
}

export function CountUp({ to, duration = 1500, suffix = '', className = '' }: { to: number; duration?: number; suffix?: string; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.5)
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <span ref={ref} className={className}>{value.toLocaleString()}{suffix}</span>
}

export function Tilt({ children, max = 6, className = '' }: { children: React.ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (event: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg)`
  }
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={() => { if (ref.current) ref.current.style.transform = '' }} className={`fx-tilt ${className}`}>{children}</div>
}

export function Magnetic({ children, strength = 0.25 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (event: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * strength}px, ${(event.clientY - rect.top - rect.height / 2) * strength}px)`
  }
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={() => { if (ref.current) ref.current.style.transform = '' }} className="fx-magnetic">{children}</div>
}

export function Marquee({ items }: { items: string[] }) {
  return <div className="fx-marquee" aria-hidden="true"><div className="fx-marquee-track">{[...items, ...items].map((item, index) => <span key={index}>{item}<i>✦</i></span>)}</div></div>
}

export function RadialRing({ percent, size = 96, stroke = 10, color = 'var(--primary-500)', track = 'rgba(255,255,255,.08)', label, sublabel }: { percent: number; size?: number; stroke?: number; color?: string; track?: string; label?: string; sublabel?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (inView ? percent / 100 : 0) * circumference
  return <div ref={ref} className="radial-ring" style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke}/>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)' }}/>
    </svg>
    {(label || sublabel) && <div className="radial-ring-copy"><strong>{label}</strong>{sublabel && <span>{sublabel}</span>}</div>}
  </div>
}

const confettiColors = ['#6871FA', '#A993F8', '#FFD86B', '#FDFCFC', '#5952F4']
export function ConfettiBurst({ trigger }: { trigger: number }) {
  if (!trigger) return null
  return <div className="confetti-layer" key={trigger} aria-hidden="true">{Array.from({ length: 90 }, (_, index) => <i key={index} style={{
    '--x': `${Math.random() * 100}vw`,
    '--dx': `${(Math.random() - 0.5) * 34}vw`,
    '--d': `${0.9 + Math.random() * 1.3}s`,
    '--delay': `${Math.random() * 0.3}s`,
    '--c': confettiColors[index % confettiColors.length],
    '--r': `${Math.random() * 720 - 360}deg`,
    '--s': `${6 + Math.random() * 8}px`,
  } as React.CSSProperties}/>)}</div>
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      setProgress((el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1)) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="fx-scroll-progress" style={{ width: `${progress}%` }}/>
}
