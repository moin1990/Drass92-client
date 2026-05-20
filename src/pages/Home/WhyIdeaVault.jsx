import SectionHeader from '../../components/ui/SectionHeader'

const FEATURES = [
  {
    emoji      : '🧠',
    title      : 'Idea Validation',
    description: 'Submit your concept and receive real feedback from a community of entrepreneurs, developers, and investors before writing a line of code.',
    color      : 'from-violet-500/10 to-purple-500/10 border-violet-200/50 dark:border-violet-800/30',
  },
  {
    emoji      : '🤝',
    title      : 'Community Collaboration',
    description: 'Connect with co-founders, mentors, and early adopters who share your passion for building products that matter.',
    color      : 'from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-800/30',
  },
  {
    emoji      : '🔍',
    title      : 'Smart Discovery',
    description: 'Find ideas instantly by searching titles or filtering by category, date, and engagement to discover what excites your market.',
    color      : 'from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-800/30',
  },
  {
    emoji      : '📊',
    title      : 'Trending Insights',
    description: 'Our engagement algorithm surfaces the most discussed ideas so you always know where community momentum is building.',
    color      : 'from-orange-500/10 to-amber-500/10 border-orange-200/50 dark:border-orange-800/30',
  },
  {
    emoji      : '🔒',
    title      : 'Secure & Private',
    description: 'Firebase Auth and JWT tokens in httpOnly cookies protect every interaction. Your data is never sold to advertisers.',
    color      : 'from-slate-500/10 to-gray-500/10 border-slate-200/50 dark:border-slate-800/30',
  },
  {
    emoji      : '🌍',
    title      : 'Global Reach',
    description: 'Join thousands of innovators from 80+ countries sharing breakthrough ideas across every industry imaginable.',
    color      : 'from-pink-500/10 to-rose-500/10 border-pink-200/50 dark:border-pink-800/30',
  },
]

const WhyIdeaVault = () => (
  <section className="py-20 bg-muted/20 border-y border-border">
    <div className="container mx-auto px-4">
      <SectionHeader
        badge="Why Choose Us"
        title="Built for Innovators"
        description="IdeaVault gives you everything you need to share, validate, and grow your startup concept — completely free."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className={`group bg-gradient-to-br ${f.color} border rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-default`}
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
              {f.emoji}
            </div>
            <h3 className="font-bold text-foreground mb-2 text-base">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default WhyIdeaVault