import { useState, useEffect, useCallback } from 'react'
import { Link }                              from 'react-router-dom'
import { ChevronLeft, ChevronRight }         from 'lucide-react'

const SLIDES = [
  {
    id       : 1,
    badge    : '🚀 Join 10,000+ Innovators Worldwide',
    title    : 'Turn Your Startup Dreams Into Reality',
    subtitle : 'Share innovative ideas with a global community of builders, thinkers, and creators. Get real feedback and take your first step toward launching.',
    cta      : { label: 'Explore Ideas',    to: '/ideas'    },
    secondary: { label: 'Share Your Idea',  to: '/add-idea' },
    gradient : 'from-violet-600 via-purple-600 to-indigo-700',
    emoji    : '🚀',
    stat1    : { value: '10K+',  label: 'Innovators' },
    stat2    : { value: '500+',  label: 'Ideas / Week' },
    stat3    : { value: '80+',   label: 'Countries' },
  },
  {
    id       : 2,
    badge    : '🌍 Ideas from 80+ Countries',
    title    : 'Collaborate With Global Innovators',
    subtitle : 'Discover breakthrough ideas across industries — from AI breakthroughs to sustainable solutions. Connect with like-minded founders and shape the future together.',
    cta      : { label: 'Browse Ideas',    to: '/ideas'    },
    secondary: { label: 'Get Started Free', to: '/register' },
    gradient : 'from-blue-600 via-indigo-600 to-violet-600',
    emoji    : '🌍',
    stat1    : { value: '98%',   label: 'Satisfaction' },
    stat2    : { value: '12K+',  label: 'Comments' },
    stat3    : { value: '4.9★',  label: 'Rating' },
  },
  {
    id       : 3,
    badge    : '💡 Validate Before You Build',
    title    : 'Smart Ideas Beat Big Budgets',
    subtitle : 'Use real community feedback to test assumptions, identify market gaps, and refine your value proposition — before spending a single dollar on development.',
    cta      : { label: 'Start Sharing',  to: '/add-idea' },
    secondary: { label: 'See Trending',  to: '/ideas'    },
    gradient : 'from-teal-600 via-emerald-600 to-green-600',
    emoji    : '💡',
    stat1    : { value: '$0',    label: 'To Start' },
    stat2    : { value: '< 2min', label: 'To Submit' },
    stat3    : { value: '24/7',  label: 'Community' },
  },
]

const Banner = () => {
  const [current,      setCurrent]      = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const goTo = useCallback((index) => {
    if (transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setCurrent(index)
      setTransitioning(false)
    }, 250)
  }, [transitioning])

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo])
  const prev = ()                => goTo((current - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const slide = SLIDES[current]

  return (
    <section
      className={`relative bg-gradient-to-br ${slide.gradient} text-white overflow-hidden transition-all duration-700`}
      aria-label="Hero banner"
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-white/3 blur-2xl" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
      </div>

      <div className="container mx-auto px-4 py-28 md:py-36 relative z-10">
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-300 ${
            transitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-sm font-semibold border border-white/20 shadow-lg">
            {slide.badge}
          </span>

          {/* Emoji */}
          <div className="text-7xl md:text-8xl mb-6 drop-shadow-lg">{slide.emoji}</div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            {slide.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to={slide.cta.to}
              className="w-full sm:w-auto px-8 py-4 bg-white text-purple-700 font-extrabold rounded-2xl hover:bg-white/95 hover:scale-105 active:scale-100 transition-all duration-200 shadow-xl shadow-black/20 text-base"
            >
              {slide.cta.label}
            </Link>
            <Link
              to={slide.secondary.to}
              className="w-full sm:w-auto px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/80 transition-all duration-200 text-base"
            >
              {slide.secondary.label}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {[slide.stat1, slide.stat2, slide.stat3].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">
                  {stat.value}
                </div>
                <div className="text-xs text-white/70 mt-1 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-16">
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-all hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? 'w-10 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}

          <button
            onClick={next}
            aria-label="Next slide"
            className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-all hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default Banner