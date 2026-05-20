import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate }  from 'react-router-dom'
import {
  Lightbulb, Menu, X,
  LogOut, User, ChevronDown, Sparkles,
} from 'lucide-react'
import toast         from 'react-hot-toast'
import ThemeToggle   from '../shared/ThemeToggle'
import { useAuth }   from '../../context/AuthContext'
import { useTheme }  from '../../context/ThemeContext'
import { buildAvatarUrl } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────────
   Navigation link definitions
───────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { to: '/',                label: 'Home',            end: true,  private: false },
  { to: '/ideas',           label: 'Ideas',           end: false, private: false },
  { to: '/add-idea',        label: 'Add Idea',        end: false, private: true  },
  { to: '/my-ideas',        label: 'My Ideas',        end: false, private: true  },
  { to: '/my-interactions', label: 'My Interactions', end: false, private: true  },
]

/* ─────────────────────────────────────────────────────────────────
   Navbar
───────────────────────────────────────────────────────────────── */
const Navbar = () => {
  const { user, logout, loading: authLoading } = useAuth()
  const { isDark }                             = useTheme()
  const navigate                               = useNavigate()

  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loggingOut,   setLoggingOut]   = useState(false)

  const dropdownRef = useRef(null)
  const mobileRef   = useRef(null)

  /* ── Close dropdown on outside click ───────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── Close mobile menu on viewport resize to ≥ md ──────────── */
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  /* ── Close mobile menu on route change ─────────────────────── */
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [navigate])

  /* ── Visible nav links depend on auth state ─────────────────── */
  const visibleLinks = NAV_LINKS.filter(
    (l) => !l.private || !!user
  )

  /* ── Avatar source ──────────────────────────────────────────── */
  const avatarSrc =
    user?.photoURL ||
    buildAvatarUrl(user?.displayName || 'U', 40)

  /* ── Logout ─────────────────────────────────────────────────── */
  const handleLogout = async () => {
    setDropdownOpen(false)
    setMobileOpen(false)
    setLoggingOut(true)
    try {
      await logout()
      toast.success('You have been signed out.')
      navigate('/', { replace: true })
    } catch {
      toast.error('Sign out failed. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  /* ── Nav link classes ───────────────────────────────────────── */
  const desktopLinkClass = ({ isActive }) =>
    `
      relative px-3 py-2 rounded-xl text-sm font-medium
      transition-all duration-200
      ${isActive
        ? 'bg-primary/10 text-primary'
        : 'text-foreground/70 hover:text-foreground hover:bg-accent'}
    `

  const mobileLinkClass = ({ isActive }) =>
    `
      flex items-center justify-between px-4 py-3 rounded-xl
      text-sm font-medium transition-colors duration-200
      ${isActive
        ? 'bg-primary/10 text-primary'
        : 'text-foreground/70 hover:text-foreground hover:bg-accent'}
    `

  /* ─────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────── */
  return (
    <header
      className="
        sticky top-0 z-50 w-full
        border-b border-border
        bg-background/80 backdrop-blur-xl
        supports-[backdrop-filter]:bg-background/60
        transition-colors duration-300
      "
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ───────────────────────────────────────────── */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 font-extrabold text-xl text-primary shrink-0 hover:opacity-90 transition-opacity"
          aria-label="IdeaVault home"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-primary/30">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:inline tracking-tight">IdeaVault</span>
        </Link>

        {/* ── Desktop Nav Links ───────────────────────────────── */}
        <nav
          className="hidden md:flex items-center gap-0.5"
          aria-label="Main navigation"
        >
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={desktopLinkClass}
            >
              {link.label}
              {link.label === 'Add Idea' && (
                <Sparkles className="inline-block h-3 w-3 ml-1 text-primary/60" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Right controls ──────────────────────────────────── */}
        <div className="flex items-center gap-1.5">

          {/* ── Theme Toggle ──────────────────────────────────── */}
          <ThemeToggle size="md" />

          {/* ── Auth section ────────────────────────────────── */}
          {!authLoading && (
            <>
              {user ? (
                /* ── Avatar dropdown ──────────────────────── */
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((p) => !p)}
                    aria-label="Open user menu"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                    className="
                      flex items-center gap-1.5 p-1 pl-2 rounded-full
                      hover:bg-accent
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      transition-all duration-200
                    "
                  >
                    <img
                      src={avatarSrc}
                      alt={user.displayName || 'User avatar'}
                      className="h-8 w-8 rounded-full object-cover border-2 border-primary/25"
                      onError={(e) => {
                        e.target.src = buildAvatarUrl('U', 40)
                      }}
                    />
                    <ChevronDown
                      className={`
                        hidden sm:block h-3.5 w-3.5 text-muted-foreground
                        transition-transform duration-200
                        ${dropdownOpen ? 'rotate-180' : ''}
                      `}
                    />
                  </button>

                  {/* ── Dropdown panel ────────────────────── */}
                  {dropdownOpen && (
                    <div
                      role="menu"
                      aria-label="User menu"
                      className="
                        absolute right-0 top-full mt-2 w-64
                        bg-card border border-border rounded-2xl
                        shadow-2xl shadow-black/10
                        z-50 overflow-hidden
                        animate-scale-in origin-top-right
                      "
                    >
                      {/* User info header */}
                      <div className="px-4 py-3.5 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarSrc}
                            alt={user.displayName || 'User avatar'}
                            className="h-10 w-10 rounded-full border-2 border-primary/20 object-cover shrink-0"
                            onError={(e) => {
                              e.target.src = buildAvatarUrl('U', 40)
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">
                              {user.displayName || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Theme toggle row inside dropdown */}
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {isDark ? '🌙' : '☀️'}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {isDark ? 'Dark mode' : 'Light mode'}
                            </span>
                          </div>
                          <ThemeToggle size="sm" />
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5" role="none">
                        <Link
                          to="/profile"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          className="
                            flex items-center gap-2.5 px-4 py-2.5
                            text-sm text-foreground
                            hover:bg-accent hover:text-foreground
                            transition-colors group
                          "
                        >
                          <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          Profile Management
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-border py-1.5" role="none">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="
                            flex items-center gap-2.5 w-full px-4 py-2.5
                            text-sm text-destructive
                            hover:bg-destructive/8 hover:text-destructive
                            transition-colors disabled:opacity-50
                          "
                        >
                          <LogOut className="h-4 w-4" />
                          {loggingOut ? 'Signing out…' : 'Sign Out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              ) : (
                /* ── Guest buttons ──────────────────────── */
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <Link
                    to="/login"
                    className="
                      px-4 py-2 text-sm font-medium
                      text-foreground/80 hover:text-foreground
                      transition-colors
                    "
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="
                      px-4 py-2 text-sm font-bold
                      bg-primary text-primary-foreground rounded-xl
                      hover:bg-primary/90 hover:scale-105 active:scale-100
                      transition-all shadow-md shadow-primary/25
                    "
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ── Hamburger ─────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="
              md:hidden p-2 rounded-xl ml-0.5
              text-foreground/70 hover:text-foreground hover:bg-accent
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              transition-colors duration-200
            "
          >
            <span className="relative block h-5 w-5">
              <X
                className={`
                  absolute inset-0 h-5 w-5
                  transition-all duration-200
                  ${mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}
                `}
              />
              <Menu
                className={`
                  absolute inset-0 h-5 w-5
                  transition-all duration-200
                  ${mobileOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}
                `}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Mobile Menu
      ═══════════════════════════════════════════════════════════ */}
      <div
        id="mobile-menu"
        ref={mobileRef}
        aria-hidden={!mobileOpen}
        className={`
          md:hidden border-t border-border
          bg-background/98 backdrop-blur-xl
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="container mx-auto px-4 py-3">

          {/* Nav links */}
          <nav
            className="space-y-1 mb-3"
            aria-label="Mobile navigation"
          >
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass}
              >
                <span>{link.label}</span>
                {link.label === 'Add Idea' && (
                  <Sparkles className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile theme toggle row */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isDark ? 'Dark mode' : 'Light mode'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tap to switch theme
                </p>
              </div>
            </div>
            <ThemeToggle size="md" />
          </div>

          {/* Auth section */}
          {user ? (
            <div className="border-t border-border pt-3 space-y-1">
              {/* Profile */}
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
              >
                <img
                  src={avatarSrc}
                  alt={user.displayName || 'Avatar'}
                  className="h-7 w-7 rounded-full border border-border object-cover"
                  onError={(e) => { e.target.src = buildAvatarUrl('U', 28) }}
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate text-sm">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </Link>

              {/* Profile management */}
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profile Management
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/8 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>

          ) : (
            /* Guest auth buttons */
            <div className="border-t border-border pt-3 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-extrabold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar