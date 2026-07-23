import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ConfettiBurst, ScrollProgress } from '../components/fx'
import { RenderBlocks } from '../components/admin/BlockRenderer'
import { useAcademyStore } from '../store/academy-store'
import { useBookBySlug } from '../store/book-store'

export function Chapter() {
 const { bookSlug, chapterSlug } = useParams()
 const book = useBookBySlug(bookSlug)
 const completedChapters = useAcademyStore((state) => state.completedChapters)
 const completeChapter = useAcademyStore((state) => state.completeChapter)
 const [toast, setToast] = useState(false)
 const [confetti, setConfetti] = useState(0)

 if (!book) return <main className="page not-found"><h1>Book not found.</h1></main>
 const index = book.chapters.findIndex((item) => item.slug === chapterSlug)
 const chapter = book.chapters[index] ?? book.chapters[0]
 if (!chapter) return <main className="page not-found"><h1>This book has no chapters yet.</h1></main>
 const next = book.chapters[index + 1]
 const prev = book.chapters[index - 1]
 const done = completedChapters.includes(chapter.slug)

 const markComplete = () => {
  if (done) return
  completeChapter(chapter.slug, chapter.xp)
  setToast(true); setConfetti(Date.now())
  window.setTimeout(() => setToast(false), 3600)
  window.setTimeout(() => setConfetti(0), 3200)
 }

 return <>
  <main className="chapter-shell">
   <ScrollProgress/>
   <article className="lesson-article chapter-article">
    <div className="lesson-tools"><Link className="tool-pill" to={`/books/${book.slug}`} aria-label="Back to book"><ArrowLeft/></Link><span className="lesson-read">Chapter {index + 1} of {book.chapters.length}</span><span className="lesson-xp"><img className="mini-icon" src="/icon-xp.svg" alt=""/> +{chapter.xp} IQ</span></div>
    <span className="lesson-eyebrow">{chapter.eyebrow || book.title}</span>
    <h1>{chapter.title}</h1>
    <p className="lesson-lead">{chapter.lead}</p>
    {chapter.blocks && chapter.blocks.length > 0 ? <RenderBlocks blocks={chapter.blocks}/> : <p className="admin-empty">This chapter has no content yet.</p>}
    <nav className="lesson-next">
     {prev ? <Link className="button ghost" to={`/books/${book.slug}/${prev.slug}`}><ArrowLeft/> Previous chapter</Link> : <span/>}
     {next ? <Link className="button ghost" to={`/books/${book.slug}/${next.slug}`}>Next chapter <ArrowRight/></Link> : <Link className="button ghost" to={`/books/${book.slug}`}>Back to book <ArrowRight/></Link>}
    </nav>
   </article>
  </main>
  <div className="quick-actions"><span>Quick actions</span><button aria-label="Mark chapter read" className={done ? 'active' : ''} onClick={markComplete}><CheckCircle2/></button></div>
  <ConfettiBurst trigger={confetti}/>{toast && <div className="xp-toast"><b>Chapter read!</b><span className="toast-xp"><img className="mini-icon" src="/icon-xp.svg" alt=""/> +{chapter.xp} IQ</span></div>}
 </>
}
