import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

const pairId = (a: string, b: string) => [a, b].sort().join('_')

export type MessageKind = 'text' | 'sticker' | 'poll' | 'post' | 'course'

export type PollData = { question: string; options: string[]; votes: Record<string, number> }
export type SharedPostData = { id: string; name: string; handle: string; photo?: string; image?: string; text: string; courseTitle?: string }
export type SharedCourseData = { slug: string; title: string; category: string }

export type Message = {
  id: string
  conversationId: string
  participants: [string, string]
  from: string
  to: string
  text: string
  kind?: MessageKind
  poll?: PollData
  sharedPost?: SharedPostData
  sharedCourse?: SharedCourseData
  createdAt: number
}

export async function sendMessage(myUid: string, otherUid: string, text: string, kind: MessageKind = 'text', payload?: { poll?: PollData; sharedPost?: SharedPostData; sharedCourse?: SharedCourseData }) {
  const trimmed = text.trim()
  if (!trimmed) return
  await addDoc(collection(db, 'messages'), { conversationId: pairId(myUid, otherUid), participants: [myUid, otherUid], from: myUid, to: otherUid, text: trimmed, kind, ...(payload?.poll ? { poll: payload.poll } : {}), ...(payload?.sharedPost ? { sharedPost: payload.sharedPost } : {}), ...(payload?.sharedCourse ? { sharedCourse: payload.sharedCourse } : {}), createdAt: serverTimestamp() })
}

export async function votePoll(messageId: string, uid: string, optionIndex: number) {
  await updateDoc(doc(db, 'messages', messageId), { [`poll.votes.${uid}`]: optionIndex })
}

/** Live thread between exactly two people. Single equality clause only (no orderBy in the
 * query) so this never needs a Firestore composite index — sorted client-side instead. */
export function useConversation(myUid?: string | null, otherUid?: string | null): Message[] {
 const [messages, setMessages] = useState<Message[]>([])
 useEffect(() => {
  if (!myUid || !otherUid) { setMessages([]); return }
  try {
   const q = query(collection(db, 'messages'), where('conversationId', '==', pairId(myUid, otherUid)))
   return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((item) => { const data = item.data(); return { ...data, id: item.id, createdAt: data.createdAt?.toMillis?.() ?? Date.now() } as Message })
    setMessages(items.sort((a, b) => a.createdAt - b.createdAt))
   }, () => setMessages([]))
  } catch { setMessages([]); return undefined }
 }, [myUid, otherUid])
 return messages
}

export type ConversationSummary = { otherUid: string; lastText: string; lastAt: number; lastFromMe: boolean; lastKind: MessageKind }

/** All of a learner's conversations, most recent first, one row per partner. */
export function useConversationsList(myUid?: string | null): ConversationSummary[] {
 const [messages, setMessages] = useState<Message[]>([])
 useEffect(() => {
  if (!myUid) { setMessages([]); return }
  try {
   const q = query(collection(db, 'messages'), where('participants', 'array-contains', myUid))
   return onSnapshot(q, (snapshot) => {
    setMessages(snapshot.docs.map((item) => { const data = item.data(); return { ...data, id: item.id, createdAt: data.createdAt?.toMillis?.() ?? Date.now() } as Message }))
   }, () => setMessages([]))
  } catch { setMessages([]); return undefined }
 }, [myUid])
 return useMemo(() => {
  const latest = new Map<string, Message>()
  for (const message of messages) {
   const other = message.from === myUid ? message.to : message.from
   const existing = latest.get(other)
   if (!existing || message.createdAt > existing.createdAt) latest.set(other, message)
  }
  return [...latest.values()].sort((a, b) => b.createdAt - a.createdAt).map((message) => ({ otherUid: message.from === myUid ? message.to : message.from, lastText: message.text, lastAt: message.createdAt, lastFromMe: message.from === myUid, lastKind: message.kind ?? 'text' }))
 }, [messages, myUid])
}
