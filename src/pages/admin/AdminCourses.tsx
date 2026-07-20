import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAllCoursesAdmin, isSeedCourse } from '../../data/catalog'
import { useCatalogStore, deleteCourseRemote, setCourseOrderRemote, upsertCourseFields } from '../../store/catalog-store'
import { allLessons } from '../../types'
import type { Course } from '../../types'

const contentHealth = (course: Course) => {
 const lessons = allLessons(course)
 if (!lessons.length) return 0
 const scored = lessons.filter((lesson) => lesson.thumbnail && ((lesson.blocks && lesson.blocks.length > 0) || lesson.sections.length > 0)).length
 return Math.round((scored / lessons.length) * 100)
}

export function AdminCourses() {
 const courses = useAllCoursesAdmin()
 const courseOrder = useCatalogStore((state) => state.courseOrder)
 const online = useCatalogStore((state) => state.online)

 useEffect(() => { if (!courseOrder.length && courses.length) setCourseOrderRemote(courses.map((course) => course.slug)).catch(() => {}) }, [courseOrder.length, courses])

 const moveCourse = (slug: string, dir: -1 | 1) => {
  const order = courseOrder.length ? [...courseOrder] : courses.map((course) => course.slug)
  const index = order.indexOf(slug)
  const target = index + dir
  if (index === -1 || target < 0 || target >= order.length) return
  ;[order[index], order[target]] = [order[target], order[index]]
  setCourseOrderRemote(order).catch(() => window.alert('Could not save order — check Firestore rules.'))
 }
 const remove = (slug: string) => {
  if (!window.confirm('Delete this course? This cannot be undone.')) return
  deleteCourseRemote(slug, isSeedCourse(slug)).catch(() => window.alert('Could not delete — check Firestore rules.'))
 }
 const togglePublish = (course: Course) => upsertCourseFields(course.slug, { status: course.status === 'draft' ? 'published' : 'draft' }, course).catch(() => window.alert('Could not save — check Firestore rules.'))
 const onRowMove = (event: React.MouseEvent<HTMLTableRowElement>) => { const el = event.currentTarget; const rect = el.getBoundingClientRect(); el.style.setProperty('--mx', `${event.clientX - rect.left}px`); el.style.setProperty('--my', `${event.clientY - rect.top}px`) }

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Content</span><h1>Courses</h1><p>Create, order, and publish courses. Changes save straight to Firestore and go live for every visitor.</p></div><Link className="button primary" to="/admin/courses/new"><Plus/> New course</Link></header>
  {!online && <p className="admin-banner">Firestore isn't reachable right now — edits here won't save. Check your connection or Firestore rules for the <code>courses</code> collection.</p>}
  <div className="admin-panel">
   <table className="admin-table wide"><thead><tr><th/><th>Cover</th><th>Course</th><th>Status</th><th>Lessons</th><th>Content health</th><th>Category</th><th>Difficulty</th><th/></tr></thead><tbody>{courses.map((course, index) => <tr key={course.slug} className="fx-spotlight" onMouseMove={onRowMove}>
    <td className="admin-order"><button onClick={() => moveCourse(course.slug, -1)} disabled={index === 0} aria-label="Move up"><ChevronUp/></button><button onClick={() => moveCourse(course.slug, 1)} disabled={index === courses.length - 1} aria-label="Move down"><ChevronDown/></button></td>
    <td><div className="admin-thumb">{course.thumbnail ? <img src={course.thumbnail} alt=""/> : <div className="admin-thumb-fallback" style={{ background: `linear-gradient(140deg, ${course.color}, #12121a)` }}/>}</div></td>
    <td><span className="admin-course-title">{course.title || <i>Untitled</i>}</span><small>/academy/{course.slug || '—'}</small></td>
    <td><button className={`status-pill ${course.status === 'draft' ? 'draft' : 'live'}`} onClick={() => togglePublish(course)}>{course.status === 'draft' ? 'Draft' : 'Published'}</button></td>
    <td><Layers size={13}/> {allLessons(course).length}</td>
    <td><div className="health-bar"><span style={{ width: `${contentHealth(course)}%` }}/></div><small>{contentHealth(course)}%</small></td>
    <td>{course.category}</td>
    <td>{course.difficulty}</td>
    <td className="admin-row-actions"><Link to={`/admin/courses/${course.slug}`} aria-label="Edit course"><Pencil/></Link><button onClick={() => remove(course.slug)} aria-label="Delete course"><Trash2/></button></td>
   </tr>)}</tbody></table>
   {!courses.length && <p className="admin-empty">No courses yet — create your first one.</p>}
  </div>
 </div>
}
