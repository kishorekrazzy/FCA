import { create } from 'zustand'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type LearningPath = {
  id: string
  title: string
  description: string
  icon: string
  courseSlugs: string[]
  order: number
}

type PathsState = { paths: LearningPath[] }

export const usePathsStore = create<PathsState>(() => ({ paths: [] }))

let started = false
export function initPathsSync() {
  if (started) return
  started = true
  try {
    onSnapshot(collection(db, 'paths'), (snapshot) => {
      usePathsStore.setState({ paths: snapshot.docs.map((item) => ({ ...(item.data() as Omit<LearningPath, 'id'>), id: item.id })) })
    }, () => {})
  } catch { /* offline — dashboard just shows no paths */ }
}

export function usePaths(): LearningPath[] {
  const paths = usePathsStore((state) => state.paths)
  return [...paths].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function upsertPath(path: LearningPath) {
  await setDoc(doc(db, 'paths', path.id), path)
}

export async function deletePath(id: string) {
  await deleteDoc(doc(db, 'paths', id))
}

export const emptyPath = (): LearningPath => ({ id: crypto.randomUUID(), title: '', description: '', icon: '◈', courseSlugs: [], order: Date.now() })
