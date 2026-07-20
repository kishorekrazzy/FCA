import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useCourseBySlug } from '../../data/catalog'
import { upsertLessonRemote } from '../../store/catalog-store'
import { emptyLesson, slugify } from '../../types'
import type { ContentBlock, Lesson } from '../../types'
import { BlockEditor } from '../../components/admin/BlockEditor'
import { RenderBlocks } from '../../components/admin/BlockRenderer'

export function AdminLessonEditor() {
 const { slug: courseSlug, lessonId } = useParams()
 const [params] = useSearchParams()
 const moduleIndex = Number(params.get('m') ?? 0)
 const navigate = useNavigate()
 const course = useCourseBySlug(courseSlug, true)
 const [saving, setSaving] = useState(false)
 const isNew = !lessonId || lessonId === 'new'
 const existingLesson = course?.modules[moduleIndex]?.lessons.find((item) => item.slug === lessonId)
 const [lesson, setLesson] = useState<Lesson>(() => existingLesson ?? emptyLesson())
 const [slugTouched, setSlugTouched] = useState(!isNew)
 const [includeTable, setIncludeTable] = useState(!!existingLesson?.table)
 const [includeDrill, setIncludeDrill] = useState(!!existingLesson?.drill)
 const [tableHeaders, setTableHeaders] = useState(existingLesson?.table?.headers.join(', ') ?? 'Handoff, What crosses it, Why it matters')
 const [tableRows, setTableRows] = useState(existingLesson?.table?.rows.map((row) => row.join(' | ')).join('\n') ?? '')

 if (!course) return <div className="admin-page"><p className="admin-empty">Course not found.</p></div>

 const setField = <K extends keyof Lesson>(key: K, value: Lesson[K]) => {
  let next = { ...lesson, [key]: value }
  if (key === 'title' && !slugTouched) next = { ...next, slug: slugify(String(value)) }
  setLesson(next)
 }

 const save = async () => {
  const title = lesson.title.trim()
  if (!title) { window.alert('Give the lesson a title first.'); return }
  const finalSlug = lesson.slug || slugify(title)
  const finalLesson: Lesson = { ...lesson, slug: finalSlug, title }
  if (includeTable) finalLesson.table = { title: finalLesson.table?.title || 'Reference table', headers: tableHeaders.split(',').map((item) => item.trim()).filter(Boolean), rows: tableRows.split('\n').map((row) => row.trim()).filter(Boolean).map((row) => row.split('|').map((cell) => cell.trim())) }
  else delete finalLesson.table
  if (!includeDrill) delete finalLesson.drill

  setSaving(true)
  try { await upsertLessonRemote(course.slug, moduleIndex, existingLesson?.slug, finalLesson, course); navigate(`/admin/courses/${course.slug}`) }
  catch { setSaving(false); window.alert('Could not save to Firestore — check your connection or Firestore rules for the "courses" collection.') }
 }

 const setBlocks = (blocks: ContentBlock[]) => setLesson({ ...lesson, blocks })

 return <div className="admin-page">
  <header className="admin-header"><div><Link className="text-link" to={`/admin/courses/${course.slug}`}><ArrowLeft size={14}/> {course.title}</Link><h1>{isNew ? 'New lesson' : lesson.title || 'Untitled lesson'}</h1><p>Module: {course.modules[moduleIndex]?.title ?? '—'}</p></div><button className="button primary" onClick={save} disabled={saving}><Save/> {saving ? 'Saving…' : 'Save lesson'}</button></header>

  <div className="admin-form-grid lesson-grid">
   <section className="admin-panel">
    <h2>Lesson details</h2>
    <label>Title<input value={lesson.title} onChange={(event) => setField('title', event.target.value)} placeholder="e.g. Maps before moves"/></label>
    <label>URL slug<input value={lesson.slug} onChange={(event) => { setSlugTouched(true); setField('slug', slugify(event.target.value)) }} placeholder="maps-before-moves"/></label>
    <div className="field-row">
     <label>Duration<input value={lesson.duration} onChange={(event) => setField('duration', event.target.value)} placeholder="10 min"/></label>
     <label>XP reward<input type="number" min={5} step={5} value={lesson.xp} onChange={(event) => setField('xp', Number(event.target.value))}/></label>
     <label>Type<select value={lesson.type ?? 'standard'} onChange={(event) => setField('type', event.target.value as Lesson['type'])}><option value="standard">Standard</option><option value="test">Section test</option><option value="capstone">Capstone</option></select></label>
    </div>
    <label>Eyebrow label<input value={lesson.eyebrow} onChange={(event) => setField('eyebrow', event.target.value)} placeholder="Module 01 / Practice"/></label>
    <label>Lead paragraph<textarea value={lesson.lead} onChange={(event) => setField('lead', event.target.value)} rows={3} placeholder="One or two sentences under the title."/></label>
    <label>Lesson thumbnail (image URL)<input value={lesson.thumbnail ?? ''} onChange={(event) => setField('thumbnail', event.target.value)} placeholder="https://images.example.com/lesson-hero.jpg"/></label>
    <div className={`thumb-preview thumb-preview-wide ${lesson.thumbnail ? '' : 'thumb-preview-empty'}`}>{lesson.thumbnail ? <img src={lesson.thumbnail} alt=""/> : <span>No image set — the generated hero art will be used as the default.</span>}</div>

    <label className="checkbox-label"><input type="checkbox" checked={includeTable} onChange={(event) => setIncludeTable(event.target.checked)}/> Include a reference table</label>
    {includeTable && <div className="admin-subform">
     <label>Table title<input value={lesson.table?.title ?? ''} onChange={(event) => setLesson({ ...lesson, table: { title: event.target.value, headers: lesson.table?.headers ?? [], rows: lesson.table?.rows ?? [] } })} placeholder="Follow the handoffs"/></label>
     <label>Column headers (comma-separated)<input value={tableHeaders} onChange={(event) => setTableHeaders(event.target.value)}/></label>
     <label>Rows — one per line, cells separated by "|"<textarea value={tableRows} onChange={(event) => setTableRows(event.target.value)} rows={3} placeholder="Brief → setup | An agreed plan | Sets direction"/></label>
    </div>}

    <label className="checkbox-label"><input type="checkbox" checked={includeDrill} onChange={(event) => setIncludeDrill(event.target.checked)}/> Include a practice drill</label>
    {includeDrill && <div className="admin-subform">
     <label>Prompt<input value={lesson.drill?.prompt ?? ''} onChange={(event) => setLesson({ ...lesson, drill: { prompt: event.target.value, placeholder: lesson.drill?.placeholder ?? '', accepted: lesson.drill?.accepted ?? [], hint: lesson.drill?.hint ?? '' } })}/></label>
     <label>Input placeholder<input value={lesson.drill?.placeholder ?? ''} onChange={(event) => setLesson({ ...lesson, drill: { prompt: lesson.drill?.prompt ?? '', placeholder: event.target.value, accepted: lesson.drill?.accepted ?? [], hint: lesson.drill?.hint ?? '' } })}/></label>
     <label>Accepted answers (comma-separated)<input value={(lesson.drill?.accepted ?? []).join(', ')} onChange={(event) => setLesson({ ...lesson, drill: { prompt: lesson.drill?.prompt ?? '', placeholder: lesson.drill?.placeholder ?? '', accepted: event.target.value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean), hint: lesson.drill?.hint ?? '' } })}/></label>
     <label>Hint<input value={lesson.drill?.hint ?? ''} onChange={(event) => setLesson({ ...lesson, drill: { prompt: lesson.drill?.prompt ?? '', placeholder: lesson.drill?.placeholder ?? '', accepted: lesson.drill?.accepted ?? [], hint: event.target.value } })}/></label>
    </div>}
   </section>

   <section className="admin-panel">
    <h2>Content blocks</h2>
    <p className="admin-hint-line">Add a heading first, then image or video URLs, in the order they should appear. Drag the handle or use the arrows to reorder; use the align buttons to position each block.</p>
    <BlockEditor blocks={lesson.blocks ?? []} onChange={setBlocks}/>
   </section>

   <section className="admin-panel lesson-live-preview">
    <h2>Live preview</h2>
    <div className="lesson-article preview-frame"><span className="lesson-eyebrow">{lesson.eyebrow || course.title}</span><h1>{lesson.title || 'Untitled lesson'}</h1><p className="lesson-lead">{lesson.lead}</p>{lesson.blocks && lesson.blocks.length > 0 ? <RenderBlocks blocks={lesson.blocks}/> : <p className="admin-empty">No blocks yet.</p>}</div>
   </section>
  </div>
 </div>
}
