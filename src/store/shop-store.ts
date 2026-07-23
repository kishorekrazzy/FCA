import { create } from 'zustand'
import { arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type ShopItemType = 'sticker' | 'cosmetic'

export type ShopItem = {
  id: string
  type: ShopItemType
  name: string
  description: string
  price: number
  image: string
  emoji: string
  active: boolean
  order: number
}

type ShopState = { items: ShopItem[] }
export const useShopStore = create<ShopState>(() => ({ items: [] }))

let itemsStarted = false
export function initShopSync() {
  if (itemsStarted) return
  itemsStarted = true
  try {
    onSnapshot(collection(db, 'shopItems'), (snapshot) => {
      useShopStore.setState({ items: snapshot.docs.map((item) => ({ ...(item.data() as Omit<ShopItem, 'id'>), id: item.id })) })
    }, () => {})
  } catch { /* offline — shop just shows nothing */ }
}

export function useShopItems(): ShopItem[] {
  const items = useShopStore((state) => state.items)
  return items.filter((item) => item.active).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function useAllShopItemsAdmin(): ShopItem[] {
  const items = useShopStore((state) => state.items)
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function upsertShopItem(item: ShopItem) {
  await setDoc(doc(db, 'shopItems', item.id), item)
}

export async function deleteShopItem(id: string) {
  await deleteDoc(doc(db, 'shopItems', id))
}

export const emptyShopItem = (): ShopItem => ({ id: crypto.randomUUID(), type: 'sticker', name: '', description: '', price: 50, image: '', emoji: '✨', active: true, order: Date.now() })

export type ShopCoupon = {
  code: string
  itemId: string
  maxRedemptions: number
  redeemedBy: string[]
  active: boolean
}

type CouponState = { coupons: ShopCoupon[] }
export const useShopCouponStore = create<CouponState>(() => ({ coupons: [] }))

let couponsStarted = false
export function initShopCouponsSync() {
  if (couponsStarted) return
  couponsStarted = true
  try {
    onSnapshot(collection(db, 'shopCoupons'), (snapshot) => {
      useShopCouponStore.setState({ coupons: snapshot.docs.map((item) => ({ ...(item.data() as Omit<ShopCoupon, 'code'>), code: item.id })) })
    }, () => {})
  } catch { /* offline */ }
}

export function useShopCoupons(): ShopCoupon[] {
  return useShopCouponStore((state) => state.coupons)
}

export async function upsertCoupon(coupon: ShopCoupon) {
  await setDoc(doc(db, 'shopCoupons', coupon.code.trim().toUpperCase()), { ...coupon, code: coupon.code.trim().toUpperCase() })
}

export async function deleteCoupon(code: string) {
  await deleteDoc(doc(db, 'shopCoupons', code))
}

export const emptyCoupon = (): ShopCoupon => ({ code: '', itemId: '', maxRedemptions: 100, redeemedBy: [], active: true })

export type RedeemCouponResult = 'ok' | 'invalid' | 'used' | 'maxed' | 'owned'

/** Looks up a coupon by code and, if valid and unused by this learner, records the
 * redemption and reports which item to grant — the caller (client academy-store)
 * is responsible for actually adding the item to the learner's owned list, since
 * that lives in localStorage-backed state, not here. */
export async function redeemShopCoupon(code: string, uid: string, alreadyOwns: (itemId: string) => boolean): Promise<{ result: RedeemCouponResult; itemId?: string }> {
  const trimmed = code.trim().toUpperCase()
  if (!trimmed) return { result: 'invalid' }
  const ref = doc(db, 'shopCoupons', trimmed)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { result: 'invalid' }
  const coupon = { ...(snap.data() as Omit<ShopCoupon, 'code'>), code: snap.id }
  if (!coupon.active) return { result: 'invalid' }
  if (coupon.redeemedBy.includes(uid)) return { result: 'used' }
  if (coupon.redeemedBy.length >= coupon.maxRedemptions) return { result: 'maxed' }
  if (alreadyOwns(coupon.itemId)) return { result: 'owned', itemId: coupon.itemId }
  await updateDoc(ref, { redeemedBy: arrayUnion(uid) })
  return { result: 'ok', itemId: coupon.itemId }
}
