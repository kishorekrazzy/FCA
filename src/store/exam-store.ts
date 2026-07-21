import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type ExamQuestion = {
  id: string
  courseSlug: string
  question: string
  imageUrl?: string
  options: string[]
  correctIndex: number
}

export const EXAM_QUESTION_COUNT = 30
export const EXAM_TIME_PER_QUESTION = 12
export const EXAM_PASS_PERCENT = 80

/** Live question bank for one course. Filtered by a single equality clause (no
 * orderBy in the query itself) so this never needs a Firestore composite index. */
export function useExamQuestions(courseSlug: string | undefined): ExamQuestion[] {
 const [questions, setQuestions] = useState<ExamQuestion[]>([])
 useEffect(() => {
  if (!courseSlug) { setQuestions([]); return }
  try {
   const q = query(collection(db, 'examQuestions'), where('courseSlug', '==', courseSlug))
   return onSnapshot(q, (snapshot) => {
    setQuestions(snapshot.docs.map((item) => ({ ...(item.data() as Omit<ExamQuestion, 'id'>), id: item.id })))
   }, () => setQuestions([]))
  } catch { setQuestions([]); return undefined }
 }, [courseSlug])
 return questions
}

export async function upsertExamQuestion(question: ExamQuestion) {
 await setDoc(doc(db, 'examQuestions', question.id), question)
}

export async function deleteExamQuestion(id: string) {
 await deleteDoc(doc(db, 'examQuestions', id))
}

export const emptyExamQuestion = (courseSlug: string): ExamQuestion => ({
 id: crypto.randomUUID(), courseSlug, question: '', imageUrl: '', options: ['', '', '', ''], correctIndex: 0,
})

function shuffle<T>(items: T[]): T[] {
 const copy = [...items]
 for (let i = copy.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[copy[i], copy[j]] = [copy[j], copy[i]]
 }
 return copy
}

export type ExamRoundQuestion = { id: string; question: string; imageUrl?: string; options: string[]; correctIndex: number }

/** Builds one exam attempt: a random subset of the bank (or all of it, if the bank
 * is smaller than the target count), with both question order and each question's
 * own option order freshly shuffled — so no two attempts look identical. */
export function buildExamRound(bank: ExamQuestion[], count = EXAM_QUESTION_COUNT): ExamRoundQuestion[] {
 const picked = shuffle(bank).slice(0, Math.min(count, bank.length))
 return picked.map((question) => {
  const order = shuffle(question.options.map((_, index) => index))
  return {
   id: question.id,
   question: question.question,
   imageUrl: question.imageUrl,
   options: order.map((index) => question.options[index]),
   correctIndex: order.indexOf(question.correctIndex),
  }
 })
}

/** Validates a parsed JSON import: must be an array of {question, options[4],
 * correctIndex, imageUrl?}. Returns only the valid entries and a count of any
 * rows skipped, so a partially-malformed file still imports what it can. */
export function parseExamJson(raw: unknown, courseSlug: string): { valid: ExamQuestion[]; skipped: number } {
 const rows = Array.isArray(raw) ? raw : []
 const valid: ExamQuestion[] = []
 let skipped = 0
 for (const row of rows) {
  const question = typeof row?.question === 'string' ? row.question.trim() : ''
  const options = Array.isArray(row?.options) ? row.options.map((option: unknown) => String(option ?? '').trim()) : []
  const correctIndex = Number(row?.correctIndex)
  if (!question || options.length !== 4 || options.some((option: string) => !option) || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
   skipped++
   continue
  }
  valid.push({ id: crypto.randomUUID(), courseSlug, question, imageUrl: typeof row?.imageUrl === 'string' ? row.imageUrl.trim() : '', options, correctIndex })
 }
 return { valid, skipped }
}
