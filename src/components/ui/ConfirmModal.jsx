import { useEffect }            from 'react'
import { createPortal }         from 'react-dom'
import { AlertTriangle, X }     from 'lucide-react'

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title        = 'Are you sure?',
  description  = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel  = 'Cancel',
  loading      = false,
  variant      = 'destructive',   // 'destructive' | 'warning'
}) => {

  /* ── Escape + scroll lock ─────────────────────────────────── */
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

  const isDestructive = variant === 'destructive'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 w-full max-w-sm z-10 overflow-hidden animate-fade-in">

        {/* Top accent */}
        <div className={`h-1 ${isDestructive ? 'bg-destructive' : 'bg-amber-500'}`} />

        {/* Close button */}
        <button
          onClick={() => !loading && onClose()}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 flex flex-col items-center text-center gap-5">

          {/* Icon */}
          <div className={`
            h-16 w-16 rounded-2xl flex items-center justify-center
            ${isDestructive
              ? 'bg-destructive/10 ring-4 ring-destructive/10'
              : 'bg-amber-500/10 ring-4 ring-amber-500/10'}
          `}>
            <AlertTriangle className={`h-8 w-8 ${isDestructive ? 'text-destructive' : 'text-amber-500'}`} />
          </div>

          {/* Text */}
          <div>
            <h2
              id="confirm-modal-title"
              className="text-lg font-extrabold text-foreground mb-2"
            >
              {title}
            </h2>
            <p
              id="confirm-modal-desc"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {description}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="flex-1 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`
                flex-1 flex items-center justify-center gap-2
                py-2.5 text-sm font-bold rounded-xl transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
                ${isDestructive
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-amber-500 text-white hover:bg-amber-600'}
                shadow-md
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
                  Deleting…
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmModal