export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'color-theme'
let currentTheme: Theme | null = null
let initialized = false

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ensureInit() {
  if (initialized) return
  currentTheme = readInitialTheme()
  applyTheme(currentTheme)
  initialized = true
}

export function getTheme(): Theme {
  ensureInit()
  return currentTheme as Theme
}

export function setTheme(theme: Theme) {
  ensureInit()
  if (theme === currentTheme) return
  currentTheme = theme
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'light' ? 'dark' : 'light'
  setTheme(next)
  return next
}

export function useTheme() {
  return {
    getTheme,
    setTheme,
    toggleTheme,
    ensureInit,
  }
}
