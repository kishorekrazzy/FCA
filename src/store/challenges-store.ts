import { create } from 'zustand'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type ChallengeGoal = 'lessons' | 'streak' | 'manual'

export type Challenge = {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  startAt: number
  endAt: number
  goalType: ChallengeGoal
  goalCount: number
}

type ChallengesState = { challenges: Challenge[] }

export const useChallengesStore = create<ChallengesState>(() => ({ challenges: [] }))

let started = false
export function initChallengesSync() {
  if (started) return
  started = true
  try {
    onSnapshot(collection(db, 'challenges'), (snapshot) => {
      useChallengesStore.setState({ challenges: snapshot.docs.map((item) => ({ ...(item.data() as Omit<Challenge, 'id'>), id: item.id })) })
    }, () => {})
  } catch { /* offline — dashboard just shows no challenges */ }
}

export function useChallenges(): Challenge[] {
  const challenges = useChallengesStore((state) => state.challenges)
  return [...challenges].sort((a, b) => a.startAt - b.startAt)
}

export function useActiveChallenges(): Challenge[] {
  const now = Date.now()
  return useChallenges().filter((challenge) => challenge.startAt <= now && now <= challenge.endAt)
}

export async function upsertChallenge(challenge: Challenge) {
  await setDoc(doc(db, 'challenges', challenge.id), challenge)
}

export async function deleteChallenge(id: string) {
  await deleteDoc(doc(db, 'challenges', id))
}

export const emptyChallenge = (): Challenge => ({
  id: crypto.randomUUID(), title: '', description: '', icon: '🏆', xpReward: 100,
  startAt: Date.now(), endAt: Date.now() + 7 * 86400000, goalType: 'lessons', goalCount: 3,
})
