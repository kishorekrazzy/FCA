import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAllBooksAdmin, useBookCatalogStore, deleteBookRemote, setBookOrderRemote, upsertBookFields, upsertBookRemote } from '../../store/book-store'
import { JsonImport } from '../../components/admin/JsonImport'
import { BOOK_JSON_TEMPLATE } from '../../data/json-templates'
import { emptyBook } from '../../types'
import type { Book } from '../../types'

export function AdminBooks() {
 const books = useAllBooksAdmin()
 const bookOrder = useBookCatalogStore((state) => state.bookOrder)
 const online = useBookCatalogStore((state) => state.online)

 useEffect(() => { if (!bookOrder.length && books.length) setBookOrderRemote(books.map((book) => book.slug)).catch(() => {}) }, [bookOrder.length, books])

 const moveBook = (slug: string, dir: -1 | 1) => {
  const order = bookOrder.length ? [...bookOrder] : books.map((book) => book.slug)
  const index = order.indexOf(slug)
  const target = index + dir
  if (index === -1 || target < 0 || target >= order.length) return
  ;[order[index], order[target]] = [order[target], order[index]]
  setBookOrderRemote(order).catch(() => window.alert('Could not save order — check Firestore rules.'))
 }
 const remove = (slug: string) => { if (!window.confirm('Delete this book? This cannot be undone.')) return; deleteBookRemote(slug).catch(() => window.alert('Could not delete — check Firestore rules.')) }
 const togglePublish = (book: Book) => upsertBookFields(book.slug, { status: book.status === 'draft' ? 'published' : 'draft' }, book).catch(() => window.alert('Could not save — check Firestore rules.'))

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Content</span><h1>Books</h1><p>Create, order, and publish books — short IQ-only reads with no exam or certificate.</p></div><div className="admin-header-actions"><JsonImport noun="book" template={BOOK_JSON_TEMPLATE} emptyItem={emptyBook} upsertItem={upsertBookRemote}/><Link className="button primary" to="/admin/books/new"><Plus/> New book</Link></div></header>
  {!online && <p className="admin-banner">Firestore isn't reachable right now — edits here won't save. Check your connection or Firestore rules for the <code>books</code> collection.</p>}
  <div className="admin-panel">
   <table className="admin-table wide"><thead><tr><th/><th>Cover</th><th>Book</th><th>Status</th><th>Chapters</th><th>Category</th><th>Difficulty</th><th/></tr></thead><tbody>{books.map((book, index) => <tr key={book.slug}>
    <td className="admin-order"><button onClick={() => moveBook(book.slug, -1)} disabled={index === 0} aria-label="Move up"><ChevronUp/></button><button onClick={() => moveBook(book.slug, 1)} disabled={index === books.length - 1} aria-label="Move down"><ChevronDown/></button></td>
    <td><div className="admin-thumb">{book.thumbnail ? <img src={book.thumbnail} alt=""/> : <div className="admin-thumb-fallback" style={{ background: `linear-gradient(140deg, ${book.color}, #12121a)` }}/>}</div></td>
    <td><span className="admin-course-title">{book.title || <i>Untitled</i>}</span><small>/books/{book.slug || '—'}</small></td>
    <td><button className={`status-pill ${book.status === 'draft' ? 'draft' : 'live'}`} onClick={() => togglePublish(book)}>{book.status === 'draft' ? 'Draft' : 'Published'}</button></td>
    <td><Layers size={13}/> {book.chapters.length}</td>
    <td>{book.category}</td>
    <td>{book.difficulty}</td>
    <td className="admin-row-actions"><Link to={`/admin/books/${book.slug}`} aria-label="Edit book"><Pencil/></Link><button onClick={() => remove(book.slug)} aria-label="Delete book"><Trash2/></button></td>
   </tr>)}</tbody></table>
   {!books.length && <p className="admin-empty">No books yet — create your first one.</p>}
  </div>
 </div>
}
