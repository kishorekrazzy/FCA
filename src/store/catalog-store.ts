import { create } from 'zustand'
import { arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Course, Lesson } from '../types'

// Firestore rejects arrays nested directly inside arrays (e.g. a table's string[][] rows),
// so table rows are wrapped as { cells: string[] }[] for storage and unwrapped on read.
const encodeLesson = (lesson: Lesson): unknown => lesson.table
  ? { ...lesson, table: { ...lesson.table, rows: lesson.table.rows.map((row) => ({ cells: row })) } }
  : lesson
const decodeLesson = (lesson: any): Lesson => lesson?.table
  ? { ...lesson, table: { ...lesson.table, rows: (lesson.table.rows ?? []).map((row: any) => Array.isArray(row) ? row : (row.cells ?? [])) } }
  : lesson

const encodeCourse = (course: Course) => ({ ...course, modules: course.modules.map((module) => ({ ...module, lessons: module.lessons.map(encodeLesson) })) })
const decodeCourse = (data: any): Course => ({ ...data, modules: (data.modules ?? []).map((module: any) => ({ ...module, lessons: (module.lessons ?? []).map(decodeLesson) })) })

type CatalogState = {
  remoteCourses: Course[]
  hiddenSeeds: string[]
  courseOrder: string[]
  synced: boolean
  online: boolean
}

export const useCatalogStore = create<CatalogState>(() => ({
  remoteCourses: [],
  hiddenSeeds: [],
  courseOrder: [],
  synced: false,
  online: true,
}))

let started = false
export function initCatalogSync() {
  if (started) return
  started = true
  try {
    onSnapshot(collection(db, 'courses'), (snapshot) => {
      useCatalogStore.setState({ remoteCourses: snapshot.docs.map((item) => decodeCourse(item.data())), synced: true, online: true })
    }, () => useCatalogStore.setState({ synced: true, online: false }))
    onSnapshot(doc(db, 'settings', 'catalog'), (snapshot) => {
      const data = snapshot.data()
      useCatalogStore.setState({ hiddenSeeds: data?.hiddenSeeds ?? [], courseOrder: data?.courseOrder ?? [] })
    }, () => {})
  } catch {
    useCatalogStore.setState({ synced: true, online: false })
  }
}

// Every write below re-fetches the document immediately before merging, rather than trusting
// the locally-cached course. Two saves fired seconds apart (e.g. editing course details, then
// immediately editing a lesson) can otherwise race: the second save's local snapshot may predate
// the first save's echo, silently reverting it. Fetching fresh right before each write closes
// that window. `fallback` is only used the very first time a course is saved (no remote doc yet).
async function fetchCourseRemote(slug: string): Promise<Course | null> {
  const snap = await getDoc(doc(db, 'courses', slug))
  return snap.exists() ? decodeCourse(snap.data()) : null
}

export async function upsertCourseRemote(course: Course) {
  await setDoc(doc(db, 'courses', course.slug), encodeCourse({ ...course, updatedAt: Date.now() }))
}

export async function upsertCourseFields(slug: string, patch: Partial<Course>, fallback: Course) {
  const base = (await fetchCourseRemote(slug)) ?? fallback
  await setDoc(doc(db, 'courses', slug), encodeCourse({ ...base, ...patch, slug, updatedAt: Date.now() }))
}

export async function upsertLessonRemote(courseSlug: string, moduleIndex: number, existingLessonSlug: string | undefined, lesson: Lesson, fallback: Course) {
  const base = (await fetchCourseRemote(courseSlug)) ?? fallback
  const targetModule = base.modules[moduleIndex]
  if (!targetModule) throw new Error('Module not found')
  const lessons = [...targetModule.lessons]
  const existingIndex = lessons.findIndex((item) => item.slug === (existingLessonSlug ?? '__none__'))
  if (existingIndex >= 0) lessons[existingIndex] = lesson
  else lessons.push(lesson)
  const modules = base.modules.map((module, index) => index === moduleIndex ? { ...module, lessons } : module)
  await setDoc(doc(db, 'courses', courseSlug), encodeCourse({ ...base, modules, updatedAt: Date.now() }))
}

export async function deleteCourseRemote(slug: string, isSeed: boolean) {
  if (isSeed) await setDoc(doc(db, 'settings', 'catalog'), { hiddenSeeds: arrayUnion(slug) }, { merge: true })
  else await deleteDoc(doc(db, 'courses', slug))
}

export async function setCourseOrderRemote(order: string[]) {
  await setDoc(doc(db, 'settings', 'catalog'), { courseOrder: order }, { merge: true })
}
