import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
  applyPrefs: (prefs: Record<string, unknown>) => void
}

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'dark' || stored === 'light') return stored
  }
  return 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.className = theme
  localStorage.setItem('theme', theme)
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggle: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return { theme: next }
    }),
  setTheme: (theme: Theme) => {
    applyTheme(theme)
    set({ theme })
  },
  applyPrefs: (prefs: Record<string, unknown>) => {
    if (typeof prefs.darkTheme === 'boolean') {
      const next = prefs.darkTheme ? 'dark' : 'light'
      applyTheme(next)
      set({ theme: next })
    }
  },
}))
