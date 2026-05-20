import { useState, useEffect, useCallback } from 'react'
import { Link }                             from 'react-router-dom'
import {
  MessageSquare, Pencil, Trash2,
  Check, X, ArrowRight, Clock, RefreshCw,
} from 'lucide-react'
import toast              from 'react-hot-toast'
import PageTitle          from '../../components/shared/PageTitle'
import LoadingSpinner     from '../../components/ui/LoadingSpinner'
import ConfirmModal       from '../../components/ui/ConfirmModal'
import EmptyState         from '../../components/ui/EmptyState'
import useAxiosSecure     from '../../hooks/useAxiosSecure'
import { CATEGORY_STYLES } from '../../lib/mockData'
import { formatRelativeTime } from '../../lib/utils'

const MyInteractions = () => {
  const axiosSecure = useAxiosSecure()

  const [comments,     setComments]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [editingId,    setEditingId]    = useState(null)
  const [editText,     setEditText]     = useState('')
  const [updatingId,   setUpdatingId]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  /* ── Fetch my comments ───────────────────────────────────────── */
  const fetchMyComments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axiosSecure.get('/api/comments/my')
      setComments(data.comments || [])
    } catch {
      setError('Failed to load your interactions.')
      toast.error('Could not fetch your comments.')
    } finally {
      setLoading(false)
    }
  }, [axiosSecure])

  useEffect(() => { fetchMyComments() }, [fetchMyComments])

  /* ── Start editing ───────────────────────────────────────────── */
  const startEdit = (comment) => {
    setEditingId(comment._id)
    setEditText(comment.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  /* ── Save edit ───────────────────────────────────────────────── */
  const handleSaveEdit = async (id) => {
    const trimmed = editText.trim()
    if (!trimmed)            return toast.error('Comment cannot be empty.')
    if (trimmed.length > 1000) return toast.error('Comment must be under 1000 characters.')

    setUpdatingId(id)
    try {
      await axiosSecure.patch(`/api/comments/${id}`, { text: trimmed })
      setComments((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, text: trimmed, updatedAt: new Date().toISOString() }
            : c
        )
      )
      toast.success('Comment updated.')
      setEditingId(null)
      setEditText('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update comment.')
    } finally {
      setUpdatingId(null)
    }
  }

  /* ── Delete comment ──────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const toastId = toast.loading('Deleting comment…')
    try {
      await axiosSecure.delete(`/api/comments/${deleteTarget}`)
      setComments((prev) => prev.filter((c) => c._id !== deleteTarget))
      toast.dismiss(toastId)
      toast.success('Comment deleted.')
      setDeleteTarget(null)
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(err?.response?.data?.message || 'Could not delete comment.')
    } finally {
      setDeleting(false)
    }
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <PageTitle title="My Interactions" />

      <div className="min-h-screen bg-background">

        {/* Page header */}
        <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-b border-border">
          <div className="container mx-auto px-4 py-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-primary/30 shrink-0">
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                    My Interactions
                  </h1>
                  <p className="text-muted-foreground mt-2 text-base">
                    {loading
                      ? 'Loading your activity…'
                      : `${comments.length} comment${comments.length !== 1 ? 's' : ''} you've left across the community`}
                  </p>
                </div>
              </div>

              <button
                onClick={fetchMyComments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent transition-colors disabled:opacity-50 shrink-0"
                aria-label="Refresh interactions"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {loading ? (
            <LoadingSpinner message="Loading your comments…" />

          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
              <div className="text-5xl">⚠️</div>
              <p className="text-lg font-bold text-foreground">{error}</p>
              <button
                onClick={fetchMyComments}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>

          ) : comments.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-4">

              {/* Stats summary */}
              <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {comments.length} total comment{comments.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    across {new Set(comments.map((c) => c.ideaId)).size} idea{new Set(comments.map((c) => c.ideaId)).size !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  to="/ideas"
                  className="ml-auto text-xs font-semibold text-primary hover:underline underline-offset-2"
                >
                  Discover more ideas →
                </Link>
              </div>

              {/* Comment list */}
              {comments.map((item) => {
                const catStyle  = CATEGORY_STYLES[item.ideaCategory] || CATEGORY_STYLES['Other']
                const isEditing = editingId === item._id
                const isSaving  = updatingId === item._id

                return (
                  <article
                    key={item._id}
                    className={`bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-all group ${
                      isSaving ? 'opacity-60' : 'opacity-100'
                    }`}
                  >
                    {/* Header: idea link + actions */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${catStyle}`}>
                          {item.ideaCategory}
                        </span>
                        <Link
                          to={`/idea/${item.ideaId}`}
                          className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate flex items-center gap-1 group/link"
                        >
                          <span className="truncate">{item.ideaTitle}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      </div>

                      {/* Edit / delete — hide while editing */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => startEdit(item)}
                            aria-label="Edit comment"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item._id)}
                            aria-label="Delete comment"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comment body */}
                    <div className="pl-1">
                      {isEditing ? (
                        /* ── Edit mode ── */
                        <div className="space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            autoFocus
                            maxLength={1000}
                            disabled={isSaving}
                            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm
                              resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                              transition-all disabled:opacity-60"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(item._id)}
                              disabled={!editText.trim() || isSaving}
                              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground
                                text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                              {isSaving ? (
                                <>
                                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                  </svg>
                                  Saving…
                                </>
                              ) : (
                                <><Check className="h-3.5 w-3.5" /> Save Changes</>
                              )}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isSaving}
                              className="flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-medium
                                rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" /> Cancel
                            </button>
                            <span className={`ml-auto text-xs ${editText.length >= 900 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {editText.length}/1000
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* ── View mode ── */
                        <>
                          <p className="text-sm text-foreground/85 leading-relaxed mb-3">
                            {item.text}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatRelativeTime(item.createdAt)}</span>
                            {item.updatedAt && item.updatedAt !== item.createdAt && (
                              <span className="text-muted-foreground/60">(edited)</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>

          ) : (
            <EmptyState
              emoji="💬"
              title="No interactions yet"
              description="You haven't commented on any ideas yet. Browse the community's ideas and start engaging."
              cta={{ label: 'Browse Ideas', to: '/ideas' }}
            />
          )}
        </div>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this comment?"
        description="Your comment will be permanently removed from the idea. This action cannot be undone."
        confirmLabel="Delete Comment"
        cancelLabel="Keep Comment"
      />
    </>
  )
}

export default MyInteractions