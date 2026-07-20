import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Post = {
  id: string
  uid?: string | null
  name: string
  handle: string
  photo?: string | null
  image?: string | null
  color: string
  text: string
  courseSlug?: string | null
  courseTitle?: string | null
  createdAt: number
  likes: number
  liked: boolean
  replies: number
}

type CommunityState = {
  posts: Post[]
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'liked' | 'replies'>) => void
  toggleLike: (id: string) => void
}

const isPost = (value: unknown): value is Post => !!value && typeof (value as Post).text === 'string' && typeof (value as Post).id === 'string'

export const useCommunityStore = create<CommunityState>()(persist((set) => ({
  posts: [],
  addPost: (post) => set((state) => ({ posts: [{ ...post, id: `post-${Date.now()}`, createdAt: Date.now(), likes: 0, liked: false, replies: 0 }, ...state.posts] })),
  toggleLike: (id) => set((state) => ({ posts: state.posts.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post) })),
}), {
  name: 'fca-community',
  version: 3,
  migrate: (persisted) => persisted as CommunityState,
  // v3 drops the old hardcoded seed posts entirely — any "seed-*" ids left over from a
  // previous version's localStorage are filtered out here so they don't resurface.
  merge: (persisted, current) => {
    const stored = Array.isArray((persisted as CommunityState | undefined)?.posts) ? (persisted as CommunityState).posts.filter(isPost) : []
    const userPosts = stored.filter((post) => !post.id.startsWith('seed-'))
    return { ...current, posts: userPosts.sort((a, b) => b.createdAt - a.createdAt) }
  },
}))
