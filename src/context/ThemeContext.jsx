import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const STORAGE_KEY   = 'ideavault-theme'
const VALID_THEMES  = ['light', 'dark']
const DEFAULT_THEME = 'light'

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */

/** Read persisted theme from localStorage, with fallback chain. */
const readPersistedTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (VALID_THEMES.includes(stored)) return stored
  } catch {
    /* localStorage unavailable (private browsing, storage quota) */
  }

  // Secondary fallback: respect OS preference
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    /* matchMedia unavailable (JSDOM, SSR) */
  }

  return DEFAULT_THEME
}

/** Write theme to localStorage silently. */
const persistTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore quota / privacy errors */
  }
}

/** Apply theme class to <html> and persist. */
const applyTheme = (theme) => {
  const root = document.documentElement
  root.classList.remove(...VALID_THEMES)
  root.classList.add(theme)
  persistTheme(theme)

  // Keep <meta name="theme-color"> in sync for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === 'dark' ? '#0d1117' : '#7c3aed'
    )
  }
}

/* ─────────────────────────────────────────────────────────────────
   Context
───────────────────────────────────────────────────────────────── */
const ThemeContext = createContext(null)

/* ─────────────────────────────────────────────────────────────────
   Provider
───────────────────────────────────────────────────────────────── */
export const ThemeProvider = ({ children }) => {
  /*
   * Initialise from localStorage / OS preference.
   * The flash-prevention <script> in index.html already set the
   * class on <html>, so React's first render matches the DOM.
   */
  const [theme, setTheme] = useState(readPersistedTheme)

  /* ── Sync theme to DOM whenever it changes ──────────────────── */
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  /* ── Listen for OS preference changes ───────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return

    const handler = (e) => {
      // Only follow OS if the user hasn't explicitly set a preference
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  /* ── Toggle ─────────────────────────────────────────────────── */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  /* ── Set explicit theme ─────────────────────────────────────── */
  const setExplicitTheme = useCallback((newTheme) => {
    if (VALID_THEMES.includes(newTheme)) setTheme(newTheme)
  }, [])

  const isDark  = theme === 'dark'
  const isLight = theme === 'light'

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        isLight,
        toggleTheme,
        setTheme: setExplicitTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Hook
───────────────────────────────────────────────────────────────── */
export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider>')
  }
  return ctx
}