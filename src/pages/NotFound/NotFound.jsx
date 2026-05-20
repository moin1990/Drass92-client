import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Search } from 'lucide-react'
import PageTitle from '../../components/shared/PageTitle'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <>
      <PageTitle title="404 – Page Not Found" />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-lg mx-auto">

          {/* Illustration */}
          <div className="relative mb-8 inline-block">
            <div className="text-[120px] leading-none select-none">🔍</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-black/5 dark:bg-white/5 rounded-full blur-sm" />
          </div>

          {/* 404 */}
          <h1 className="text-8xl font-extrabold text-primary mb-2 tracking-tighter">
            404
          </h1>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
            Page Not Found
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-10 text-base max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-xl hover:bg-accent text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-sm transition-all shadow-md shadow-primary/25"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              to="/ideas"
              className="flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-xl hover:bg-accent text-sm transition-colors"
            >
              <Search className="h-4 w-4" />
              Browse Ideas
            </Link>
          </div>

          {/* Quick links */}
          <div className="border-t border-border pt-8">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest font-semibold">
              Quick Links
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { to: '/',                label: 'Home'            },
                { to: '/ideas',           label: 'Browse Ideas'    },
                { to: '/add-idea',        label: 'Submit an Idea'  },
                { to: '/my-ideas',        label: 'My Ideas'        },
                { to: '/my-interactions', label: 'My Interactions' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-primary bg-muted hover:bg-primary/10 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFound