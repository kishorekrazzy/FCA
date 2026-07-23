import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useBookBySlug, upsertChapterRemote } from '../../store/book-store'
import { emptyChapter, slugify } from '../../types'
import type { ContentBlock, Chapter } from '../../types'
import { BlockEditor } from '../../components/admin/BlockEditor'
import { RenderBlocks } from '../../components/admin/BlockRenderer'

export function AdminChapterEditor() {
 const { slug: bookSlug, chapterId } = useParams()
 const navigate = useNavigate()
 const book = useBookBySlug(bookSlug, true)
 const [saving, setSaving] = useState(false)
 const isNew = !chapterId || chapterId === 'new'
 const existingChapter = book?.chapters.find((item) => item.slug === chapterId)
 const [chapter, setChapter] = useState<Chapter>(() => existingChapter ?? emptyChapter())
 const [slugTouched, setSlugTouched] = useState(!isNew)

 if (!book) return <div className="admin-page"><p className="admin-empty">Book not found.</p></div>

 const setField = <K extends keyof Chapter>(key: K, value: Chapter[K]) => {
  let next = { ...chapter, [key]: value }
  if (key === 'title' && !slugTouched) next = { ...next, slug: slugify(String(value)) }
  setChapter(next)
 }

 const save = async () => {
  const title = chapter.title.trim()
  if (!title) { window.alert('Give the chapter a title first.'); return }
  const finalSlug = chapter.slug || slugify(title)
  const finalChapter: Chapter = { ...chapter, slug: finalSlug, title }
  setSaving(true)
  try { await upsertChapterRemote(book.slug, existingChapter?.slug, finalChapter, book); navigate(`/admin/books/${book.slug}`) }
  catch { setSaving(false); window.alert('Could not save to Firestore — check your connection or Firestore rules for the "books" collection.') }
 }

 const setBlocks = (blocks: ContentBlock[]) => setChapter({ ...chapter, blocks })

 return <div className="admin-page">
  <header className="admin-header"><div><Link className="text-link" to={`/admin/books/${book.slug}`}><ArrowLeft size={14}/> {book.title}</Link><h1>{isNew ? 'New chapter' : chapter.title || 'Untitled chapter'}</h1></div><button className="button primary" onClick={save} disabled={saving}><Save/> {saving ? 'Saving…' : 'Save chapter'}</button></header>

  <div className="admin-form-grid lesson-grid">
   <section className="admin-panel">
    <h2>Chapter details</h2>
    <label>Title<input value={chapter.title} onChange={(event) => setField('title', event.target.value)} placeholder="e.g. The first quiet hour"/></label>
    <label>URL slug<input value={chapter.slug} onChange={(event) => { setSlugTouched(true); setField('slug', slugify(event.target.value)) }} placeholder="the-first-quiet-hour"/></label>
    <div className="field-row">
     <label>Reading time<input value={chapter.duration} onChange={(event) => setField('duration', event.target.value)} placeholder="8 min"/></label>
     <label>IQ reward<input type="number" min={5} step={5} value={chapter.xp} onChange={(event) => setField('xp', Number(event.target.value))}/></label>
    </div>
    <label>Eyebrow label<input value={chapter.eyebrow} onChange={(event) => setField('eyebrow', event.target.value)} placeholder="Chapter one"/></label>
    <label>Lead paragraph<textarea value={chapter.lead} onChange={(event) => setField('lead', event.target.value)} rows={3} placeholder="One or two sentences under the title."/></label>
    <label>Chapter thumbnail (image URL)<input value={chapter.thumbnail ?? ''} onChange={(event) => setField('thumbnail', event.target.value)} placeholder="https://images.example.com/chapter-hero.jpg"/></label>
    <div className={`thumb-preview thumb-preview-wide ${chapter.thumbnail ? '' : 'thumb-preview-empty'}`}>{chapter.thumbnail ? <img src={chapter.thumbnail} alt=""/> : <span>No image set.</span>}</div>
   </section>

   <section className="admin-panel">
    <h2>Content blocks</h2>
    <p className="admin-hint-line">Add a heading first, then paragraphs, images, or callouts in reading order.</p>
    <BlockEditor blocks={chapter.blocks ?? []} onChange={setBlocks}/>
   </section>

   <section className="admin-panel lesson-live-preview">
    <h2>Live preview</h2>
    <div className="lesson-article preview-frame"><span className="lesson-eyebrow">{chapter.eyebrow || book.title}</span><h1>{chapter.title || 'Untitled chapter'}</h1><p className="lesson-lead">{chapter.lead}</p>{chapter.blocks && chapter.blocks.length > 0 ? <RenderBlocks blocks={chapter.blocks}/> : <p className="admin-empty">No blocks yet.</p>}</div>
   </section>
  </div>
 </div>
}
