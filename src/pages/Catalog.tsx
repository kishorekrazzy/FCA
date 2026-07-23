import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useCourses } from '../data/catalog'
import { CourseCard } from '../components/ui/Course'
import { BannerCarousel } from '../components/ui/BannerCarousel'

const EASE = [0.22, 1, 0.36, 1] as const

const minutes = (duration: string) => { const hours = /(\d+)h/.exec(duration); const mins = /(\d+)m/.exec(duration); return (hours ? +hours[1] * 60 : 0) + (mins ? +mins[1] : 0) }
const difficultyRank = { Beginner: 0, Intermediate: 1, Advanced: 2 }

export function Catalog() {
 const courses = useCourses()
 const [query, setQuery] = useState(''); const [topic, setTopic] = useState('All'); const [sort, setSort] = useState('featured'); const inputRef = useRef<HTMLInputElement>(null); const [params] = useSearchParams()
 const topics = ['All', ...new Set(courses.map(course => course.category))]
 const visible = useMemo(() => {
  const filtered = courses.filter(course => (topic === 'All' || course.category === topic) && `${course.title} ${course.description} ${course.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  if (sort === 'az') return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'shortest') return [...filtered].sort((a, b) => minutes(a.duration) - minutes(b.duration))
  if (sort === 'difficulty') return [...filtered].sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty])
  return filtered
 }, [courses, query, topic, sort])
 useEffect(() => { if (params.get('focus')) inputRef.current?.focus() }, [params])
 useEffect(() => {
  const onKey = (event: KeyboardEvent) => { if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') { event.preventDefault(); inputRef.current?.focus() } }
  window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
 }, [])
 const totalHours = Math.round(courses.reduce((sum, course) => sum + minutes(course.duration), 0) / 60)
 return <main className="catalog page">
  <div className="catalog-top">
   <div className="page-intro"><span className="kicker">The catalog</span><h1>Make your next<br/><em>idea inevitable.</em></h1><p>A growing collection of short, serious courses for the people shaping what comes next.</p></div>
   <div className="catalog-glance">
    <div className="glance-stat"><strong>{courses.length}</strong><span>courses</span></div>
    <div className="glance-stat"><strong>{topics.length - 1}</strong><span>topics</span></div>
    <div className="glance-stat"><strong>{totalHours}h</strong><span>of practice</span></div>
   </div>
  </div>
  <div className="banner-section"><BannerCarousel placement="academy"/></div>
  <div className="catalog-toolbar"><label className="search"><Search/><input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search ideas, skills, courses"/><kbd>/</kbd></label><div className="filters"><SlidersHorizontal size={15}/>{topics.map(item => <button onClick={() => setTopic(item)} className={topic === item ? 'selected' : ''} key={item}>{item}</button>)}<select className="sort-select" value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort courses"><option value="featured">Featured</option><option value="az">A – Z</option><option value="shortest">Shortest first</option><option value="difficulty">By difficulty</option></select></div></div>
  <div className="catalog-result"><span>{visible.length} {visible.length === 1 ? 'course' : 'courses'} to explore</span><span>Updated weekly</span></div>
  <div className="course-grid catalog-grid"><AnimatePresence>{visible.map((course, index) => <motion.div layout key={course.slug} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.32, ease: EASE, delay: Math.min(index, 8) * 0.05 }}><CourseCard course={course}/></motion.div>)}</AnimatePresence></div>
  {!visible.length && <div className="empty"><Search size={22}/><strong>No signal found.</strong><p>Try a different search term or topic.</p></div>}
 </main> }
