import { create } from 'zustand'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type AchievementGoal = 'lessons' | 'streak' | 'iq' | 'certificates'

export type Achievement = {
  id: string
  title: string
  description: string
  stickerUrl: string
  goalType: AchievementGoal
  goalCount: number
  order: number
}

type AchievementsState = { achievements: Achievement[] }

export const useAchievementsStore = create<AchievementsState>(() => ({ achievements: [] }))

let started = false
export function initAchievementsSync() {
  if (started) return
  started = true
  try {
    onSnapshot(collection(db, 'achievements'), (snapshot) => {
      useAchievementsStore.setState({ achievements: snapshot.docs.map((item) => ({ ...(item.data() as Omit<Achievement, 'id'>), id: item.id })) })
    }, () => {})
  } catch { /* offline — pages just show no achievements */ }
}

export function useAchievements(): Achievement[] {
  const achievements = useAchievementsStore((state) => state.achievements)
  return [...achievements].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function upsertAchievement(achievement: Achievement) {
  await setDoc(doc(db, 'achievements', achievement.id), achievement)
}

export async function deleteAchievement(id: string) {
  await deleteDoc(doc(db, 'achievements', id))
}

export const emptyAchievement = (): Achievement => ({
  id: crypto.randomUUID(), title: '', description: '', stickerUrl: '', goalType: 'lessons', goalCount: 5, order: Date.now(),
})

export type AchievementStats = { completed: string[]; streak: number; xp: number; certificates: number }

export function achievementValue(stats: AchievementStats, goalType: AchievementGoal): number {
  if (goalType === 'lessons') return stats.completed.length
  if (goalType === 'streak') return stats.streak
  if (goalType === 'iq') return stats.xp
  return stats.certificates
}

export function isAchievementUnlocked(achievement: Achievement, stats: AchievementStats): boolean {
  return achievementValue(stats, achievement.goalType) >= achievement.goalCount
}

export const achievementGoalLabel = (goalType: AchievementGoal) => goalType === 'lessons' ? 'lessons completed' : goalType === 'streak' ? 'day streak' : goalType === 'iq' ? 'IQ earned' : 'certificates earned'
