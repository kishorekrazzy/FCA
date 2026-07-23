import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Reveal } from '../components/fx'
import { useAcademyStore } from '../store/academy-store'
import { useBooks } from '../store/book-store'
import type { Book } from '../types'

const EASE = [0.22, 1, 0.36, 1] as const

function BookCard({ book }: { book: Book }) {
 const progress = useAcademyStore((state) => state.bookProgress(book.slug))
 return <Link to={`/books/${book.slug}`} className="book-card" style={{ '--book-color': book.color } as React.CSSProperties}>
  <motion.span className="book-cover" whileHover={{ rotateY: -8, y: -6 }} style={{ transformPerspective: 900 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>{book.thumbnail ? <img src={book.thumbnail} alt="" loading="lazy"/> : <span className="book-cover-generated"><BookOpen size={26}/><em>{book.category}</em></span>}<span className="book-spine"/></motion.span>
  <div className="book-card-body">
   <span className="book-card-category">{book.category}</span>
   <h3>{book.title}</h3>
   <p>{book.tagline ?? book.subtitle}</p>
   {progress > 0 && <div className="book-card-progress"><span style={{ width: `${progress}%` }}/></div>}
  </div>
 </Link>
}

export function Books() {
 const books = useBooks()
 const [query, setQuery] = useState('')
 const visible = useMemo(() => books.filter((book) => `${book.title} ${book.description} ${book.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [books, query])

 return <main className="books-page page">
  <div className="books-top">
   <Reveal><span className="kicker"><BookOpen size={13}/> The library</span><h1>Stories worth <em>finishing.</em></h1><p>Short reads for curious minds — no exams, no certificates, just IQ and a good excuse to keep reading.</p></Reveal>
  </div>
  <Reveal delay={80}><label className="books-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, topics, ideas"/></label></Reveal>
  <div className="book-shelf"><AnimatePresence>{visible.map((book, index) => <motion.div layout key={book.slug} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: EASE, delay: Math.min(index, 8) * 0.05 }}><BookCard book={book}/></motion.div>)}</AnimatePresence></div>
  {!visible.length && <div className="empty"><BookOpen size={22}/><strong>No signal found.</strong><p>Try a different search — or check back soon, the shelf is always growing.</p></div>}
 </main>
}
