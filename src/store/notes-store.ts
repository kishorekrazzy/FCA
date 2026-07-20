import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

const noteId = (uid: string, lessonSlug: string) => `${uid}_${lessonSlug}`

export async function fetchNote(uid: string, lessonSlug: string): Promise<string> {
  const snap = await getDoc(doc(db, 'notes', noteId(uid, lessonSlug)))
  return snap.exists() ? (snap.data().text as string) ?? '' : ''
}

export async function saveNote(uid: string, lessonSlug: string, courseSlug: string, text: string) {
  await setDoc(doc(db, 'notes', noteId(uid, lessonSlug)), { uid, lessonSlug, courseSlug, text, updatedAt: Date.now() })
}
