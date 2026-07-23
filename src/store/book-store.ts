import { create } from 'zustand'
import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Book, Chapter } from '../types'

type BookCatalogState = {
  books: Book[]
  bookOrder: string[]
  synced: boolean
  online: boolean
}

export const useBookCatalogStore = create<BookCatalogState>(() => ({
  books: [],
  bookOrder: [],
  synced: false,
  online: true,
}))

let started = false
export function initBooksSync() {
  if (started) return
  started = true
  try {
    onSnapshot(collection(db, 'books'), (snapshot) => {
      useBookCatalogStore.setState({ books: snapshot.docs.map((item) => item.data() as Book), synced: true, online: true })
    }, () => useBookCatalogStore.setState({ synced: true, online: false }))
    onSnapshot(doc(db, 'settings', 'bookCatalog'), (snapshot) => {
      useBookCatalogStore.setState({ bookOrder: snapshot.data()?.bookOrder ?? [] })
    }, () => {})
  } catch {
    useBookCatalogStore.setState({ synced: true, online: false })
  }
}

const ranked = (books: Book[], order: string[]) => [...books].sort((a, b) => {
  const rankA = order.indexOf(a.slug), rankB = order.indexOf(b.slug)
  return (rankA === -1 ? 999 : rankA) - (rankB === -1 ? 999 : rankB)
})

export function useBooks(): Book[] {
  const { books, bookOrder } = useBookCatalogStore()
  return ranked(books.filter((book) => book.status !== 'draft'), bookOrder)
}

export function useAllBooksAdmin(): Book[] {
  const { books, bookOrder } = useBookCatalogStore()
  return ranked(books, bookOrder)
}

export function useBookBySlug(slug?: string, admin = false): Book | undefined {
  const books = useBookCatalogStore((state) => state.books)
  const book = books.find((item) => item.slug === slug)
  if (!book) return undefined
  if (!admin && book.status === 'draft') return undefined
  return book
}

export function useBooksSynced(): boolean {
  return useBookCatalogStore((state) => state.synced)
}

export function getPublishedBooks(): Book[] {
  return useBookCatalogStore.getState().books.filter((book) => book.status !== 'draft')
}

async function fetchBookRemote(slug: string): Promise<Book | null> {
  const snap = await getDoc(doc(db, 'books', slug))
  return snap.exists() ? (snap.data() as Book) : null
}

export async function upsertBookFields(slug: string, patch: Partial<Book>, fallback: Book) {
  const base = (await fetchBookRemote(slug)) ?? fallback
  await setDoc(doc(db, 'books', slug), { ...base, ...patch, slug, updatedAt: Date.now() })
}

export async function upsertBookRemote(book: Book) {
  await setDoc(doc(db, 'books', book.slug), { ...book, updatedAt: Date.now() })
}

export async function upsertChapterRemote(bookSlug: string, existingChapterSlug: string | undefined, chapter: Chapter, fallback: Book) {
  const base = (await fetchBookRemote(bookSlug)) ?? fallback
  const chapters = [...base.chapters]
  const existingIndex = chapters.findIndex((item) => item.slug === (existingChapterSlug ?? '__none__'))
  if (existingIndex >= 0) chapters[existingIndex] = chapter
  else chapters.push(chapter)
  await setDoc(doc(db, 'books', bookSlug), { ...base, chapters, updatedAt: Date.now() })
}

export async function deleteBookRemote(slug: string) {
  await deleteDoc(doc(db, 'books', slug))
}

export async function setBookOrderRemote(order: string[]) {
  await setDoc(doc(db, 'settings', 'bookCatalog'), { bookOrder: order }, { merge: true })
}
