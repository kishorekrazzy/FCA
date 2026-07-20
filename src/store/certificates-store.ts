import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type IssuedCertificate = {
  id: string
  uid: string
  displayName: string
  photoURL?: string | null
  courseSlug: string
  courseTitle: string
  issuedAt: number
}

// Deterministic per learner + course, so the same person re-visiting the page always
// gets the same credential id, and two different learners never collide.
const hash = (value: string) => { let h = 0; for (let i = 0; i < value.length; i++) h = (Math.imul(h, 31) + value.charCodeAt(i)) >>> 0; return h }
export const certIdFor = (uid: string, courseSlug: string) => `FCA-${courseSlug.slice(0, 2).toUpperCase()}${String(hash(uid + courseSlug) % 100000).padStart(5, '0')}`

/** Writes the certificate record once, the first time it's earned — issuedAt is never
 * overwritten on later visits, only the display fields (name/photo/title) refresh. */
export async function recordCertificate(cert: Omit<IssuedCertificate, 'issuedAt'>) {
  const ref = doc(db, 'certificates', cert.id)
  const existing = await getDoc(ref).catch(() => null)
  if (existing?.exists()) {
    await setDoc(ref, { displayName: cert.displayName, photoURL: cert.photoURL ?? null, courseTitle: cert.courseTitle }, { merge: true }).catch(() => {})
  } else {
    await setDoc(ref, { ...cert, photoURL: cert.photoURL ?? null, issuedAt: Date.now() }).catch(() => {})
  }
}

// LinkedIn's documented "Add to Profile" deep link (used by Coursera, Credly, etc.) —
// pre-fills every field its Licenses & Certifications form supports: title, issuing
// organization, issue date, credential ID, and the credential's verification URL.
export function buildLinkedInAddUrl(courseTitle: string, certId: string, issuedAtMs: number, certUrl: string) {
  const date = new Date(issuedAtMs)
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: courseTitle,
    organizationName: 'Future Creators Academy',
    issueYear: String(date.getFullYear()),
    issueMonth: String(date.getMonth() + 1),
    certUrl,
    certId,
  })
  return `https://www.linkedin.com/profile/add?${params.toString()}`
}

export function useCertificate(certId: string | undefined): { cert: IssuedCertificate | null | undefined; error: boolean } {
  const [cert, setCert] = useState<IssuedCertificate | null | undefined>(undefined)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!certId) { setCert(null); return }
    setCert(undefined)
    try {
      return onSnapshot(doc(db, 'certificates', certId), (snap) => setCert(snap.exists() ? (snap.data() as IssuedCertificate) : null), () => setError(true))
    } catch { setError(true); return undefined }
  }, [certId])
  return { cert, error }
}
