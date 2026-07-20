import { ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Course } from '../../types'
import { useAcademyStore } from '../../store/academy-store'
import { courseRating, useReviewsStore } from '../../store/reviews-store'

export function ProgressBar({ value }: { value: number }) { return <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${value}%` }}/></div> }
export function Pill({ children, gold = false }: { children: React.ReactNode; gold?: boolean }) { return <span className={`pill ${gold ? 'gold' : ''}`}>{children}</span> }

export function CourseArt({ course, large = false }: { course: Course; large?: boolean }) { return <div className={`course-art art-${course.art} ${large ? 'large' : ''}`} style={{ '--course-color': course.color } as React.CSSProperties}><i/><i/><i/><span>{course.category}</span></div> }

export function StarRating({ value, size = 13 }: { value: number; size?: number }) { return <span className="star-rating" aria-hidden="true">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} className={star <= Math.round(value) ? 'on' : ''}/>)}</span> }

export function CourseCard({ course }: { course: Course }) {
 const progress = useAcademyStore((state) => state.progress(course.slug)); const enrolled = useAcademyStore((state) => state.enrolled.includes(course.slug))
 const reviews = useReviewsStore((state) => state.reviews)
 const { avg, count } = courseRating(reviews, course.slug)
 const onMove = (event: React.MouseEvent<HTMLAnchorElement>) => { const el = event.currentTarget; const rect = el.getBoundingClientRect(); el.style.setProperty('--mx', `${event.clientX - rect.left}px`); el.style.setProperty('--my', `${event.clientY - rect.top}px`) }
 return <Link to={`/academy/${course.slug}`} className="poster-card fx-spotlight" onMouseMove={onMove} style={{ '--course-color': course.color } as React.CSSProperties}>
  <div className={`poster-art ${course.thumbnail ? 'has-photo' : ''}`} aria-hidden="true">{course.thumbnail ? <img className="poster-photo" src={course.thumbnail} alt="" loading="lazy"/> : <><i className="poster-stars"/><i className="poster-cloud one"/><i className="poster-cloud two"/><i className="poster-glow"/><i className="poster-meadow"/><i className="poster-figure"/></>}</div>
  <span className="poster-tagline">{course.tagline ?? course.category}</span>
  <div className="poster-body"><h3>{course.title}</h3><p>{course.subtitle}</p>{count > 0 && <span className="poster-rating"><StarRating value={avg}/> {avg.toFixed(1)} <i>({count})</i></span>}{enrolled && progress > 0 ? <span className="poster-btn"><span className="poster-progress"><span style={{ width: `${progress}%` }}/></span>{progress}% complete</span> : <span className="poster-btn">Explore course <ArrowRight size={13}/></span>}</div>
  <div className="poster-meta"><span>fca.academy</span><span>{course.difficulty} <i>✦</i> {course.duration} <i>✦</i> {course.category}</span></div>
 </Link>
}
