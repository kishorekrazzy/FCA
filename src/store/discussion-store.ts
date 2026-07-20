import { useEffect, useState } from 'react'
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type ThreadKind = 'comment' | 'discussion'

export type LessonThread = {
  id: string
  lessonSlug: string
  kind: ThreadKind
  uid?: string | null
  name: string
  photo?: string | null
  text: string
  createdAt: number
}

export async function addLessonThread(lessonSlug: string, kind: ThreadKind, uid: string | null, name: string, photo: string | null, text: string) {
  const trimmed = text.trim()
  if (!trimmed) return
  await addDoc(collection(db, 'lesson_threads'), { lessonSlug, kind, uid, name, photo, text: trimmed, createdAt: serverTimestamp() })
}

/** Live comments + discussion for one lesson. Filtered by a single equality clause (no orderBy
 * in the query itself) so this never needs a Firestore composite index — split by kind and
 * sorted client-side instead. */
export function useLessonThreads(lessonSlug: string | null): { comments: LessonThread[]; discussion: LessonThread[] } {
 const [threads, setThreads] = useState<LessonThread[]>([])
 useEffect(() => {
  if (!lessonSlug) { setThreads([]); return }
  try {
   const q = query(collection(db, 'lesson_threads'), where('lessonSlug', '==', lessonSlug))
   return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((item) => { const data = item.data(); return { ...data, id: item.id, createdAt: data.createdAt?.toMillis?.() ?? Date.now() } as LessonThread })
    setThreads(items.sort((a, b) => a.createdAt - b.createdAt))
   }, () => setThreads([]))
  } catch { setThreads([]); return undefined }
 }, [lessonSlug])
 return { comments: threads.filter((item) => item.kind === 'comment'), discussion: threads.filter((item) => item.kind === 'discussion') }
}
