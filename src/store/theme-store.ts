import { create } from 'zustand'

export type Theme = 'light' | 'dark'
const STORAGE_KEY = 'fca-theme'

const systemPrefersLight = () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches

const readStored = (): Theme | null => {
  try { const value = localStorage.getItem(STORAGE_KEY); return value === 'light' || value === 'dark' ? value : null } catch { return null }
}

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* private browsing, etc. */ }
}

type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// Resolved and applied to <html> at module load — before React mounts — so the
// page never flashes the wrong theme on first paint.
const initialTheme: Theme = readStored() ?? (systemPrefersLight() ? 'light' : 'dark')
if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', initialTheme)

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme) => { applyTheme(theme); set({ theme }) },
  toggleTheme: () => { const next: Theme = get().theme === 'dark' ? 'light' : 'dark'; applyTheme(next); set({ theme: next }) },
}))
