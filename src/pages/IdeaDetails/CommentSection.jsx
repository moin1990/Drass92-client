import { useState, useEffect, useCallback } from 'react'
import { Send, MessageSquare, RefreshCw }   from 'lucide-react'
import toast                                from 'react-hot-toast'
import CommentCard                          from '../../components/ui/CommentCard'
import EditCommentModal                     from '../../components/ui/EditCommentModal'
import ConfirmModal                         from '../../components/ui/ConfirmModal'
import LoadingSpinner                       from '../../components/ui/LoadingSpinner'
import { useAuth }                          from '../../context/AuthContext'
import useAxiosSecure                       from '../../hooks/useAxiosSecure'
import { buildAvatarUrl }                   from '../../lib/utils'

const MAX_COMMENT_LENGTH = 1000

const CommentSection = ({ ideaId }) => {
  const { user }    = useAuth()
  const axiosSecure = useAxiosSecure()

  /* ── Server state ───────────────────────────────────────────── */
  const [comments,   setComments]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState(null)

  /* ── Add comment ────────────────────────────────────────────── */
  const [newText,    setNewText]    = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* ── Edit modal ─────────────────────────────────────────────── */
  const [editTarget,  setEditTarget]  = useState(null)   // comment object
  const [editLoading, setEditLoading] = useState(false)

  /* ── Delete modal ───────────────────────────────────────────── */
  const [deleteTarget,  setDeleteTarget]  = useState(null)  // comment object
  const [deleteLoading, setDeleteLoading] = useState(false)

  /* ── Per-card busy state ────────────────────────────────────── */
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  /* ═══════════════════════════════════════════════════════════════
     FETCH
  ═══════════════════════════════════════════════════════════════ */
  const fetchComments = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const { data } = await axiosSecure.get(`/api/comments/${ideaId}`)
      setComments(
        (data.comments || []).map((c) => ({
          ...c,
          isOwn: c.authorEmail === user?.email,
        }))
      )
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not load comments.'
      setFetchError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [ideaId, axiosSecure, user?.email])

  useEffect(() => {
    if (ideaId) fetchComments()
  }, [ideaId, fetchComments])

  /* ═══════════════════════════════════════════════════════════════
     ADD COMMENT
  ═══════════════════════════════════════════════════════════════ */
  const handleAdd = async (e) => {
    e.preventDefault()

    const trimmed = newText.trim()
    if (!trimmed) {
      toast.error('Comment cannot be empty.')
      return
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment must be under ${MAX_COMMENT_LENGTH} characters.`)
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Posting comment…')

    try {
      const { data } = await axiosSecure.post('/api/comments', {
        ideaId,
        text: trimmed,
      })

      const posted = {
        ...data.comment,
        isOwn: true,
      }

      setComments((prev) => [posted, ...prev])
      setNewText('')
      toast.dismiss(toastId)
      toast.success('Comment posted successfully!')
    } catch (err) {
      toast.dismiss(toastId)
      const msg = err?.response?.data?.message || 'Failed to post comment.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     OPEN EDIT MODAL
  ═══════════════════════════════════════════════════════════════ */
  const handleOpenEdit = (comment) => {
    setEditTarget(comment)
  }

  /* ═══════════════════════════════════════════════════════════════
     SAVE EDIT
  ═══════════════════════════════════════════════════════════════ */
  const handleSaveEdit = async (newText) => {
    if (!editTarget) return

    const trimmed = newText.trim()
    if (!trimmed) {
      toast.error('Comment cannot be empty.')
      return
    }
    if (trimmed === editTarget.text.trim()) {
      // Nothing changed
      setEditTarget(null)
      toast('No changes detected.', { icon: 'ℹ️' })
      return
    }

    setEditLoading(true)
    setUpdatingId(editTarget._id)
    const toastId = toast.loading('Updating comment…')

    try {
      await axiosSecure.patch(`/api/comments/${editTarget._id}`, {
        text: trimmed,
      })

      setComments((prev) =>
        prev.map((c) =>
          c._id === editTarget._id
            ? { ...c, text: trimmed, updatedAt: new Date().toISOString() }
            : c
        )
      )

      toast.dismiss(toastId)
      toast.success('Comment updated successfully!')
      setEditTarget(null)
    } catch (err) {
      toast.dismiss(toastId)
      const msg = err?.response?.data?.message || 'Could not update comment.'
      toast.error(msg)
    } finally {
      setEditLoading(false)
      setUpdatingId(null)
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     OPEN DELETE CONFIRM
  ═══════════════════════════════════════════════════════════════ */
  const handleOpenDelete = (comment) => {
    setDeleteTarget(comment)
  }

  /* ═══════════════════════════════════════════════════════════════
     CONFIRM DELETE
  ═══════════════════════════════════════════════════════════════ */
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setDeleteLoading(true)
    setDeletingId(deleteTarget._id)
    const toastId = toast.loading('Deleting comment…')

    try {
      await axiosSecure.delete(`/api/comments/${deleteTarget._id}`)

      setComments((prev) => prev.filter((c) => c._id !== deleteTarget._id))
      toast.dismiss(toastId)
      toast.success('Comment deleted.')
      setDeleteTarget(null)
    } catch (err) {
      toast.dismiss(toastId)
      const msg = err?.response?.data?.message || 'Could not delete comment.'
      toast.error(msg)
    } finally {
      setDeleteLoading(false)
      setDeletingId(null)
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  const charLeft    = MAX_COMMENT_LENGTH - newText.length
  const nearLimit   = charLeft <= 100
  const atLimit     = charLeft <= 0
  const canSubmit   = newText.trim().length > 0 && !submitting && !atLimit

  return (
    <>
      <section aria-label="Discussion">

        {/* ── Section header ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground leading-none">
                Discussion
              </h2>
              {!loading && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {comments.length} comment{comments.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {!loading && comments.length > 0 && (
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                {comments.length}
              </span>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchComments}
            disabled={loading}
            aria-label="Refresh comments"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ── Add comment form ─────────────────────────────── */}
        <form
          onSubmit={handleAdd}
          className="mb-10"
          aria-label="Add a comment"
        >
          <div className="flex gap-3">

            {/* User avatar */}
            <img
              src={user?.photoURL || buildAvatarUrl(user?.displayName || 'U', 40)}
              alt={user?.displayName || 'You'}
              className="h-10 w-10 rounded-full border-2 border-border object-cover shrink-0 mt-0.5"
              onError={(e) => {
                e.target.src = buildAvatarUrl('U', 40)
              }}
            />

            <div className="flex-grow">
              {/* Textarea wrapper */}
              <div className={`
                relative rounded-2xl border transition-all duration-200
                ${submitting ? 'opacity-70' : ''}
                ${nearLimit && !atLimit ? 'border-amber-400' : ''}
                ${atLimit ? 'border-destructive' : ''}
                ${!nearLimit && !atLimit ? 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30' : ''}
              `}>
                <textarea
                  value={newText}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                      setNewText(e.target.value)
                    }
                  }}
                  placeholder="Share your thoughts, ask a question, or give feedback on this idea…"
                  rows={3}
                  disabled={submitting}
                  aria-label="New comment text"
                  className="w-full px-4 py-3.5 pr-14 bg-card rounded-2xl text-sm text-foreground
                    placeholder:text-muted-foreground resize-none outline-none
                    disabled:cursor-not-allowed bg-transparent"
                />

                {/* Character count badge */}
                {nearLimit && (
                  <span className={`
                    absolute bottom-3.5 right-14 text-xs font-semibold
                    ${atLimit ? 'text-destructive' : 'text-amber-500'}
                  `}>
                    {charLeft}
                  </span>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  aria-label="Post comment"
                  className={`
                    absolute right-3 bottom-3 p-2.5 rounded-xl
                    transition-all duration-200 shadow-sm
                    ${canSubmit
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-primary/25'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'}
                  `}
                >
                  {submitting ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Helper text */}
              <p className="text-xs text-muted-foreground mt-2 ml-1">
                Be constructive and respectful — help the author improve their idea.
              </p>
            </div>
          </div>
        </form>

        {/* ── Comment list ─────────────────────────────────── */}
        {loading ? (
          <LoadingSpinner size="sm" message="Loading comments…" />

        ) : fetchError ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-foreground mb-1">Could not load comments</p>
            <p className="text-sm text-muted-foreground mb-5">{fetchError}</p>
            <button
              onClick={fetchComments}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>

        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                isDeleting={deletingId === comment._id}
                isUpdating={updatingId === comment._id}
              />
            ))}
          </div>

        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl text-center px-6">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-bold text-foreground mb-1.5">
              No comments yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Be the first to share your thoughts on this idea. Your feedback
              could help shape the next big startup.
            </p>
          </div>
        )}
      </section>

      {/* ── Edit Comment Modal ─────────────────────────────── */}
      <EditCommentModal
        isOpen={!!editTarget}
        onClose={() => !editLoading && setEditTarget(null)}
        onSave={handleSaveEdit}
        comment={editTarget}
        loading={editLoading}
      />

      {/* ── Delete Confirm Modal ───────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete this comment?"
        description="Your comment will be permanently removed from this idea. Other users will no longer be able to see it."
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        variant="destructive"
      />
    </>
  )
}

export default CommentSection