import { Link } from 'react-router-dom'

const EmptyState = ({ emoji = '🌱', title, description, cta }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-4">
    <div className="text-6xl mb-5 animate-bounce">{emoji}</div>
    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
    {description && (
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">
        {description}
      </p>
    )}
    {cta && (
      <Link
        to={cta.to}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/25 text-sm"
      >
        {cta.label}
      </Link>
    )}
  </div>
)

export default EmptyState