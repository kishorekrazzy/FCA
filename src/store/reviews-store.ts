import { create } from 'zustand'
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Review = {
  id: string
  courseSlug: string
  uid: string
  name: string
  photoURL?: string | null
  rating: number
  text: string
  createdAt: number
}

type ReviewsState = { reviews: Review[]; synced: boolean }

export const useReviewsStore = create<ReviewsState>(() => ({ reviews: [], synced: false }))

let started = false
export function initReviewsSync() {
  if (started) return
  started = true
  try {
    onSnapshot(collection(db, 'reviews'), (snapshot) => {
      useReviewsStore.setState({
        reviews: snapshot.docs.map((item) => { const data = item.data(); return { ...data, id: item.id, createdAt: data.createdAt?.toMillis?.() ?? Date.now() } as Review }),
        synced: true,
      })
    }, () => useReviewsStore.setState({ synced: true }))
  } catch { useReviewsStore.setState({ synced: true }) }
}

export async function submitReview(courseSlug: string, uid: string, name: string, photoURL: string | null | undefined, rating: number, text: string) {
  await setDoc(doc(db, 'reviews', `${uid}_${courseSlug}`), { courseSlug, uid, name, photoURL: photoURL ?? null, rating, text, createdAt: serverTimestamp() })
}

export function courseRating(reviews: Review[], courseSlug: string) {
  const forCourse = reviews.filter((review) => review.courseSlug === courseSlug)
  if (!forCourse.length) return { avg: 0, count: 0 }
  return { avg: forCourse.reduce((sum, review) => sum + review.rating, 0) / forCourse.length, count: forCourse.length }
}
