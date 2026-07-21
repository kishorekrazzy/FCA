import { create } from 'zustand'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

type SiteSettingsState = { heroImageUrl: string | null }

export const useSiteSettingsStore = create<SiteSettingsState>(() => ({ heroImageUrl: null }))

let started = false
export function initSiteSettingsSync() {
  if (started) return
  started = true
  try {
    onSnapshot(doc(db, 'settings', 'homepage'), (snapshot) => {
      useSiteSettingsStore.setState({ heroImageUrl: snapshot.data()?.heroImageUrl || null })
    }, () => {})
  } catch { /* offline — hero just uses the generated background */ }
}

export function useHeroImageUrl(): string | null {
  return useSiteSettingsStore((state) => state.heroImageUrl)
}

export async function setHeroImageUrl(url: string) {
  await setDoc(doc(db, 'settings', 'homepage'), { heroImageUrl: url.trim() || null }, { merge: true })
}
