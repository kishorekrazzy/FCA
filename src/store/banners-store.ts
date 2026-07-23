import { create } from 'zustand'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type BannerPlacement = 'home' | 'academy' | 'login'

export type Banner = {
  id: string
  imageUrl: string
  title: string
  linkUrl: string
  placement: BannerPlacement
  order: number
}

type BannersState = { banners: Banner[] }

export const useBannersStore = create<BannersState>(() => ({ banners: [] }))

let started = false
export function initBannersSync() {
  if (started) return
  started = true
  try {
    onSnapshot(collection(db, 'banners'), (snapshot) => {
      useBannersStore.setState({ banners: snapshot.docs.map((item) => ({ ...(item.data() as Omit<Banner, 'id'>), id: item.id })) })
    }, () => {})
  } catch { /* offline — pages just show no banners */ }
}

export function useAllBanners(): Banner[] {
  const banners = useBannersStore((state) => state.banners)
  return [...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function useBanners(placement: BannerPlacement): Banner[] {
  return useAllBanners().filter((banner) => banner.placement === placement)
}

export async function upsertBanner(banner: Banner) {
  await setDoc(doc(db, 'banners', banner.id), banner)
}

export async function deleteBanner(id: string) {
  await deleteDoc(doc(db, 'banners', id))
}

export const emptyBanner = (placement: BannerPlacement = 'home'): Banner => ({
  id: crypto.randomUUID(), imageUrl: '', title: '', linkUrl: '', placement, order: Date.now(),
})
