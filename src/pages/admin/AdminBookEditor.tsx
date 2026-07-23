import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBookBySlug, useBooksSynced, upsertBookFields } from '../../store/book-store'
import { emptyBook, slugify } from '../../types'
import type { Book } from '../../types'

const categories = ['Foundations', 'Creative Practice', 'Strategy', 'Product', 'Mindset']

export function AdminBookEditor() {
 const { slug: routeSlug } = useParams()
 const isNew = !routeSlug || routeSlug === 'new'
 const navigate = useNavigate()
 const existing = useBookBySlug(routeSlug, true)
 const synced = useBooksSynced()
 const [book, setBook] = useState<Book>(() => existing ?? emptyBook())
 const [slugTouched, setSlugTouched] = useState(!isNew)
 const [saveError, setSaveError] = useState(false)
 const [saving, setSaving] = useState(false)

 useEffect(() => { if (!isNew && existing) setBook(existing) }, [routeSlug]) // eslint-disable-line react-hooks/exhaustive-deps

 const commit = (patch: Partial<Book>) => {
  const stamped = { ...book, ...patch, updatedAt: Date.now() }
  setBook(stamped)
  if (!stamped.slug) return
  setSaving(true)
  upsertBookFields(stamped.slug, patch, stamped).then(() => { setSaveError(false); setSaving(false) }).catch(() => { setSaveError(true); setSaving(false) })
  if (isNew) navigate(`/admin/books/${stamped.slug}`, { replace: true })
 }

 const setField = <K extends keyof Book>(key: K, value: Book[K]) => {
  const patch: Partial<Book> = { [key]: value }
  if (key === 'title' && !slugTouched) patch.slug = slugify(String(value))
  commit(patch)
 }
 const setSlugField = (value: string) => { setSlugTouched(true); commit({ slug: slugify(value) }) }
 const setSkills = (value: string) => commit({ skills: value.split(',').map((item) => item.trim()).filter(Boolean) })

 const moveChapter = (index: number, dir: -1 | 1) => { const target = index + dir; if (target < 0 || target >= book.chapters.length) return; const chapters = [...book.chapters]; [chapters[index], chapters[target]] = [chapters[target], chapters[index]]; commit({ chapters }) }
 const deleteChapter = (index: number) => { if (!window.confirm('Delete this chapter?')) return; commit({ chapters: book.chapters.filter((_, itemIndex) => itemIndex !== index) }) }

 if (!isNew && !existing) return <div className="admin-page"><p className="admin-empty">{synced ? 'Book not found.' : 'Loading book from Firestore…'}</p></div>

 return <div className="admin-page">
  <header className="admin-header"><div><Link className="text-link" to="/admin/books"><ArrowLeft size={14}/> All books</Link><h1>{isNew ? 'New book' : book.title || 'Untitled book'}</h1></div><div className="admin-header-actions"><span className={`save-state ${saveError ? 'error' : saving ? 'saving' : ''}`}>{saveError ? 'Save failed — check Firestore rules' : saving ? 'Saving…' : book.slug ? 'Saved to Firestore ✓' : ''}</span>{book.slug && <Link className="button ghost" to={`/books/${book.slug}`} target="_blank" rel="noreferrer">Preview live →</Link>}</div></header>

  <div className="admin-form-grid">
   <section className="admin-panel">
    <h2>Book details</h2>
    <label>Title<input value={book.title} onChange={(event) => setField('title', event.target.value)} placeholder="e.g. The Quiet Edge"/></label>
    <label>URL slug<input value={book.slug} onChange={(event) => setSlugField(event.target.value)} placeholder="my-first-book"/></label>
    <label>Subtitle<input value={book.subtitle} onChange={(event) => setField('subtitle', event.target.value)} placeholder="One-line hook"/></label>
    <label>Description<textarea value={book.description} onChange={(event) => setField('description', event.target.value)} rows={3}/></label>
    <label>Tagline (shelf card)<input value={book.tagline ?? ''} onChange={(event) => setField('tagline', event.target.value)} placeholder='"A short read on staying curious."'/></label>
    <label>Cover thumbnail (image URL)<input value={book.thumbnail ?? ''} onChange={(event) => setField('thumbnail', event.target.value)} placeholder="https://images.example.com/book-cover.jpg"/></label>
    <div className={`thumb-preview ${book.thumbnail ? '' : 'thumb-preview-empty'}`}>{book.thumbnail ? <img src={book.thumbnail} alt=""/> : <span>No image set — a generated cover will be used instead.</span>}</div>
    <div className="field-row">
     <label>Category<input value={book.category} onChange={(event) => setField('category', event.target.value)} list="admin-book-categories"/><datalist id="admin-book-categories">{categories.map((item) => <option key={item} value={item}/>)}</datalist></label>
     <label>Difficulty<select value={book.difficulty} onChange={(event) => setField('difficulty', event.target.value as Book['difficulty'])}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
    </div>
    <div className="field-row">
     <label>Reading time<input value={book.duration} onChange={(event) => setField('duration', event.target.value)} placeholder="45 min"/></label>
     <label>Accent color<input type="color" value={book.color} onChange={(event) => setField('color', event.target.value)}/></label>
    </div>
    <label>Skills / takeaways (comma-separated)<input value={book.skills.join(', ')} onChange={(event) => setSkills(event.target.value)}/></label>
    <div className="field-row">
     <label className="checkbox-label"><input type="checkbox" checked={book.status !== 'draft'} onChange={(event) => setField('status', event.target.checked ? 'published' : 'draft')}/> Published (visible on the public site)</label>
     <label className="checkbox-label"><input type="checkbox" checked={!!book.featured} onChange={(event) => setField('featured', event.target.checked)}/> Featured</label>
    </div>
   </section>

   <section className="admin-panel">
    <div className="admin-panel-head"><h2>Chapters</h2></div>
    {!book.slug && <p className="admin-empty">Add a title above to start adding chapters.</p>}
    {book.slug && book.chapters.map((chapter, index) => <div className="admin-lesson-row" key={chapter.slug || index}>
     <span>{chapter.title || <i>Untitled chapter</i>}</span><small>{chapter.duration} · {chapter.xp} IQ</small>
     <div className="block-order"><button onClick={() => moveChapter(index, -1)} disabled={index === 0} aria-label="Move chapter up"><ChevronUp/></button><button onClick={() => moveChapter(index, 1)} disabled={index === book.chapters.length - 1} aria-label="Move chapter down"><ChevronDown/></button></div>
     <Link to={`/admin/books/${book.slug}/chapters/${encodeURIComponent(chapter.slug)}`} aria-label="Edit chapter"><Pencil/></Link>
     <button className="block-delete" onClick={() => deleteChapter(index)} aria-label="Delete chapter"><Trash2/></button>
    </div>)}
    {book.slug && <Link className="button ghost sm" to={`/admin/books/${book.slug}/chapters/new`}><Plus/> Add chapter</Link>}
   </section>
  </div>
 </div>
}
