import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export type RemoteUser = {
 id: string
 displayName?: string
 email?: string
 photoURL?: string
 completed?: string[]
 enrolled?: string[]
 xp?: number
 streak?: number
 lastActive?: string
 joinedAt?: number
 publicId?: string
 leaderboardVisible?: boolean
}

export type RemotePost = {
 id: string
 name: string
 handle: string
 text: string
 image?: string | null
 likes: number
 replies: number
 createdAt: number
}

export function useRemoteUsers() {
 const [users, setUsers] = useState<RemoteUser[] | null>(null)
 const [error, setError] = useState(false)
 useEffect(() => {
  try {
   return onSnapshot(collection(db, 'users'), (snapshot) => {
    setUsers(snapshot.docs.map((item) => { const data = item.data(); return { ...data, id: item.id, joinedAt: data.joinedAt?.toMillis?.() ?? undefined } as RemoteUser }))
   }, () => setError(true))
  } catch { setError(true); return undefined }
 }, [])
 return { users, error }
}

export function useRemotePosts() {
 const [posts, setPosts] = useState<RemotePost[] | null>(null)
 const [error, setError] = useState(false)
 useEffect(() => {
  try {
   return onSnapshot(collection(db, 'posts'), (snapshot) => {
    setPosts(snapshot.docs.map((item) => { const data = item.data(); return { ...data, id: item.id, createdAt: data.createdAt?.toMillis?.() ?? Date.now() } as RemotePost }))
   }, () => setError(true))
  } catch { setError(true); return undefined }
 }, [])
 return { posts, error }
}
