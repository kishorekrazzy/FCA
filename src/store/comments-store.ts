import { useEffect, useState } from 'react'
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Comment = {
  id: string
  postId: string
  uid?: string | null
  name: string
  photo?: string | null
  text: string
  createdAt: number
}

export async function addComment(postId: string, uid: string | null, name: string, photo: string | null, text: string) {
  const trimmed = text.trim()
  if (!trimmed) return
  await addDoc(collection(db, 'comments'), { postId, uid, name, photo, text: trimmed, createdAt: serverTimestamp() })
}

/** Live comments for one post. Filtered by a single equality clause only (no orderBy in the
 * query itself) so this never needs a Firestore composite index — sorted client-side instead. */
export function useComments(postId: string | null): Comment[] {
 const [comments, setComments] = useState<Comment[]>([])
 useEffect(() => {
  if (!postId) { setComments([]); return }
  try {
   const q = query(collection(db, 'comments'), where('postId', '==', postId))
   return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((item) => { const data = item.data(); return { ...data, id: item.id, createdAt: data.createdAt?.toMillis?.() ?? Date.now() } as Comment })
    setComments(items.sort((a, b) => a.createdAt - b.createdAt))
   }, () => setComments([]))
  } catch { setComments([]); return undefined }
 }, [postId])
 return comments
}
