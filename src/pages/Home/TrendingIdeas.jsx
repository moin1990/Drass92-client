import { useState, useEffect } from 'react'
import { Link }                from 'react-router-dom'
import { TrendingUp, ArrowRight, RefreshCw } from 'lucide-react'
import axiosInstance  from '../../lib/axios'
import IdeaCard       from '../../components/ui/IdeaCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const TrendingIdeas = () => {
  const [ideas,   setIdeas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchTrending = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axiosInstance.get('/api/ideas/trending')
      setIdeas(data.ideas || [])
    } catch {
      setError('Could not load trending ideas.')
      setIdeas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrending() }, [])

  return (
    <section className="py-20 bg-background" aria-labelledby="trending-heading">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Hot Right Now
              </span>
            </div>
            <h2
              id="trending-heading"
              className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight"
            >
              Trending Ideas
            </h2>
            <p className="text-muted-foreground mt-2 text-base">
              The most discussed startup concepts from our community this week.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Refresh */}
            <button
              onClick={fetchTrending}
              disabled={loading}
              aria-label="Refresh trending ideas"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent border border-border transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/ideas"
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-3 transition-all duration-200 group"
            >
              View All Ideas
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Loading trending ideas…" />

        ) : error ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-foreground mb-2">{error}</p>
            <button
              onClick={fetchTrending}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>

        ) : ideas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>

        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-lg font-semibold text-foreground mb-2">No ideas yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Be the first to share a startup idea with the community.
            </p>
            <Link
              to="/add-idea"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/25 text-sm"
            >
              Share an Idea
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default TrendingIdeas