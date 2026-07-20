import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PASSCODE = 'ck24'

type AdminState = {
  unlocked: boolean
  unlock: (code: string) => boolean
  lock: () => void
}

export const useAdminStore = create<AdminState>()(persist((set) => ({
  unlocked: false,
  unlock: (code) => { const ok = code.trim() === PASSCODE; if (ok) set({ unlocked: true }); return ok },
  lock: () => set({ unlocked: false }),
}), { name: 'fca-admin' }))

export const ADMIN_PASSCODE_HINT = PASSCODE
