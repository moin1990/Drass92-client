import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link }                    from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast              from 'react-hot-toast'
import axiosInstance      from '../../lib/axios'
import IdeaCard           from '../../components/ui/IdeaCard'
import LoadingSpinner     from '../../components/ui/LoadingSpinner'
import PageTitle          from '../../components/shared/PageTitle'
import { CATEGORIES }     from '../../lib/mockData'

const LIMIT = 9

/* ── Debounce helper ──────────────────────────────────────────── */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const Ideas = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  /* ── URL-derived state ─────────────────────────────────────── */
  const urlSearch   = searchParams.get('search')   || ''
  const urlCategory = searchParams.get('category') || ''
  const urlPage     = parseInt(searchParams.get('page') || '1', 10)

  /* ── Local controlled inputs ───────────────────────────────── */
  const [searchInput, setSearchInput] = useState(urlSearch)
  const debouncedSearch               = useDebounce(searchInput, 400)

  /* ── Server state ──────────────────────────────────────────── */
  const [ideas,      setIdeas]      = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const abortRef = useRef(null)

  /* ── Sync debounced search → URL ───────────────────────────── */
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedSearch) next.set('search', debouncedSearch)
      else                 next.delete('search')
      next.set('page', '1')
      return next
    }, { replace: true })
  }, [debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Fetch ideas whenever URL params change ────────────────── */
  const fetchIdeas = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const params = { page: urlPage, limit: LIMIT }
      if (urlSearch)   params.search   = urlSearch
      if (urlCategory) params.category = urlCategory

      const { data } = await axiosInstance.get('/api/ideas', {
        params,
        signal: abortRef.current.signal,
      })

      setIdeas(data.ideas       || [])
      setTotal(data.total       || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      if (err.name === 'CanceledError') return // ignore abort
      setError('Failed to load ideas. Please try again.')
      toast.error('Could not fetch ideas. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [urlSearch, urlCategory, urlPage])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  /* ── Helpers ───────────────────────────────────────────────── */
  const setPage = (p) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', p)
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryChange = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('category', value)
      else       next.delete('category')
      next.set('page', '1')
      return next
    })
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const hasFilters = urlSearch || urlCategory

  /* ── Pagination range ──────────────────────────────────────── */
  const buildPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, urlPage, urlPage - 1, urlPage + 1])
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  }

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <>
      <PageTitle title="Browse Ideas" />

      <div className="min-h-screen bg-background">

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/8 to-violet-500/5 border-b border-border">
          <div className="container mx-auto px-4 py-14">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-2">
                Explore Ideas
              </h1>
              <p className="text-muted-foreground text-base mb-8">
                {loading
                  ? 'Loading ideas from our global community…'
                  : `${total} startup ${total === 1 ? 'idea' : 'ideas'} from our global community`}
              </p>

              {/* Search + Filter row */}
              <div className="flex flex-col sm:flex-row gap-3">

                {/* Search */}
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search ideas by title…"
                    aria-label="Search ideas"
                    className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                      transition-all shadow-sm"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <div className="relative">
                  <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <select
                    value={urlCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    aria-label="Filter by category"
                    className="w-full sm:w-auto pl-10 pr-8 py-3 bg-card border border-border rounded-xl
                      text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all
                      appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Clear */}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 border border-border
                      text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent
                      rounded-xl transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Grid ────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-10">

          {loading ? (
            <LoadingSpinner message="Fetching ideas…" />

          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong</h3>
              <p className="text-muted-foreground text-sm mb-6">{error}</p>
              <button
                onClick={fetchIdeas}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>

          ) : ideas.length > 0 ? (
            <>
              {/* Active filter badges */}
              {hasFilters && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="text-xs text-muted-foreground">Filters:</span>
                  {urlSearch && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      &quot;{urlSearch}&quot;
                      <button onClick={() => setSearchInput('')} aria-label="Remove search filter">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {urlCategory && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {urlCategory}
                      <button onClick={() => handleCategoryChange('')} aria-label="Remove category filter">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Ideas grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea) => (
                  <IdeaCard key={idea._id} idea={idea} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-14 flex-wrap">
                  <button
                    onClick={() => setPage(urlPage - 1)}
                    disabled={urlPage <= 1}
                    aria-label="Previous page"
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border text-sm
                      font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>

                  {buildPages().map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-1.5">
                      {/* Ellipsis */}
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-muted-foreground text-sm">…</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === urlPage ? 'page' : undefined}
                        className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                          p === urlPage
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                            : 'border border-border hover:bg-accent'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}

                  <button
                    onClick={() => setPage(urlPage + 1)}
                    disabled={urlPage >= totalPages}
                    aria-label="Next page"
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border text-sm
                      font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>

          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="text-6xl mb-5">🤔</div>
              <h3 className="text-xl font-bold text-foreground mb-2">No ideas found</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
                {hasFilters
                  ? 'No ideas match your current search or filters. Try adjusting them.'
                  : 'The community hasn\'t shared any ideas yet. Be the first!'}
              </p>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  to="/add-idea"
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/25"
                >
                  Share an Idea
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Ideas