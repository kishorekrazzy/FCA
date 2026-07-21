import { ArrowRight, Play, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCourses } from '../data/catalog'
import { BlurText, CountUp, Magnetic, Marquee, Reveal } from '../components/fx'
import { BannerCarousel } from '../components/ui/BannerCarousel'
import { useHeroImageUrl } from '../store/site-settings-store'
import type { Course } from '../types'

const topics = ['Systems Thinking', 'Creative Direction', 'Research Rituals', 'Prototyping', 'Decision Design', 'Taste Calibration', 'Field Notes', 'Leverage']

function CourseMedia({ course }: { course: Course }) {
 return course.thumbnail ? <img src={course.thumbnail} alt=""/> : <div className="rank-course-fallback" style={{ '--course-color': course.color } as React.CSSProperties}><span>{course.category}</span></div>
}

function RankedCourseCard({ course, rank }: { course: Course; rank: number }) {
 return <Link to={`/academy/${course.slug}`} className="rank-course-card">
  <span className="rank-course-number">{rank}</span>
  <div className="rank-course-media"><CourseMedia course={course}/></div>
  <span className="rank-course-badge"><Sparkles/> {course.difficulty} <Sparkles/></span>
 </Link>
}

function MiniCourseCard({ course }: { course: Course }) {
 return <Link to={`/academy/${course.slug}`} className="mini-course-card">
  <CourseMedia course={course}/>
  <span className="rank-course-badge"><Sparkles/> {course.difficulty} <Sparkles/></span>
 </Link>
}

export function Home() { const courses = useCourses(); const heroImageUrl = useHeroImageUrl(); return <main>
 <section className={`hero-min ${heroImageUrl ? 'has-image' : ''}`} style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}><div className="aurora"/><Reveal><span className="eyebrow center"><Sparkles/> A new kind of school</span></Reveal><h1 className="hero-title"><BlurText text="Learn the"/><br/><em><BlurText text="uncommon" startDelay={160}/></em> <BlurText text="way." startDelay={260}/></h1><Reveal delay={350}><p className="hero-sub">Short, exceptional courses for the curious. Build better instincts, collect proof of practice, and make more of what matters.</p></Reveal><Reveal delay={450}><div className="hero-ctas"><Magnetic><Link className="button primary lg" to="/academy">Explore the academy <ArrowRight/></Link></Magnetic><Link className="button ghost lg" to="/events">See how it works</Link></div></Reveal><Reveal delay={600}><span className="hero-meta">Scroll — the practice begins below</span></Reveal></section>
 <Reveal><div className="section banner-section"><BannerCarousel placement="home"/></div></Reveal>
 <Marquee items={topics}/>
 <section className="stats-min"><Reveal><div><strong><CountUp to={500}/><b>+</b></strong><p>precise lessons</p></div></Reveal><Reveal delay={80}><div><strong><CountUp to={12}/></strong><p>learning tracks</p></div></Reveal><Reveal delay={160}><div><strong>4.9<b>/5</b></strong><p>learner rating</p></div></Reveal><Reveal delay={240}><div><strong><CountUp to={12480}/><b>+</b></strong><p>thoughtful learners</p></div></Reveal></section>
 <section className="section featured"><div className="section-heading"><Reveal><div><span className="kicker">Start somewhere</span><h2>Courses with <em>pull.</em></h2></div></Reveal><Link to="/academy" className="text-link">View all courses <ArrowRight/></Link></div>
  <div className="rank-course-grid">{courses.slice(0, 3).map((course, index) => <Reveal delay={index * 90} key={course.slug}><RankedCourseCard course={course} rank={index + 1}/></Reveal>)}</div>
  {courses.length > 3 && <><h3 className="more-courses-heading">More to explore</h3><div className="mini-course-grid">{courses.slice(3).map((course, index) => <Reveal delay={index * 70} key={course.slug}><MiniCourseCard course={course}/></Reveal>)}</div></>}
 </section>
 <section className="how section"><div className="how-intro"><Reveal><span className="kicker">The ritual</span><h2>Small lessons.<br/>Real <em>momentum.</em></h2><p>Designed around how lasting learning actually happens: notice, try, reflect, repeat.</p></Reveal></div><div className="steps"><Reveal><article><span>01</span><Play/><h3>Follow your curiosity</h3><p>Pick a track with a question worth following.</p></article></Reveal><Reveal delay={100}><article><span>02</span><Sparkles/><h3>Practice until reflex</h3><p>Quick drills turn concepts into instinct.</p></article></Reveal><Reveal delay={200}><article><span>03</span><Star/><h3>Keep the proof</h3><p>Earn verifiable credentials for the work you finish.</p></article></Reveal></div></section>
 <section className="quote"><Reveal><span>“</span><p>Not more content. <em>Better attention.</em></p><small>THE FCA PRINCIPLE</small></Reveal></section>
 <section className="cta-final"><div className="aurora"/><Reveal><span className="kicker center">Your move</span><h2>Start tonight.</h2><p>One lesson. Fifteen minutes. The version of you that ships is on the other side of it.</p><Magnetic><Link className="button gold-button lg" to="/academy">Begin your first lesson <ArrowRight/></Link></Magnetic></Reveal></section>
</main> }
