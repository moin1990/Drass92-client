import { Link }             from 'react-router-dom'
import { MessageSquare, Calendar, ArrowRight, Bookmark } from 'lucide-react'
import { formatDate, buildAvatarUrl }  from '../../lib/utils'
import { CATEGORY_STYLES }  from '../../lib/mockData'

const IdeaCard = ({ idea }) => {
  const categoryStyle = CATEGORY_STYLES[idea.category] || CATEGORY_STYLES['Other']

  return (
    <article className="group flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:border-primary/30 transition-all duration-300">

      {/* ── Thumbnail ─────────────────────────────── */}
      {idea.imageURL ? (
        <div className="h-44 overflow-hidden bg-muted shrink-0">
          <img
            src={idea.imageURL}
            alt={idea.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="h-44 shrink-0 bg-gradient-to-br from-primary/5 via-primary/10 to-violet-500/10 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5" />
          <span className="text-5xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
            💡
          </span>
        </div>
      )}

      {/* ── Content ───────────────────────────────── */}
      <div className="flex flex-col flex-grow p-5">

        {/* Category + Date */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryStyle}`}>
            {idea.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(idea.createdAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-foreground text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {idea.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-grow">
          {idea.shortDescription}
        </p>

        {/* Tags */}
        {idea.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {idea.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-lg font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-border">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={idea.authorPhoto || buildAvatarUrl(idea.authorName, 28)}
              alt={idea.authorName}
              className="h-7 w-7 rounded-full border border-border object-cover shrink-0"
              onError={(e) => { e.target.src = buildAvatarUrl('A', 28) }}
            />
            <span className="text-xs text-muted-foreground font-medium truncate">
              {idea.authorName}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Comment count */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground" title={`${idea.commentCount || 0} comments`}>
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{idea.commentCount || 0}</span>
            </div>

            {/* Bookmark count */}
            {(idea.bookmarkCount || 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title={`${idea.bookmarkCount} bookmarks`}>
                <Bookmark className="h-3.5 w-3.5" />
                <span>{idea.bookmarkCount}</span>
              </div>
            )}

            {/* View Details */}
            <Link
              to={`/idea/${idea._id}`}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all duration-200 group/btn"
            >
              View
              <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default IdeaCard