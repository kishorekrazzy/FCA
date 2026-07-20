import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCatalogSynced, useCourseBySlug } from '../../data/catalog'
import { upsertCourseFields } from '../../store/catalog-store'
import { emptyCourse, slugify } from '../../types'
import type { Course } from '../../types'

const categories = ['Foundations', 'Creative Practice', 'Strategy', 'Product']
const artOptions = ['orbit', 'ribbon', 'signal', 'grid']

export function AdminCourseEditor() {
 const { slug: routeSlug } = useParams()
 const isNew = !routeSlug || routeSlug === 'new'
 const navigate = useNavigate()
 const existing = useCourseBySlug(routeSlug, true)
 const synced = useCatalogSynced()
 const [course, setCourse] = useState<Course>(() => existing ?? emptyCourse())
 const [slugTouched, setSlugTouched] = useState(!isNew)
 const [saveError, setSaveError] = useState(false)
 const [saving, setSaving] = useState(false)

 // Sync local form state from the live document only when navigating to a different
 // course, not on every echo of our own writes — otherwise a mid-typing keystroke
 // can be clobbered by the round-trip of the previous keystroke's save.
 useEffect(() => { if (!isNew && existing) setCourse(existing) }, [routeSlug]) // eslint-disable-line react-hooks/exhaustive-deps

 // `commit` only ever writes the given patch, merged onto a freshly-fetched remote document
 // (see upsertCourseFields) — never the full local `course` object. That way a course-detail
 // edit can't clobber a lesson saved moments earlier, and vice versa.
 const commit = (patch: Partial<Course>) => {
  const stamped = { ...course, ...patch, updatedAt: Date.now() }
  setCourse(stamped)
  if (!stamped.slug) return
  setSaving(true)
  upsertCourseFields(stamped.slug, patch, stamped).then(() => { setSaveError(false); setSaving(false) }).catch(() => { setSaveError(true); setSaving(false) })
  if (isNew) navigate(`/admin/courses/${stamped.slug}`, { replace: true })
 }

 const setField = <K extends keyof Course>(key: K, value: Course[K]) => {
  const patch: Partial<Course> = { [key]: value }
  if (key === 'title' && !slugTouched) patch.slug = slugify(String(value))
  commit(patch)
 }
 const setSlugField = (value: string) => { setSlugTouched(true); commit({ slug: slugify(value) }) }
 const setList = (key: 'skills' | 'tools' | 'models', value: string) => commit({ [key]: value.split(',').map((item) => item.trim()).filter(Boolean) })

 const addModule = () => commit({ modules: [...course.modules, { title: 'New module', lessons: [] }] })
 const renameModule = (index: number, title: string) => { const modules = [...course.modules]; modules[index] = { ...modules[index], title }; commit({ modules }) }
 const deleteModule = (index: number) => { if (!window.confirm('Delete this module and its lessons?')) return; commit({ modules: course.modules.filter((_, itemIndex) => itemIndex !== index) }) }
 const moveModule = (index: number, dir: -1 | 1) => { const target = index + dir; if (target < 0 || target >= course.modules.length) return; const modules = [...course.modules]; [modules[index], modules[target]] = [modules[target], modules[index]]; commit({ modules }) }
 const moveLesson = (moduleIndex: number, lessonIndex: number, dir: -1 | 1) => { const modules = [...course.modules]; const lessons = [...modules[moduleIndex].lessons]; const target = lessonIndex + dir; if (target < 0 || target >= lessons.length) return; [lessons[lessonIndex], lessons[target]] = [lessons[target], lessons[lessonIndex]]; modules[moduleIndex] = { ...modules[moduleIndex], lessons }; commit({ modules }) }
 const deleteLesson = (moduleIndex: number, lessonIndex: number) => { if (!window.confirm('Delete this lesson?')) return; const modules = [...course.modules]; modules[moduleIndex] = { ...modules[moduleIndex], lessons: modules[moduleIndex].lessons.filter((_, itemIndex) => itemIndex !== lessonIndex) }; commit({ modules }) }

 if (!isNew && !existing) return <div className="admin-page"><p className="admin-empty">{synced ? 'Course not found.' : 'Loading course from Firestore…'}</p></div>

 return <div className="admin-page">
  <header className="admin-header"><div><Link className="text-link" to="/admin/courses"><ArrowLeft size={14}/> All courses</Link><h1>{isNew ? 'New course' : course.title || 'Untitled course'}</h1></div><div className="admin-header-actions"><span className={`save-state ${saveError ? 'error' : saving ? 'saving' : ''}`}>{saveError ? 'Save failed — check Firestore rules' : saving ? 'Saving…' : course.slug ? 'Saved to Firestore ✓' : ''}</span>{course.slug && <Link className="button ghost" to={`/academy/${course.slug}`} target="_blank" rel="noreferrer">Preview live →</Link>}</div></header>

  <div className="admin-form-grid">
   <section className="admin-panel">
    <h2>Course details</h2>
    <label>Title<input value={course.title} onChange={(event) => setField('title', event.target.value)} placeholder="e.g. Systems Thinking for Makers"/></label>
    <label>URL slug<input value={course.slug} onChange={(event) => setSlugField(event.target.value)} placeholder="systems-thinking"/></label>
    <label>Subtitle<input value={course.subtitle} onChange={(event) => setField('subtitle', event.target.value)} placeholder="One-line hook"/></label>
    <label>Description<textarea value={course.description} onChange={(event) => setField('description', event.target.value)} rows={3}/></label>
    <label>Tagline (poster card)<input value={course.tagline ?? ''} onChange={(event) => setField('tagline', event.target.value)} placeholder='"Notice more. React less."'/></label>
    <label>Cover thumbnail (image URL)<input value={course.thumbnail ?? ''} onChange={(event) => setField('thumbnail', event.target.value)} placeholder="https://images.example.com/course-cover.jpg"/></label>
    <div className={`thumb-preview ${course.thumbnail ? '' : 'thumb-preview-empty'}`}>{course.thumbnail ? <img src={course.thumbnail} alt=""/> : <span>No image set — the generated poster art will be used as the default cover.</span>}</div>
    <div className="field-row">
     <label>Category<input value={course.category} onChange={(event) => setField('category', event.target.value)} list="admin-categories"/><datalist id="admin-categories">{categories.map((item) => <option key={item} value={item}/>)}</datalist></label>
     <label>Difficulty<select value={course.difficulty} onChange={(event) => setField('difficulty', event.target.value as Course['difficulty'])}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
    </div>
    <div className="field-row">
     <label>Duration<input value={course.duration} onChange={(event) => setField('duration', event.target.value)} placeholder="2h 45m"/></label>
     <label>Accent color<input type="color" value={course.color} onChange={(event) => setField('color', event.target.value)}/></label>
     <label>Poster style<select value={course.art} onChange={(event) => setField('art', event.target.value)}>{artOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    <label>Skills (comma-separated)<input value={course.skills.join(', ')} onChange={(event) => setList('skills', event.target.value)}/></label>
    <label>Tools (comma-separated)<input value={course.tools.join(', ')} onChange={(event) => setList('tools', event.target.value)}/></label>
    <label>Models (comma-separated)<input value={(course.models ?? []).join(', ')} onChange={(event) => setList('models', event.target.value)}/></label>
    <div className="field-row">
     <label className="checkbox-label"><input type="checkbox" checked={course.status !== 'draft'} onChange={(event) => setField('status', event.target.checked ? 'published' : 'draft')}/> Published (visible on the public site)</label>
     <label className="checkbox-label"><input type="checkbox" checked={!!course.featured} onChange={(event) => setField('featured', event.target.checked)}/> Featured on home</label>
    </div>
   </section>

   <section className="admin-panel">
    <div className="admin-panel-head"><h2>Modules & lessons</h2><button className="button ghost sm" onClick={addModule} disabled={!course.slug}><Plus/> Add module</button></div>
    {!course.slug && <p className="admin-empty">Add a title above to start building modules.</p>}
    {course.modules.map((module, moduleIndex) => <div className="admin-module" key={moduleIndex}>
     <div className="admin-module-head">
      <input value={module.title} onChange={(event) => renameModule(moduleIndex, event.target.value)} placeholder="Module title"/>
      <div className="block-order"><button onClick={() => moveModule(moduleIndex, -1)} disabled={moduleIndex === 0} aria-label="Move module up"><ChevronUp/></button><button onClick={() => moveModule(moduleIndex, 1)} disabled={moduleIndex === course.modules.length - 1} aria-label="Move module down"><ChevronDown/></button></div>
      <button className="block-delete" onClick={() => deleteModule(moduleIndex)} aria-label="Delete module"><Trash2/></button>
     </div>
     {module.lessons.map((lesson, lessonIndex) => <div className="admin-lesson-row" key={lesson.slug || lessonIndex}>
      <span>{lesson.title || <i>Untitled lesson</i>}</span><small>{lesson.duration} · {lesson.xp} XP</small>
      <div className="block-order"><button onClick={() => moveLesson(moduleIndex, lessonIndex, -1)} disabled={lessonIndex === 0} aria-label="Move lesson up"><ChevronUp/></button><button onClick={() => moveLesson(moduleIndex, lessonIndex, 1)} disabled={lessonIndex === module.lessons.length - 1} aria-label="Move lesson down"><ChevronDown/></button></div>
      <Link to={`/admin/courses/${course.slug}/lessons/${encodeURIComponent(lesson.slug)}?m=${moduleIndex}`} aria-label="Edit lesson"><Pencil/></Link>
      <button className="block-delete" onClick={() => deleteLesson(moduleIndex, lessonIndex)} aria-label="Delete lesson"><Trash2/></button>
     </div>)}
     <Link className="button ghost sm" to={`/admin/courses/${course.slug}/lessons/new?m=${moduleIndex}`}><Plus/> Add lesson</Link>
    </div>)}
   </section>
  </div>
 </div>
}
