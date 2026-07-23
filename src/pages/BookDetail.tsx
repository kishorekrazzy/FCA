import { ArrowRight, BarChart3, BookOpen, Check, Clock, Layers } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Reveal } from '../components/fx'
import { useAcademyStore } from '../store/academy-store'
import { useBookBySlug } from '../store/book-store'

export function BookDetail() {
 const { bookSlug } = useParams()
 const book = useBookBySlug(bookSlug)
 const completedChapters = useAcademyStore((state) => state.completedChapters)
 const progress = useAcademyStore((state) => book ? state.bookProgress(book.slug) : 0)

 if (!book) return <main className="page not-found"><h1>That book isn't on the shelf.</h1><Link className="button primary" to="/books">Back to the library</Link></main>

 const firstUnread = book.chapters.find((chapter) => !completedChapters.includes(chapter.slug)) ?? book.chapters[0]

 return <main className="book-detail-page">
  <div className="book-detail-frame">
   <div className="breadcrumbs"><Link to="/books">Library</Link> <span>/</span> {book.title}</div>

   <Reveal><section className="book-hero" style={{ '--book-color': book.color } as React.CSSProperties}>
    <span className="book-hero-cover">{book.thumbnail ? <img src={book.thumbnail} alt="" loading="lazy"/> : <span className="book-cover-generated large"><BookOpen size={36}/></span>}</span>
    <div className="book-hero-copy">
     <span className="kicker">{book.category}</span>
     <h1>{book.title}</h1>
     <p>{book.subtitle}</p>
     <div className="chip-row"><span className="chip"><BarChart3 size={13}/>{book.difficulty}</span><span className="chip"><Layers size={13}/>{book.chapters.length} {book.chapters.length === 1 ? 'chapter' : 'chapters'}</span><span className="chip"><Clock size={13}/>{book.duration}</span></div>
     {progress > 0 && <div className="book-progress-row"><div className="book-progress-bar"><span style={{ width: `${progress}%` }}/></div><small>{progress}% read</small></div>}
     {!!book.chapters.length && <Link className="button primary" to={`/books/${book.slug}/${firstUnread.slug}`}>{progress > 0 ? 'Continue reading' : 'Start reading'} <ArrowRight size={15}/></Link>}
    </div>
   </section></Reveal>

   <Reveal delay={80}><section className="book-chapters">
    <h2>Chapters</h2>
    {!book.chapters.length && <p className="admin-empty">No chapters published yet — check back soon.</p>}
    <div className="chapter-list">{book.chapters.map((chapter, index) => { const done = completedChapters.includes(chapter.slug)
     return <Link key={chapter.slug} to={`/books/${book.slug}/${chapter.slug}`} className={`chapter-row ${done ? 'done' : ''}`}>
      <span className="chapter-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="chapter-copy"><strong>{chapter.title}</strong><small>{chapter.duration} · +{chapter.xp} IQ</small></span>
      <span className={`chapter-state ${done ? 'done' : ''}`}>{done ? <Check size={15}/> : <ArrowRight size={15}/>}</span>
     </Link> })}</div>
   </section></Reveal>

   {!!book.skills.length && <Reveal delay={140}><section className="book-skills"><h2>What you'll take away</h2><div className="chip-row">{book.skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div></section></Reveal>}
  </div>
 </main>
}
