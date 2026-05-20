import { useState, useEffect, useRef } from 'react'
import { createPortal }                from 'react-dom'
import { X, Pencil, Check }            from 'lucide-react'

const MAX_LENGTH = 1000

const EditCommentModal = ({
  isOpen,
  onClose,
  onSave,
  comment,
  loading = false,
}) => {
  const [text,        setText]        = useState('')
  const [charWarning, setCharWarning] = useState(false)
  const textareaRef                   = useRef(null)

  /* ── Populate on open ─────────────────────────────────────── */
  useEffect(() => {
    if (isOpen && comment?.text) {
      setText(comment.text)
      setCharWarning(false)
    }
  }, [isOpen, comment])

  /* ── Auto-focus textarea ──────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
        // Place cursor at end
        const len = textareaRef.current?.value?.length || 0
        textareaRef.current?.setSelectionRange(len, len)
      }, 80)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  /* ── Escape key + scroll lock ─────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handler = (e) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handler)
    }
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleChange = (e) => {
    const val = e.target.value
    if (val.length <= MAX_LENGTH) {
      setText(val)
      setCharWarning(val.length >= MAX_LENGTH - 100)
    }
  }

  const handleSave = () => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    onSave(trimmed)
  }

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter → save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  const isDirty   = text.trim() !== (comment?.text || '').trim()
  const canSubmit = text.trim().length > 0 && isDirty && !loading

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-comment-title"
    >
      {/* ── Backdrop ────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      {/* ── Modal panel ─────────────────────────────────────── */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 w-full max-w-lg z-10 overflow-hidden animate-fade-in">

        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pencil className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2
                id="edit-comment-title"
                className="text-base font-extrabold text-foreground"
              >
                Edit Comment
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your comment below
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            aria-label="Close edit modal"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Textarea ────────────────────────────────────── */}
        <div className="px-6 py-5">
          <label
            htmlFor="edit-comment-textarea"
            className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2"
          >
            Your Comment
          </label>

          <div className="relative">
            <textarea
              id="edit-comment-textarea"
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={5}
              disabled={loading}
              placeholder="Write something thoughtful…"
              className={`
                w-full px-4 py-3.5 bg-background border rounded-xl text-sm
                text-foreground placeholder:text-muted-foreground
                resize-none focus:outline-none focus:ring-2 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
                ${charWarning
                  ? 'border-amber-400 focus:ring-amber-400/40'
                  : 'border-border focus:ring-primary/40 focus:border-primary'}
              `}
            />

            {/* Character counter */}
            <div className={`
              absolute bottom-3 right-3 text-xs font-semibold transition-colors
              ${text.length >= MAX_LENGTH
                ? 'text-destructive'
                : charWarning
                ? 'text-amber-500'
                : 'text-muted-foreground/50'}
            `}>
              {text.length}/{MAX_LENGTH}
            </div>
          </div>

          {/* Changed indicator */}
          {isDirty && !loading && (
            <p className="text-xs text-primary mt-2 ml-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
              Unsaved changes
            </p>
          )}

          {/* Keyboard shortcut hint */}
          <p className="text-xs text-muted-foreground mt-2 ml-1">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              Ctrl+Enter
            </kbd>
            {' '}to save quickly.
          </p>
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="px-5 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit}
            className={`
              flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl
              transition-all shadow-md disabled:cursor-not-allowed
              ${canSubmit
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 hover:scale-105 active:scale-100'
                : 'bg-primary/40 text-primary-foreground/60 shadow-none'}
            `}
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default EditCommentModal