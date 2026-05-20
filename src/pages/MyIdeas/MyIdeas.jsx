import { useState, useEffect, useCallback } from 'react'
import { Link }                             from 'react-router-dom'
import {
  Pencil, Trash2, Plus, Eye,
  Calendar, MessageSquare, Bookmark, RefreshCw,
} from 'lucide-react'
import toast              from 'react-hot-toast'
import PageTitle          from '../../components/shared/PageTitle'
import LoadingSpinner     from '../../components/ui/LoadingSpinner'
import ConfirmModal       from '../../components/ui/ConfirmModal'
import UpdateIdeaModal    from '../../components/ui/UpdateIdeaModal'
import EmptyState         from '../../components/ui/EmptyState'
import useAxiosSecure     from '../../hooks/useAxiosSecure'
import { CATEGORY_STYLES } from '../../lib/mockData'
import { formatDate }      from '../../lib/utils'

const MyIdeas = () => {
  const axiosSecure = useAxiosSecure()

  const [ideas,        setIdeas]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)   // idea._id
  const [updateTarget, setUpdateTarget] = useState(null)   // full idea object
  const [deleting,     setDeleting]     = useState(false)
  const [updating,     setUpdating]     = useState(false)

  /* ── Fetch my ideas ──────────────────────────────────────────── */
  const fetchMyIdeas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axiosSecure.get('/api/ideas/my')
      setIdeas(data.ideas || [])
    } catch {
      setError('Failed to load your ideas. Please try again.')
      toast.error('Could not fetch your ideas.')
    } finally {
      setLoading(false)
    }
  }, [axiosSecure])

  useEffect(() => { fetchMyIdeas() }, [fetchMyIdeas])

  /* ── Delete idea ─────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const toastId = toast.loading('Deleting idea…')
    try {
      await axiosSecure.delete(`/api/ideas/${deleteTarget}`)
      setIdeas((prev) => prev.filter((i) => i._id !== deleteTarget))
      toast.dismiss(toastId)
      toast.success('Idea deleted successfully.')
      setDeleteTarget(null)
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(err?.response?.data?.message || 'Could not delete idea.')
    } finally {
      setDeleting(false)
    }
  }

  /* ── Update idea ─────────────────────────────────────────────── */
  const handleUpdate = async (formData) => {
    if (!updateTarget) return
    setUpdating(true)
    const toastId = toast.loading('Saving changes…')
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      }
      await axiosSecure.patch(`/api/ideas/${updateTarget._id}`, payload)
      setIdeas((prev) =>
        prev.map((i) =>
          i._id === updateTarget._id
            ? { ...i, ...payload, updatedAt: new Date().toISOString() }
            : i
        )
      )
      toast.dismiss(toastId)
      toast.success('Idea updated successfully!')
      setUpdateTarget(null)
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(err?.response?.data?.message || 'Could not update idea.')
    } finally {
      setUpdating(false)
    }
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <PageTitle title="My Ideas" />

      <div className="min-h-screen bg-background">

        {/* Page header */}
        <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-b border-border">
          <div className="container mx-auto px-4 py-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                  My Ideas
                </h1>
                <p className="text-muted-foreground mt-2 text-base">
                  {loading
                    ? 'Loading your ideas…'
                    : `${ideas.length} idea${ideas.length !== 1 ? 's' : ''} you've shared with the community`}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={fetchMyIdeas}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
                  aria-label="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <Link
                  to="/add-idea"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/25 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  New Idea
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {loading ? (
            <LoadingSpinner message="Loading your ideas…" />

          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
              <div className="text-5xl">⚠️</div>
              <p className="text-lg font-bold text-foreground">{error}</p>
              <button
                onClick={fetchMyIdeas}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>

          ) : ideas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => {
                const catStyle = CATEGORY_STYLES[idea.category] || CATEGORY_STYLES['Other']

                return (
                  <article
                    key={idea._id}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col"
                  >
                    {/* Thumbnail */}
                    {idea.imageURL ? (
                      <div className="h-40 overflow-hidden bg-muted shrink-0">
                        <img
                          src={idea.imageURL}
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    ) : (
                      <div className="h-40 shrink-0 bg-gradient-to-br from-primary/5 to-violet-500/10 flex items-center justify-center">
                        <span className="text-4xl">💡</span>
                      </div>
                    )}

                    <div className="flex flex-col flex-grow p-5">
                      {/* Category + Date */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${catStyle}`}>
                          {idea.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(idea.createdAt)}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 mb-2 flex-grow">
                        {idea.title}
                      </h3>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {idea.commentCount || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bookmark className="h-3.5 w-3.5" />
                          {idea.bookmarkCount || 0}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                        <Link
                          to={`/idea/${idea._id}`}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                        <button
                          onClick={() => setUpdateTarget(idea)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(idea._id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

          ) : (
            <EmptyState
              emoji="💡"
              title="No ideas yet"
              description="You haven't shared any ideas with the community yet. Start by creating your first startup idea."
              cta={{ label: 'Share Your First Idea', to: '/add-idea' }}
            />
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this idea?"
        description="This will permanently delete your idea along with all its comments and bookmarks. This action cannot be undone."
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Keep Idea"
      />

      {/* Update idea modal */}
      <UpdateIdeaModal
        isOpen={!!updateTarget}
        onClose={() => !updating && setUpdateTarget(null)}
        idea={updateTarget}
        onSave={handleUpdate}
        loading={updating}
      />
    </>
  )
}

export default MyIdeas