import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCourses } from '../../data/catalog'
import { CourseCard } from './Course'
import { Reveal } from '../fx'

export function RelatedCourses({ excludeSlug, category }: { excludeSlug: string; category: string }) {
 const courses = useCourses().filter((course) => course.slug !== excludeSlug)
 if (!courses.length) return null
 const sameCategory = courses.filter((course) => course.category === category)
 const rest = courses.filter((course) => course.category !== category)
 const picks = [...sameCategory, ...rest].slice(0, 3)
 return <section className="related-courses section"><div className="section-heading"><Reveal><div><span className="kicker">Keep exploring</span><h2>What to learn <em>next.</em></h2></div></Reveal><Link to="/academy" className="text-link">All courses <ArrowRight/></Link></div><div className="course-grid">{picks.map((course, index) => <Reveal delay={index * 90} key={course.slug}><CourseCard course={course}/></Reveal>)}</div></section>
}
