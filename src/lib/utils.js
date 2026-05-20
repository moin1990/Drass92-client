import { clsx }    from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind class names safely.
 * Handles conditional classes and deduplication.
 */
export const cn = (...inputs) => twMerge(clsx(inputs))

/**
 * Formats a date string into "Jan 15, 2024".
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day  : 'numeric',
    year : 'numeric',
  })
}

/**
 * Returns a human-relative time string:
 * "just now", "5m ago", "3h ago", "2d ago", or formatted date.
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return ''

  const date      = new Date(dateString)
  const now       = new Date()
  const diffMs    = now - date

  if (isNaN(diffMs) || diffMs < 0) return formatDate(dateString)

  const diffSecs  = Math.floor(diffMs / 1000)
  const diffMins  = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays  = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSecs  <  60)  return 'just now'
  if (diffMins  <  60)  return `${diffMins}m ago`
  if (diffHours <  24)  return `${diffHours}h ago`
  if (diffDays  <   7)  return `${diffDays}d ago`
  if (diffWeeks <   4)  return `${diffWeeks}w ago`
  return formatDate(dateString)
}

/**
 * Returns up to 2 uppercase initials from a display name.
 * "John Doe" → "JD", "Alice" → "A"
 */
export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

/**
 * Builds a UI Avatars URL for a given name and pixel size.
 * Falls back gracefully when name is empty.
 */
export const buildAvatarUrl = (name = '', size = 40) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=7c3aed&color=fff&size=${size}&bold=true`