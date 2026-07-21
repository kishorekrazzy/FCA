import { useEffect, useMemo, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useCommunityStore, type Post } from '../store/community-store'

export const timeAgo = (timestamp: number) => {
 const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000))
 if (minutes < 60) return `${minutes}m`
 const hours = Math.round(minutes / 60)
 if (hours < 24) return `${hours}h`
 return `${Math.round(hours / 24)}d`
}

/** Live community feed: Firestore posts merged with any locally-queued posts that
 * failed to sync (see Community.tsx's publish fallback). Shared so any page — the
 * feed itself, the dashboard's saved-posts widget — reads the same merged list. */
export function useAllPosts(): { posts: Post[]; remoteIds: Set<string>; connected: boolean } {
 const local = useCommunityStore((state) => state.posts)
 const [remote, setRemote] = useState<Post[] | null>(null)

 useEffect(() => {
  try {
   const feed = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100))
   return onSnapshot(feed, (snapshot) => {
    setRemote(snapshot.docs.map((item) => { const data = item.data(); return { ...data, id: item.id, createdAt: data.createdAt?.toMillis?.() ?? Date.now(), liked: false } as Post }))
   }, () => setRemote(null))
  } catch { setRemote(null); return undefined }
 }, [])

 const remoteIds = useMemo(() => new Set((remote ?? []).map((post) => post.id)), [remote])
 const posts = useMemo(() => {
  const map = new Map<string, Post>()
  for (const post of local) map.set(post.id, post)
  for (const post of remote ?? []) map.set(post.id, post)
  return [...map.values()]
 }, [local, remote])

 return { posts, remoteIds, connected: remote !== null }
}
