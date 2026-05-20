import { Link }        from 'react-router-dom'
import SectionHeader   from '../../components/ui/SectionHeader'

const STEPS = [
  {
    step       : '01',
    icon       : '👤',
    title      : 'Create Your Account',
    description: 'Sign up in seconds with your email or Google account. No credit card, no commitment.',
    color      : 'bg-violet-500',
  },
  {
    step       : '02',
    icon       : '💡',
    title      : 'Submit Your Idea',
    description: 'Fill in structured fields covering your problem, solution, audience, and category.',
    color      : 'bg-blue-500',
  },
  {
    step       : '03',
    icon       : '💬',
    title      : 'Gather Feedback',
    description: 'The community comments, challenges assumptions, and helps you see blind spots.',
    color      : 'bg-emerald-500',
  },
  {
    step       : '04',
    icon       : '🚀',
    title      : 'Iterate & Launch',
    description: 'Use insights to improve, find co-founders, and take the leap toward building.',
    color      : 'bg-orange-500',
  },
]

const HowItWorks = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <SectionHeader
        badge="Simple Process"
        title="How IdeaVault Works"
        description="From idea to validation in four simple steps — no experience required, no gatekeeping."
      />

      <div className="relative">
        {/* Connecting line (desktop only) */}
        <div
          className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5"
          style={{ background: 'linear-gradient(to right, transparent, hsl(var(--primary)/0.3), hsl(var(--primary)), hsl(var(--primary)/0.3), transparent)' }}
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, idx) => (
            <div key={step.step} className="relative flex flex-col items-center text-center group">
              {/* Step circle */}
              <div className={`relative z-10 h-24 w-24 rounded-3xl bg-gradient-to-br ${
                idx === 0 ? 'from-violet-400 to-violet-600' :
                idx === 1 ? 'from-blue-400 to-blue-600' :
                idx === 2 ? 'from-emerald-400 to-emerald-600' :
                            'from-orange-400 to-orange-600'
              } flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-4xl">{step.icon}</span>
                <span className={`absolute -top-2 -right-2 h-7 w-7 rounded-full ${step.color} text-white text-xs font-extrabold flex items-center justify-center shadow-lg`}>
                  {idx + 1}
                </span>
              </div>

              <h3 className="font-bold text-foreground mb-2 text-base">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16">
        <Link
          to="/register"
          className="px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-extrabold rounded-2xl hover:from-violet-500 hover:to-purple-500 hover:scale-105 active:scale-100 transition-all duration-200 shadow-xl shadow-primary/30 text-base"
        >
          Get Started — It&apos;s Free 🚀
        </Link>
        <Link
          to="/ideas"
          className="px-10 py-4 border-2 border-border text-foreground font-semibold rounded-2xl hover:bg-accent hover:border-primary/30 transition-all duration-200 text-base"
        >
          Browse Ideas First
        </Link>
      </div>
    </div>
  </section>
)

export default HowItWorks