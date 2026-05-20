import { Pencil, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import { formatRelativeTime, buildAvatarUrl }  from '../../lib/utils'

/**
 * CommentCard
 * ───────────
 * Displays a single comment with author info, text and timestamp.
 * Edit / Delete actions are shown only for the comment owner.
 * All state (modal open/close, loading) is managed by the parent.
 */
const CommentCard = ({
  comment,
  onEdit,           // (comment) => void — open edit modal
  onDelete,         // (comment) => void — open confirm modal
  isDeleting = false,
  isUpdating = false,
}) => {
  const isOwn     = comment.isOwn
  const isBusy    = isDeleting || isUpdating
  const wasEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt

  return (
    <article
      className={`
        group relative bg-card border border-border rounded-2xl p-5
        hover:border-primary/20 hover:shadow-sm
        transition-all duration-200
        ${isBusy ? 'opacity-60 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* ── Busy overlay spinner ───────────────────────────── */}
      {isBusy && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/40 backdrop-blur-[1px] z-10">
          <svg className="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      <div className="flex items-start gap-3">

        {/* ── Avatar ──────────────────────────────────────── */}
        <div className="relative shrink-0">
          <img
            src={comment.authorPhoto || buildAvatarUrl(comment.authorName, 40)}
            alt={comment.authorName}
            className="h-10 w-10 rounded-full border-2 border-border object-cover"
            onError={(e) => {
              e.target.src = buildAvatarUrl(comment.authorName || 'U', 40)
            }}
          />
          {/* Online-style dot for own comment */}
          {isOwn && (
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-card"
              title="Your comment"
            />
          )}
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        <div className="flex-grow min-w-0">

          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">

            {/* Author + badge + time */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground truncate">
                  {comment.authorName}
                </span>

                {isOwn && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    You
                  </span>
                )}
              </div>

              {/* Timestamp + edited badge */}
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  <time dateTime={comment.createdAt}>
                    {formatRelativeTime(comment.createdAt)}
                  </time>
                </div>

                {wasEdited && (
                  <span className="text-xs text-muted-foreground/60 italic">
                    · edited
                  </span>
                )}
              </div>
            </div>

            {/* ── Owner action buttons ────────────────────── */}
            {isOwn && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                {/* Edit */}
                <button
                  onClick={() => onEdit(comment)}
                  aria-label="Edit your comment"
                  title="Edit comment"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDelete(comment)}
                  aria-label="Delete your comment"
                  title="Delete comment"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ── Comment text ─────────────────────────────── */}
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line break-words">
            {comment.text}
          </p>
        </div>
      </div>
    </article>
  )
}

export default CommentCard