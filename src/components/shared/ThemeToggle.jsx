import { useTheme } from '../../context/ThemeContext'

/* ─────────────────────────────────────────────────────────────────
   Icon components
   Inline SVG avoids an extra lucide import and gives full control
   over the animation.
───────────────────────────────────────────────────────────────── */
const SunIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)

const MoonIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

/* ─────────────────────────────────────────────────────────────────
   ThemeToggle
   ─────────────
   A pill-shaped toggle button that animates between Sun and Moon
   icons. Works in both the Navbar and any other location.

   Props:
     size  — 'sm' | 'md' (default 'md')
     label — show text label beside the icon (default false)
───────────────────────────────────────────────────────────────── */
const ThemeToggle = ({ size = 'md', label = false }) => {
  const { isDark, toggleTheme, theme } = useTheme()

  const ariaLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  /* ── Size variants ─────────────────────────────────────────── */
  const sizes = {
    sm: {
      button: 'h-8 w-8',
      icon  : 'h-4 w-4',
      pill  : 'h-8 px-2.5 gap-1.5',
    },
    md: {
      button: 'h-9 w-9',
      icon  : 'h-[18px] w-[18px]',
      pill  : 'h-9 px-3 gap-2',
    },
  }[size] ?? {
    button: 'h-9 w-9',
    icon  : 'h-[18px] w-[18px]',
    pill  : 'h-9 px-3 gap-2',
  }

  /* ── Icon with crossfade ───────────────────────────────────── */
  const iconClass = (visible) => `
    absolute inset-0 m-auto transition-all duration-300 ease-in-out
    ${visible
      ? 'opacity-100 rotate-0 scale-100'
      : 'opacity-0 rotate-90 scale-50'}
    ${sizes.icon}
  `

  return label ? (
    /* ── Pill variant (with text label) ─────────────────────── */
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`
        relative inline-flex items-center justify-center
        ${sizes.pill}
        rounded-xl border border-border
        bg-background text-foreground
        hover:bg-accent hover:border-primary/30
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        transition-all duration-200 select-none
        group font-medium text-sm
      `}
    >
      {/* Icon wrapper */}
      <span className={`relative shrink-0 ${sizes.icon}`}>
        <SunIcon  className={iconClass(!isDark)} />
        <MoonIcon className={iconClass(isDark)}  />
      </span>

      {/* Label */}
      <span className="transition-colors duration-200">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  ) : (
    /* ── Icon-only square variant (default for Navbar) ──────── */
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-theme={theme}
      className={`
        relative inline-flex items-center justify-center
        ${sizes.button}
        rounded-xl
        text-muted-foreground
        hover:text-foreground hover:bg-accent
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        transition-all duration-200 select-none
        group
      `}
    >
      {/* Animated icon container */}
      <span className={`relative block ${sizes.icon}`}>
        <SunIcon  className={iconClass(!isDark)} />
        <MoonIcon className={iconClass(isDark)}  />
      </span>

      {/*
        Tooltip — visible on hover via CSS only (no JS state).
        Hidden on mobile (touch has no hover).
      */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2
          px-2 py-1 rounded-lg bg-popover border border-border text-popover-foreground
          text-xs font-medium whitespace-nowrap shadow-md
          opacity-0 group-hover:opacity-100
          translate-y-1 group-hover:translate-y-0
          transition-all duration-200 delay-300
          hidden sm:block
        "
      >
        {isDark ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
  )
}

export default ThemeToggle