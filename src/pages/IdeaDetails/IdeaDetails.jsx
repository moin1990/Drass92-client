import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate }     from 'react-router-dom'
import {
  ArrowLeft, Calendar, MessageSquare,
  Bookmark, BookmarkCheck, DollarSign,
  Target, Users, Tag, Lightbulb,
  AlertCircle, Share2,
} from 'lucide-react'
import toast              from 'react-hot-toast'
import PageTitle          from '../../components/shared/PageTitle'
import LoadingSpinner     from '../../components/ui/LoadingSpinner'
import CommentSection     from './CommentSection'
import { useAuth }        from '../../context/AuthContext'
import useAxiosSecure     from '../../hooks/useAxiosSecure'
import { CATEGORY_STYLES } from '../../lib/mockData'
import { formatDate, buildAvatarUrl } from '../../lib/utils'

/* ── Reusable detail section box ─────────────────────────────── */
const InfoSection = ({ icon: Icon, title, children, accent = false }) => (
  <div className={`p-5 rounded-2xl border ${
    accent
      ? 'bg-primary/5 border-primary/20'
      : 'bg-card border-border'
  }`}>
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
        accent ? 'bg-primary/15' : 'bg-muted'
      }`}>
        <Icon className={`h-4 w-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <h3 className="font-bold text-foreground text-sm">{title}</h3>
    </div>
    {children}
  </div>
)

const IdeaDetails = () => {
  const { id }      = useParams()
  const { user }    = useAuth()
  const axiosSecure = useAxiosSecure()
  const navigate    = useNavigate()

  /* ── Idea state ─────────────────────────────────────────────── */
  const [idea,        setIdea]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  /* ── Bookmark state ─────────────────────────────────────────── */
  const [bookmarked,  setBookmarked]  = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  /* ── Fetch idea ─────────────────────────────────────────────── */
  const fetchIdea = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axiosSecure.get(`/api/ideas/${id}`)
      setIdea(data.idea)
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        setError('This idea does not exist or has been removed.')
      } else if (status === 401) {
        setError('You must be logged in to view this idea.')
      } else {
        setError('Failed to load this idea. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [id, axiosSecure])

  useEffect(() => { fetchIdea() }, [fetchIdea])

  /* ── Bookmark toggle ────────────────────────────────────────── */
  const handleBookmark = async () => {
    if (bookmarking) return

    setBookmarking(true)
    try {
      if (bookmarked) {
        await axiosSecure.delete(`/api/bookmarks/${id}`)
        setBookmarked(false)
        setIdea((prev) => ({
          ...prev,
          bookmarkCount: Math.max(0, (prev.bookmarkCount || 1) - 1),
        }))
        toast.success('Bookmark removed.')
      } else {
        await axiosSecure.post('/api/bookmarks', { ideaId: id })
        setBookmarked(true)
        setIdea((prev) => ({
          ...prev,
          bookmarkCount: (prev.bookmarkCount || 0) + 1,
        }))
        toast.success('Idea bookmarked! 🔖')
      }
    } catch (err) {
      const msg = err?.response?.data?.message
      if (msg === 'Already bookmarked.') {
        setBookmarked(true)
        toast('Already bookmarked.', { icon: '🔖' })
      } else {
        toast.error(msg || 'Could not update bookmark.')
      }
    } finally {
      setBookmarking(false)
    }
  }

  /* ── Share ──────────────────────────────────────────────────── */
  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: idea?.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      }
    } catch {
      toast.error('Could not share this idea.')
    }
  }

  /* ── Loading / Error ────────────────────────────────────────── */
  if (loading) {
    return (
      <>
        <PageTitle title="Loading Idea…" />
        <LoadingSpinner fullScreen message="Loading idea…" />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="Error" />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-6">
          <div className="text-6xl">😕</div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchIdea}
              className="px-5 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/ideas"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all"
            >
              Back to Ideas
            </Link>
          </div>
        </div>
      </>
    )
  }

  const categoryStyle = CATEGORY_STYLES[idea.category] || CATEGORY_STYLES['Other']
  const isOwner       = idea.authorEmail === user?.email

  return (
    <>
      <PageTitle title={idea.title} />

      <div className="min-h-screen bg-background">

        {/* ── Hero ────────────────────────────────────────── */}
        <div className="relative">
          {idea.imageURL ? (
            <div className="h-72 md:h-80 overflow-hidden">
              <img
                src={idea.imageURL}
                alt={idea.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          ) : (
            <div className="h-52 bg-gradient-to-br from-primary/8 via-violet-500/8 to-indigo-500/5 border-b border-border relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, hsl(var(--primary)/0.4) 1px, transparent 0)',
                  backgroundSize: '28px 28px',
                }}
                aria-hidden="true"
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-6xl select-none">
                💡
              </div>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-10">

          {/* Back navigation */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ════════════════════════════════════════════
                Main Column
            ════════════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-8">

              {/* Title block */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryStyle}`}>
                    {idea.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(idea.createdAt)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {idea.commentCount || 0} comments
                  </div>
                  {isOwner && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      Your Idea
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
                  {idea.title}
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {idea.shortDescription}
                </p>
              </div>

              {/* Detailed description */}
              {idea.detailedDescription && (
                <InfoSection icon={Lightbulb} title="Overview">
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {idea.detailedDescription}
                  </p>
                </InfoSection>
              )}

              {/* Problem + Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoSection icon={AlertCircle} title="The Problem">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {idea.problemStatement}
                  </p>
                </InfoSection>
                <InfoSection icon={Lightbulb} title="The Solution" accent>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {idea.proposedSolution}
                  </p>
                </InfoSection>
              </div>

              {/* Tags */}
              {idea.tags?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/ideas?search=${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-xl font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner banner */}
              {isOwner && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                    <span>✨</span>
                    <span>You posted this idea.</span>
                  </div>
                  <Link
                    to="/my-ideas"
                    className="sm:ml-auto px-4 py-2 text-sm font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors w-fit"
                  >
                    Manage in My Ideas →
                  </Link>
                </div>
              )}

              {/* ── Comment Section ────────────────────────── */}
              <div className="border-t border-border pt-10">
                <CommentSection ideaId={idea._id?.toString()} />
              </div>
            </div>

            {/* ════════════════════════════════════════════
                Sidebar
            ════════════════════════════════════════════ */}
            <aside className="space-y-5">

              {/* Author card */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Posted By
                </h3>
                <div className="flex items-center gap-3">
                  <img
                    src={idea.authorPhoto || buildAvatarUrl(idea.authorName, 48)}
                    alt={idea.authorName}
                    className="h-12 w-12 rounded-full border-2 border-border object-cover"
                    onError={(e) => { e.target.src = buildAvatarUrl('A', 48) }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">
                      {idea.authorName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {idea.authorEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Idea details */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Details
                </h3>

                {idea.targetAudience && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Target Audience
                      </p>
                      <p className="text-sm text-foreground leading-snug">
                        {idea.targetAudience}
                      </p>
                    </div>
                  </div>
                )}

                {idea.estimatedBudget && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Estimated Budget
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {idea.estimatedBudget}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Discussions
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {idea.commentCount || 0} comments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Bookmark className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Bookmarks
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {idea.bookmarkCount || 0} saves
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                {!isOwner && (
                  <button
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this idea'}
                    className={`
                      w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl
                      transition-all text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed
                      ${bookmarked
                        ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 hover:scale-105 active:scale-100'}
                    `}
                  >
                    {bookmarked
                      ? <><BookmarkCheck className="h-4 w-4" /> Bookmarked</>
                      : bookmarking
                      ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Saving…
                          </>
                        )
                      : <><Bookmark className="h-4 w-4" /> Bookmark Idea</>
                    }
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-accent transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  Share Idea
                </button>

                <Link
                  to={`/ideas?category=${encodeURIComponent(idea.category)}`}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-accent transition-colors text-sm"
                >
                  <Target className="h-4 w-4 text-muted-foreground" />
                  More {idea.category} Ideas
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

export default IdeaDetails