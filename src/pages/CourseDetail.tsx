import { useState } from 'react'
import { BarChart3, Check, CheckCircle2, Clock, Gift, Layers, Lock, Play, Sparkles, Star } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCourseBySlug } from '../data/catalog'
import { useAcademyStore } from '../store/academy-store'
import { useAuthStore } from '../store/auth-store'
import { courseRating, submitReview, useReviewsStore } from '../store/reviews-store'
import { allLessons } from '../types'
import { StarRating } from '../components/ui/Course'
import { RelatedCourses } from '../components/ui/RelatedCourses'

function ReviewsSection({ courseSlug, unlocked }: { courseSlug: string; unlocked: boolean }) {
 const user = useAuthStore((state) => state.user)
 const reviews = useReviewsStore((state) => state.reviews).filter((review) => review.courseSlug === courseSlug).sort((a, b) => b.createdAt - a.createdAt)
 const { avg, count } = courseRating(reviews, courseSlug)
 const myReview = user ? reviews.find((review) => review.uid === user.uid) : undefined
 const [rating, setRating] = useState(myReview?.rating ?? 0)
 const [hoverRating, setHoverRating] = useState(0)
 const [text, setText] = useState(myReview?.text ?? '')
 const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

 const submit = async () => {
  if (!user || !rating) return
  setStatus('saving')
  try { await submitReview(courseSlug, user.uid, user.displayName ?? 'FCA Learner', user.photoURL, rating, text.trim()); setStatus('saved') }
  catch { setStatus('idle'); window.alert('Could not save your review — please try again.') }
 }

 return <section className="reviews-section section">
  <div className="section-heading"><div><span className="kicker">Learner reviews</span><h2>What people are <em>saying.</em></h2></div>{count > 0 && <div className="reviews-summary"><StarRating value={avg} size={18}/><strong>{avg.toFixed(1)}</strong><span>({count} review{count === 1 ? '' : 's'})</span></div>}</div>
  {unlocked && user && <div className="review-form"><p className="review-form-label">{myReview ? 'Update your review' : 'Leave a review — you finished this course!'}</p><div className="star-input">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} aria-label={`Rate ${star} stars`}><Star size={22} className={star <= (hoverRating || rating) ? 'on' : ''}/></button>)}</div><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="What stood out about this course?" rows={3}/><button className="button primary sm" onClick={submit} disabled={!rating || status === 'saving'}>{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : myReview ? 'Update review' : 'Post review'}</button></div>}
  {!unlocked && user && <p className="review-gate">Finish every lesson in this course to unlock reviewing.</p>}
  {!user && <p className="review-gate"><Link to="/auth/sign-in">Sign in</Link> after completing this course to leave a review.</p>}
  <div className="review-list">{reviews.map((review) => <article className="review-card" key={review.id}><span className="post-avatar" style={{ background: '#5952F4' }}>{review.photoURL ? <img src={review.photoURL} alt="" referrerPolicy="no-referrer"/> : review.name.slice(0, 2).toUpperCase()}</span><div><header><b>{review.name}</b><StarRating value={review.rating}/></header>{review.text && <p>{review.text}</p>}</div></article>)}</div>
  {!reviews.length && <p className="admin-empty">No reviews yet — be the first once you finish the course.</p>}
 </section>
}

export function CourseDetail() {
 const { courseSlug } = useParams(); const navigate = useNavigate(); const course = useCourseBySlug(courseSlug)
 const enroll = useAcademyStore(state => state.enroll); const completed = useAcademyStore(state => state.completed); const progress = useAcademyStore(state => course ? state.progress(course.slug) : 0); const enrolled = useAcademyStore(state => course ? state.enrolled.includes(course.slug) : false)
 if (!course) return <main className="page not-found"><h1>That course drifted out of orbit.</h1><Link className="button primary" to="/academy">Back to academy</Link></main>
 const lessons = allLessons(course); const next = lessons.find(lesson => !completed.includes(lesson.slug)) ?? lessons[0]
 const start = () => { enroll(course.slug); navigate(`/academy/${course.slug}/${next.slug}`) }
 return <main className="course-page"><div className="course-frame"><div className="breadcrumbs"><Link to="/academy">Academy</Link> <span>/</span> {course.title}</div>
 <section className={`course-banner ${course.thumbnail ? 'has-photo' : ''}`} style={{ '--course-color': course.color } as React.CSSProperties}>{course.thumbnail && <img className="banner-photo" src={course.thumbnail} alt="" loading="lazy"/>}{course.thumbnail && <div className="banner-scrim"/>}<span className="banner-watermark">{course.category.toUpperCase()}</span><div className="banner-copy"><h1>{course.title}</h1><p>{course.subtitle} — taught by the FCA studio team</p><div className="banner-actions"><button className="button gold-button raised" onClick={start}>{enrolled && progress > 0 ? 'Continue' : 'Start course'}</button><span className="banner-credit">Taught by the team <b><Sparkles size={13}/> FCA Studio</b></span></div></div></section>
 <div className="course-columns"><div>
 <section className="learn-block"><h2>What you will learn</h2><div className="checklist">{course.skills.map(skill => <p key={skill}><CheckCircle2/> {skill}</p>)}</div></section>
 <section className="syllabus"><h2>Syllabus</h2>{lessons.map((lesson, index) => { const done = completed.includes(lesson.slug); const locked = index > 0 && !completed.includes(lessons[index - 1].slug)
  return <Link key={lesson.slug} to={locked ? '#' : `/academy/${course.slug}/${lesson.slug}`} className={`syllabus-row ${locked ? 'locked' : ''}`}><span className="syllabus-thumb" style={{ '--course-color': course.color, filter: lesson.thumbnail ? undefined : `hue-rotate(${index * 26}deg)` } as React.CSSProperties}>{lesson.thumbnail ? <img src={lesson.thumbnail} alt="" loading="lazy"/> : <><i/><i/></>}</span><span className="syllabus-copy"><small>Lesson {index + 1}</small><strong>{lesson.title}</strong></span><span className={`syllabus-state ${done ? 'done' : ''}`}>{done ? <Check/> : locked ? <Lock/> : <Play/>}</span></Link> })}</section>
 </div><aside className="course-rail"><div className="rail-cert"><div className="cert-visual"><span className="cert-seal-mini">✦</span><small>Certificate of Completion</small></div><Link className="button light full" to={`/academy/${course.slug}/certificate`}>Earn a certificate</Link></div>
 <section className="rail-group"><h3>Course details</h3><div className="chip-row"><span className="chip"><BarChart3/>{course.difficulty}</span><span className="chip gold"><Gift/>Free practice drills</span><span className="chip"><Layers/>{lessons.length} lessons</span><span className="chip"><Clock/>{course.duration}</span></div>{enrolled && <p className="rail-progress">{progress}% complete</p>}</section>
 <section className="rail-group"><h3>Skills you'll gain</h3><div className="chip-row">{course.skills.map(skill => <span className="chip" key={skill}>{skill}</span>)}</div></section>
 {course.models && <section className="rail-group"><h3>Models that you'll use</h3><div className="chip-row">{course.models.map(model => <span className="chip" key={model}>{model}</span>)}</div></section>}
 <section className="rail-group"><h3>Tools you'll learn</h3><div className="chip-row">{course.tools.map(tool => <span className="chip" key={tool}>{tool}</span>)}</div></section>
 </aside></div></div>
 <ReviewsSection courseSlug={course.slug} unlocked={progress === 100}/>
 <RelatedCourses excludeSlug={course.slug} category={course.category}/>
 </main>
}