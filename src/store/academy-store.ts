import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getPublishedCourses } from '../data/catalog'
import { allLessons } from '../types'

const XP_PER_LEVEL = 400
export const levelFor = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
export const levelProgress = (xp: number) => Math.round(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100)
export const xpToNext = (xp: number) => XP_PER_LEVEL - (xp % XP_PER_LEVEL)

const DAY = 86400000
export const dateKey = (time = Date.now()) => new Date(time).toISOString().slice(0, 10)

export type ReviewSchedule = { due: number; interval: number; ease: number; reps: number }
export type ReviewQuality = 'again' | 'good' | 'easy'
export type DailyReward = { lastClaimedDate: string | null; streak: number }

// Base reward plus a small bonus per consecutive claim day, capped so the streak
// doesn't run away — day 1 is 20 IQ, day 5+ tops out at 100 IQ.
export const dailyRewardAmount = (streak: number) => Math.min(20 + (streak - 1) * 5, 100)

export type AcademyState = {
  enrolled: string[]
  completed: string[]
  xp: number
  streak: number
  lastActive: string | null
  reader: boolean
  reviews: Record<string, ReviewSchedule>
  activityLog: Record<string, number>
  claimedChallenges: string[]
  dailyReward: DailyReward
  enroll: (course: string) => void
  complete: (courseSlug: string, lesson: string, xp: number) => void
  toggleReader: () => void
  isComplete: (lesson: string) => boolean
  progress: (courseSlug: string) => number
  reviewLesson: (lesson: string, quality: ReviewQuality) => void
  dueReviews: () => string[]
  claimChallenge: (id: string, xp: number) => void
  claimDailyReward: () => void
}

const bumpActivity = (log: Record<string, number>) => ({ ...log, [dateKey()]: (log[dateKey()] ?? 0) + 1 })

export const useAcademyStore = create<AcademyState>()(persist((set, get) => ({
  enrolled: [],
  completed: [],
  xp: 0,
  streak: 0,
  lastActive: null,
  reader: false,
  reviews: {},
  activityLog: {},
  claimedChallenges: [],
  dailyReward: { lastClaimedDate: null, streak: 0 },
  enroll: (course) => set((state) => ({ enrolled: state.enrolled.includes(course) ? state.enrolled : [...state.enrolled, course] })),
  complete: (courseSlug, lesson, xp) => set((state) => {
    if (state.completed.includes(lesson)) return state
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - DAY).toDateString()
    const streak = state.lastActive === today ? Math.max(state.streak, 1) : state.lastActive === yesterday ? state.streak + 1 : 1
    return {
      completed: [...state.completed, lesson],
      xp: state.xp + xp,
      streak,
      lastActive: today,
      enrolled: state.enrolled.includes(courseSlug) ? state.enrolled : [...state.enrolled, courseSlug],
      reviews: { ...state.reviews, [lesson]: { due: Date.now() + DAY, interval: 1, ease: 2.5, reps: 0 } },
      activityLog: bumpActivity(state.activityLog),
    }
  }),
  toggleReader: () => set((state) => ({ reader: !state.reader })),
  isComplete: (lesson) => get().completed.includes(lesson),
  progress: (courseSlug) => {
    const course = getPublishedCourses().find((item) => item.slug === courseSlug)
    if (!course) return 0
    const lessons = allLessons(course)
    if (!lessons.length) return 0
    return Math.round((lessons.filter((lesson) => get().completed.includes(lesson.slug)).length / lessons.length) * 100)
  },
  // Simplified SM-2: "again" resets the interval, "good" grows it by the ease factor,
  // "easy" grows it faster and nudges the ease factor up — same shape Anki uses.
  reviewLesson: (lesson, quality) => set((state) => {
    const current = state.reviews[lesson]
    if (!current) return state
    let { interval, ease, reps } = current
    if (quality === 'again') { interval = 1; reps = 0 }
    else if (quality === 'good') { reps += 1; interval = reps <= 1 ? 3 : Math.round(interval * ease) }
    else { reps += 1; ease = Math.min(3.2, ease + 0.15); interval = Math.round((reps <= 1 ? 4 : interval * ease) * 1.3) }
    return { reviews: { ...state.reviews, [lesson]: { due: Date.now() + interval * DAY, interval, ease, reps } }, activityLog: bumpActivity(state.activityLog) }
  }),
  dueReviews: () => Object.entries(get().reviews).filter(([, schedule]) => schedule.due <= Date.now()).sort((a, b) => a[1].due - b[1].due).map(([lesson]) => lesson),
  claimChallenge: (id, xp) => set((state) => state.claimedChallenges.includes(id) ? state : { claimedChallenges: [...state.claimedChallenges, id], xp: state.xp + xp }),
  claimDailyReward: () => set((state) => {
    const today = dateKey()
    if (state.dailyReward.lastClaimedDate === today) return state
    const yesterday = dateKey(Date.now() - DAY)
    const streak = state.dailyReward.lastClaimedDate === yesterday ? state.dailyReward.streak + 1 : 1
    return { xp: state.xp + dailyRewardAmount(streak), dailyReward: { lastClaimedDate: today, streak } }
  }),
}), { name: 'academy-progress' }))

type CompletionLike = { completed: string[] }

export const achievementRules = [
  { key: 'first-light', icon: '✦', title: 'First light', body: 'Complete your first lesson.', unlocked: (state: CompletionLike) => state.completed.length >= 1 },
  { key: 'collector', icon: '◈', title: 'Collector', body: 'Complete five lessons.', unlocked: (state: CompletionLike) => state.completed.length >= 5 },
  { key: 'full-orbit', icon: '◉', title: 'Full orbit', body: 'Finish an entire course.', unlocked: (state: CompletionLike) => getPublishedCourses().some((course) => allLessons(course).length > 0 && allLessons(course).every((lesson) => state.completed.includes(lesson.slug))) },
]

export const countCertificates = (completed: string[]) => getPublishedCourses().filter((course) => { const lessons = allLessons(course); return lessons.length > 0 && lessons.every((lesson) => completed.includes(lesson.slug)) }).length
