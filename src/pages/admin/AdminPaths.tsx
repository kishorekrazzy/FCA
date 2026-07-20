import { useState } from 'react'
import { ChevronDown, ChevronUp, Map, Plus, Trash2 } from 'lucide-react'
import { useAllCoursesAdmin } from '../../data/catalog'
import { deletePath, emptyPath, upsertPath, usePaths, type LearningPath } from '../../store/paths-store'

function PathEditor({ path, onClose }: { path: LearningPath; onClose: () => void }) {
 const courses = useAllCoursesAdmin()
 const [draft, setDraft] = useState(path)
 const [saving, setSaving] = useState(false)

 const toggleCourse = (slug: string) => setDraft((current) => ({ ...current, courseSlugs: current.courseSlugs.includes(slug) ? current.courseSlugs.filter((item) => item !== slug) : [...current.courseSlugs, slug] }))
 const save = async () => { setSaving(true); await upsertPath(draft).catch(() => window.alert('Could not save — check Firestore rules.')); setSaving(false); onClose() }

 return <div className="admin-panel path-editor">
  <label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Zero to Shipped Product"/></label>
  <div className="field-row">
   <label>Icon (emoji)<input value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })} maxLength={2}/></label>
  </div>
  <label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={2}/></label>
  <label>Courses in this track, in order</label>
  <div className="course-picker">{courses.map((course) => <label className="checkbox-label" key={course.slug}><input type="checkbox" checked={draft.courseSlugs.includes(course.slug)} onChange={() => toggleCourse(course.slug)}/> {course.title}</label>)}</div>
  <div className="admin-form-actions"><button className="button primary sm" onClick={save} disabled={saving || !draft.title}>{saving ? 'Saving…' : 'Save track'}</button><button className="button ghost sm" onClick={onClose}>Cancel</button></div>
 </div>
}

export function AdminPaths() {
 const paths = usePaths()
 const courses = useAllCoursesAdmin()
 const [editingId, setEditingId] = useState<string | null>(null)
 const [creating, setCreating] = useState(false)

 const remove = async (id: string) => { if (!window.confirm('Delete this learning path?')) return; await deletePath(id).catch(() => window.alert('Could not delete — check Firestore rules.')) }
 const move = async (path: LearningPath, dir: -1 | 1) => {
  const sorted = [...paths]
  const index = sorted.findIndex((item) => item.id === path.id)
  const target = index + dir
  if (target < 0 || target >= sorted.length) return
  const a = sorted[index], b = sorted[target]
  await Promise.all([upsertPath({ ...a, order: b.order }), upsertPath({ ...b, order: a.order })])
 }

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Curated tracks</span><h1>Learning paths</h1><p>Bundle courses into a guided sequence learners can follow on their dashboard.</p></div><button className="button primary" onClick={() => setCreating(true)}><Plus size={15}/> New path</button></header>
  <div className="admin-panel">
   {creating && <PathEditor path={emptyPath()} onClose={() => setCreating(false)}/>}
   {!paths.length && !creating && <p className="admin-empty">No learning paths yet — create one to guide learners through a sequence of courses.</p>}
   <div className="admin-post-list">{paths.map((path, index) => editingId === path.id ? <PathEditor path={path} onClose={() => setEditingId(null)} key={path.id}/> : <article className="admin-post path-row" key={path.id}>
    <span className="path-row-icon">{path.icon || '◈'}</span>
    <div className="admin-post-body">
     <div><b>{path.title || 'Untitled path'}</b> <span>{path.courseSlugs.length} {path.courseSlugs.length === 1 ? 'course' : 'courses'}</span></div>
     <p>{path.description}</p>
     <p className="path-course-list">{path.courseSlugs.map((slug) => courses.find((course) => course.slug === slug)?.title ?? slug).join(' · ') || 'No courses added yet.'}</p>
     <footer><button onClick={() => move(path, -1)} disabled={index === 0} aria-label="Move up"><ChevronUp size={13}/></button><button onClick={() => move(path, 1)} disabled={index === paths.length - 1} aria-label="Move down"><ChevronDown size={13}/></button><button onClick={() => setEditingId(path.id)}><Map size={13}/> Edit</button><button onClick={() => remove(path.id)} aria-label="Delete path"><Trash2/> Delete</button></footer>
    </div>
   </article>)}</div>
  </div>
 </div>
}
