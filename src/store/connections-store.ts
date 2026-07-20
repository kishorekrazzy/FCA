import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, increment, onSnapshot, query, runTransaction, setDoc, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

const pairId = (a: string, b: string) => [a, b].sort().join('_')
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // excludes ambiguous 0/O, 1/I/L

// Every learner gets exactly one globally-unique public ID (also doubles as their referral
// code). Uniqueness is enforced server-side via a transaction against a `usernames/{code}`
// reservation doc — a random suggestion alone can't guarantee no collision, the transaction can.
export async function ensurePublicId(uid: string, existingId?: string | null): Promise<string> {
  if (existingId) return existingId
  for (let attempt = 0; attempt < 8; attempt++) {
    let code = ''
    for (let i = 0; i < 5; i++) code += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]
    const full = `FCA-${code}`
    const ref = doc(db, 'usernames', full)
    try {
      const claimed = await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref)
        if (snap.exists()) return false
        tx.set(ref, { uid, createdAt: Date.now() })
        return true
      })
      if (claimed) return full
    } catch { /* retry */ }
  }
  return `FCA-${uid.slice(0, 5).toUpperCase()}`
}

export async function lookupPublicId(code: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'usernames', code.trim().toUpperCase()))
  return snap.exists() ? (snap.data().uid as string) : null
}

type ConnectionStatus = 'pending' | 'accepted'
type ConnectionDoc = { id: string; users: [string, string]; status: ConnectionStatus; requestedBy: string; createdAt: number }
export type FriendState = 'none' | 'friends' | 'outgoing' | 'incoming'

/** Every connection between two learners starts as a pending request and must be accepted —
 * except referral-code redemption, where sharing the code itself is treated as consent. */
export async function sendFriendRequest(myUid: string, otherUid: string) {
  if (myUid === otherUid) return
  const ref = doc(db, 'connections', pairId(myUid, otherUid))
  const existing = await getDoc(ref)
  if (existing.exists()) return
  await setDoc(ref, { users: [myUid, otherUid], status: 'pending', requestedBy: myUid, createdAt: Date.now() })
}

export async function acceptFriendRequest(myUid: string, otherUid: string) {
  await setDoc(doc(db, 'connections', pairId(myUid, otherUid)), { status: 'accepted' }, { merge: true })
}

export async function declineFriendRequest(myUid: string, otherUid: string) {
  await deleteDoc(doc(db, 'connections', pairId(myUid, otherUid)))
}

export async function removeFriend(myUid: string, otherUid: string) {
  await deleteDoc(doc(db, 'connections', pairId(myUid, otherUid)))
}

export type RedeemResult = 'ok' | 'self' | 'invalid' | 'already'

export async function redeemReferralCode(code: string, myUid: string): Promise<RedeemResult> {
  const ownerUid = await lookupPublicId(code)
  if (!ownerUid) return 'invalid'
  if (ownerUid === myUid) return 'self'
  const id = pairId(myUid, ownerUid)
  const existing = await getDoc(doc(db, 'connections', id))
  if (existing.exists()) return 'already'
  await setDoc(doc(db, 'connections', id), { users: [myUid, ownerUid], status: 'accepted', requestedBy: myUid, createdAt: Date.now(), viaReferral: true })
  await setDoc(doc(db, 'users', ownerUid), { xp: increment(50) }, { merge: true })
  return 'ok'
}

function useConnectionDocs(uid?: string | null): ConnectionDoc[] {
 const [docs, setDocs] = useState<ConnectionDoc[]>([])
 useEffect(() => {
  if (!uid) { setDocs([]); return }
  try {
   const q = query(collection(db, 'connections'), where('users', 'array-contains', uid))
   return onSnapshot(q, (snapshot) => setDocs(snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as ConnectionDoc))), () => setDocs([]))
  } catch { setDocs([]); return undefined }
 }, [uid])
 return docs
}

/** Live list of a user's accepted-friend uids (the other side of each accepted connection). */
export function useConnections(uid?: string | null): string[] {
 const docs = useConnectionDocs(uid)
 return docs.filter((item) => item.status === 'accepted').map((item) => item.users.find((other) => other !== uid)!)
}

/** Requests someone else sent to this user, awaiting accept/decline. */
export function useIncomingRequests(uid?: string | null): string[] {
 const docs = useConnectionDocs(uid)
 return docs.filter((item) => item.status === 'pending' && item.requestedBy !== uid).map((item) => item.users.find((other) => other !== uid)!)
}

/** Requests this user sent that are still awaiting the other side. */
export function useOutgoingRequests(uid?: string | null): string[] {
 const docs = useConnectionDocs(uid)
 return docs.filter((item) => item.status === 'pending' && item.requestedBy === uid).map((item) => item.users.find((other) => other !== uid)!)
}

export function useFriendState(myUid?: string | null, otherUid?: string): FriendState {
 const docs = useConnectionDocs(myUid)
 if (!otherUid) return 'none'
 const match = docs.find((item) => item.users.includes(otherUid))
 if (!match) return 'none'
 if (match.status === 'accepted') return 'friends'
 return match.requestedBy === myUid ? 'outgoing' : 'incoming'
}

export function useIsFriend(myUid?: string | null, otherUid?: string): boolean {
 return useFriendState(myUid, otherUid) === 'friends'
}
