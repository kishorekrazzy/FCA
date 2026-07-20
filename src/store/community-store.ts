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

const hoursAgo = (hours: number) => Date.now() - hours * 3600000
const img = (seed: string) => `https://picsum.photos/seed/${seed}/540/540`

export const seedPosts: Post[] = [
  { id: 'seed-1', name: 'Mara Okafor', handle: 'mara.makes', color: '#6871FA', image: img('fca-loops'), text: 'Finished the feedback-loop lesson in Systems Thinking and immediately spotted three loops in my own studio workflow. This course is quietly rewiring how I see everything.', createdAt: hoursAgo(2), likes: 48, liked: false, replies: 6 },
  { id: 'seed-2', name: 'Dev Patel', handle: 'devbuilds', color: '#FFD86B', image: img('fca-prototype'), text: 'Hot take after Prototype Lab: most "MVPs" are just small products, not experiments. The smallest true test lesson should be required reading for every founder.', createdAt: hoursAgo(7), likes: 121, liked: false, replies: 19 },
  { id: 'seed-3', name: 'Lina Torres', handle: 'linadraws', color: '#A993F8', image: img('fca-streak'), text: 'Day 6 streak 🔥 — the drills feel like a game but I caught myself using the naming system from class in real client work today. That is the whole point, I guess.', createdAt: hoursAgo(11), likes: 64, liked: false, replies: 4 },
  { id: 'seed-4', name: 'Jonas Weber', handle: 'jonasw', color: '#5952F4', image: img('fca-interview'), text: 'Request for the FCA team: a course on interviewing users without leading them. Research Rituals touches it, but I would take a whole track on this.', createdAt: hoursAgo(26), likes: 33, liked: false, replies: 11 },
  { id: 'seed-5', name: 'Amelie Chen', handle: 'ameliestudies', color: '#CDC6FB', image: img('fca-certificate'), text: 'Printed my first FCA certificate today. Small thing, but seeing the verification page actually work made it feel real. On to Creative Direction next.', createdAt: hoursAgo(49), likes: 89, liked: false, replies: 8 },
  { id: 'seed-6', name: 'Sofia Marino', handle: 'sofiamakes', color: '#FFD86B', image: img('fca-desk'), text: 'Unpopular opinion: the lesson tables are the best part of the courses. "Follow the handoffs" is taped above my desk now. Every stage gets something more useful than an idea.', createdAt: hoursAgo(4), likes: 57, liked: false, replies: 9 },
  { id: 'seed-7', name: 'Kwame Mensah', handle: 'kwame.builds', color: '#6871FA', image: img('fca-grant'), text: 'Week 2 of the Maker Grant application grind. Whoever wrote "show us a fragment — imperfect is welcome" thank you. Shipped my messy prototype video instead of polishing forever.', createdAt: hoursAgo(15), likes: 142, liked: false, replies: 23 },
  { id: 'seed-8', name: 'Yuki Tanaka', handle: 'yukilearns', color: '#A993F8', image: img('fca-whiteboard'), text: 'Tried teaching my team the leverage-point idea from Systems Thinking in our Monday retro. 20-minute lesson turned into a 2-hour whiteboard session. Best retro we have had all year.', createdAt: hoursAgo(20), likes: 76, liked: false, replies: 14 },
  { id: 'seed-9', name: 'Priya Sharma', handle: 'priyathinks', color: '#5952F4', image: img('fca-nightread'), text: 'The reader mode in lessons is so underrated. Phone on do-not-disturb, reader mode on, 15 minutes before bed. That is the whole ritual.', createdAt: hoursAgo(33), likes: 51, liked: false, replies: 3 },
  { id: 'seed-10', name: 'Tom Eriksen', handle: 'tombuilds', color: '#FFD86B', image: img('fca-drill'), text: 'Failed the drill three times before it clicked. Then realized failing the drill IS the lesson. You cannot skim your way to reflex.', createdAt: hoursAgo(41), likes: 98, liked: false, replies: 12 },
  { id: 'seed-11', name: 'Nadia Haddad', handle: 'nadia.h', color: '#CDC6FB', image: img('fca-newcomer'), text: 'New here 👋 — came for the Maker Grant, staying for the community. What course should I start with if my background is graphic design?', createdAt: hoursAgo(55), likes: 27, liked: false, replies: 16 },
  { id: 'seed-12', name: 'FCA Studio', handle: 'fca.academy', color: '#2B15A3', image: img('fca-studio'), text: 'Heads up, makers: a new track on interviewing users without leading them is in the works — built from your requests in this very feed. Keep them coming. ✦', createdAt: hoursAgo(60), likes: 210, liked: false, replies: 31 },
]

type CommunityState = {
  posts: Post[]
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'liked' | 'replies'>) => void
  toggleLike: (id: string) => void
}

const isPost = (value: unknown): value is Post => !!value && typeof (value as Post).text === 'string' && typeof (value as Post).id === 'string'

export const useCommunityStore = create<CommunityState>()(persist((set) => ({
  posts: seedPosts,
  addPost: (post) => set((state) => ({ posts: [{ ...post, id: `post-${Date.now()}`, createdAt: Date.now(), likes: 0, liked: false, replies: 0 }, ...state.posts] })),
  toggleLike: (id) => set((state) => ({ posts: state.posts.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post) })),
}), {
  name: 'fca-community',
  version: 2,
  migrate: (persisted) => persisted as CommunityState,
  merge: (persisted, current) => {
    const stored = Array.isArray((persisted as CommunityState | undefined)?.posts) ? (persisted as CommunityState).posts.filter(isPost) : []
    const storedSeeds = new Map(stored.filter((post) => post.id.startsWith('seed-')).map((post) => [post.id, post]))
    const seeds = seedPosts.map((seed) => storedSeeds.get(seed.id) ?? seed)
    const userPosts = stored.filter((post) => !post.id.startsWith('seed-'))
    return { ...current, posts: [...userPosts, ...seeds].sort((a, b) => b.createdAt - a.createdAt) }
  },
}))
