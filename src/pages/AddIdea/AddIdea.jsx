import { useState }                   from 'react'
import { useNavigate }                from 'react-router-dom'
import { Lightbulb, Info, CheckCircle } from 'lucide-react'
import toast                          from 'react-hot-toast'
import PageTitle                      from '../../components/shared/PageTitle'
import useAxiosSecure                 from '../../hooks/useAxiosSecure'
import { CATEGORIES }                 from '../../lib/mockData'

const REQUIRED = ['title', 'shortDescription', 'category', 'targetAudience', 'problemStatement', 'proposedSolution']

const INITIAL_FORM = {
  title              : '',
  shortDescription   : '',
  detailedDescription: '',
  category           : 'Tech',
  tags               : '',
  imageURL           : '',
  estimatedBudget    : '',
  targetAudience     : '',
  problemStatement   : '',
  proposedSolution   : '',
}

const AddIdea = () => {
  const navigate    = useNavigate()
  const axiosSecure = useAxiosSecure()

  const [form,       setForm]       = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [errors,     setErrors]     = useState({})
  const [newIdeaId,  setNewIdeaId]  = useState(null)

  /* ── Field change ────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    // Clear error on change
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  /* ── Client-side validation ──────────────────────────────────── */
  const validate = () => {
    const newErrors = {}
    REQUIRED.forEach((field) => {
      if (!form[field]?.trim()) {
        newErrors[field] = `${
          field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
        } is required.`
      }
    })
    if (form.shortDescription.trim().length > 300) {
      newErrors.shortDescription = 'Short description must be under 300 characters.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the errors below before submitting.')
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Publishing your idea…')

    try {
      // Normalize tags: "AI, SaaS, B2C" → ["AI", "SaaS", "B2C"]
      const payload = {
        ...form,
        title              : form.title.trim(),
        shortDescription   : form.shortDescription.trim(),
        detailedDescription: form.detailedDescription.trim(),
        targetAudience     : form.targetAudience.trim(),
        problemStatement   : form.problemStatement.trim(),
        proposedSolution   : form.proposedSolution.trim(),
        imageURL           : form.imageURL.trim(),
        estimatedBudget    : form.estimatedBudget.trim(),
        tags               : form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      }

      const { data } = await axiosSecure.post('/api/ideas', payload)

      toast.dismiss(toastId)
      toast.success('Your idea is live! 🎉')
      setSubmitted(true)
      setNewIdeaId(data.insertedId)
      setForm(INITIAL_FORM)
    } catch (err) {
      toast.dismiss(toastId)
      const msg = err?.response?.data?.message || 'Failed to publish idea. Please try again.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Shared input class ──────────────────────────────────────── */
  const inputCls = (name) => `
    w-full px-4 py-3 bg-background border rounded-xl text-sm
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition-all duration-200 disabled:opacity-60
    ${errors[name] ? 'border-destructive focus:ring-destructive/50' : 'border-border'}
  `

  const FieldError = ({ name }) =>
    errors[name]
      ? <p className="text-xs text-destructive mt-1 ml-1">{errors[name]}</p>
      : null

  /* ── Success state ───────────────────────────────────────────── */
  if (submitted) {
    return (
      <>
        <PageTitle title="Idea Published!" />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground mb-3">Idea Published!</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your startup idea is now live and visible to the IdeaVault community.
              Start collecting feedback!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {newIdeaId && (
                <button
                  onClick={() => navigate(`/idea/${newIdeaId}`)}
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/25 text-sm"
                >
                  View My Idea →
                </button>
              )}
              <button
                onClick={() => { setSubmitted(false); setNewIdeaId(null) }}
                className="px-6 py-3 border border-border font-semibold rounded-xl hover:bg-accent transition-colors text-sm"
              >
                Submit Another
              </button>
              <button
                onClick={() => navigate('/my-ideas')}
                className="px-6 py-3 border border-border font-semibold rounded-xl hover:bg-accent transition-colors text-sm"
              >
                My Ideas
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ── Render form ─────────────────────────────────────────────── */
  return (
    <>
      <PageTitle title="Add Idea" />

      <div className="min-h-screen bg-muted/20">

        {/* Page header */}
        <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-b border-border">
          <div className="container mx-auto px-4 py-14">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-primary/30 shrink-0">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                  Share Your Idea
                </h1>
                <p className="text-muted-foreground mt-2 text-base max-w-xl">
                  Submit your startup concept and let the IdeaVault community validate,
                  refine, and collaborate on it.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto">

            {/* Tip */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl mb-8">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                <strong>Pro tip:</strong> Ideas with a clear problem statement and specific target
                audience receive 3× more engagement. The more detail, the better the feedback.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 space-y-8">

                {/* ── Basic Info ─────────────────────────────── */}
                <section>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 pb-3 border-b border-border">
                    Basic Information
                  </h2>
                  <div className="space-y-5">

                    {/* Title */}
                    <div data-error={!!errors.title || undefined}>
                      <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-1.5">
                        Idea Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="title" name="title" type="text"
                        value={form.title} onChange={handleChange}
                        placeholder="e.g. AI-Powered Recipe Generator for Dietary Restrictions"
                        disabled={submitting}
                        className={inputCls('title')}
                      />
                      <FieldError name="title" />
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-1.5">
                        Category <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="category" name="category"
                        value={form.category} onChange={handleChange}
                        disabled={submitting}
                        className={`${inputCls('category')} cursor-pointer appearance-none`}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Short Description */}
                    <div data-error={!!errors.shortDescription || undefined}>
                      <label htmlFor="shortDescription" className="block text-sm font-semibold text-foreground mb-1.5">
                        Short Description <span className="text-destructive">*</span>
                        <span className="text-xs text-muted-foreground font-normal ml-2">
                          (appears on idea cards — max 300 chars)
                        </span>
                      </label>
                      <textarea
                        id="shortDescription" name="shortDescription"
                        value={form.shortDescription} onChange={handleChange}
                        placeholder="Summarize your idea in 2–3 sentences. This appears on idea cards."
                        rows={3} disabled={submitting} maxLength={300}
                        className={`${inputCls('shortDescription')} resize-none`}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <FieldError name="shortDescription" />
                        <span className={`text-xs ml-auto ${form.shortDescription.length >= 280 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {form.shortDescription.length}/300
                        </span>
                      </div>
                    </div>

                    {/* Detailed Description */}
                    <div>
                      <label htmlFor="detailedDescription" className="block text-sm font-semibold text-foreground mb-1.5">
                        Detailed Description
                        <span className="text-xs text-muted-foreground font-normal ml-2">(optional but recommended)</span>
                      </label>
                      <textarea
                        id="detailedDescription" name="detailedDescription"
                        value={form.detailedDescription} onChange={handleChange}
                        placeholder="Explain your idea in depth — how it works, key features, technology stack, business model, competitive advantage, etc."
                        rows={5} disabled={submitting}
                        className={`${inputCls('detailedDescription')} resize-none`}
                      />
                    </div>
                  </div>
                </section>

                {/* ── Problem & Solution ─────────────────────── */}
                <section>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 pb-3 border-b border-border">
                    Problem &amp; Solution
                  </h2>
                  <div className="space-y-5">

                    <div data-error={!!errors.problemStatement || undefined}>
                      <label htmlFor="problemStatement" className="block text-sm font-semibold text-foreground mb-1.5">
                        Problem Statement <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="problemStatement" name="problemStatement"
                        value={form.problemStatement} onChange={handleChange}
                        placeholder="What specific problem does this solve? Include data or evidence where possible."
                        rows={4} disabled={submitting}
                        className={`${inputCls('problemStatement')} resize-none`}
                      />
                      <FieldError name="problemStatement" />
                    </div>

                    <div data-error={!!errors.proposedSolution || undefined}>
                      <label htmlFor="proposedSolution" className="block text-sm font-semibold text-foreground mb-1.5">
                        Proposed Solution <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="proposedSolution" name="proposedSolution"
                        value={form.proposedSolution} onChange={handleChange}
                        placeholder="How does your idea solve the problem? What makes your approach unique or better?"
                        rows={4} disabled={submitting}
                        className={`${inputCls('proposedSolution')} resize-none`}
                      />
                      <FieldError name="proposedSolution" />
                    </div>
                  </div>
                </section>

                {/* ── Market Details ─────────────────────────── */}
                <section>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 pb-3 border-b border-border">
                    Market Details
                  </h2>

                  <div data-error={!!errors.targetAudience || undefined}>
                    <label htmlFor="targetAudience" className="block text-sm font-semibold text-foreground mb-1.5">
                      Target Audience <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="targetAudience" name="targetAudience" type="text"
                      value={form.targetAudience} onChange={handleChange}
                      placeholder="e.g. Working parents aged 30–45 who meal-prep on weekends"
                      disabled={submitting}
                      className={inputCls('targetAudience')}
                    />
                    <FieldError name="targetAudience" />
                  </div>
                </section>

                {/* ── Optional Details ───────────────────────── */}
                <section>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 pb-3 border-b border-border">
                    Optional Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div>
                      <label htmlFor="estimatedBudget" className="block text-sm font-semibold text-foreground mb-1.5">
                        Estimated Budget
                      </label>
                      <input
                        id="estimatedBudget" name="estimatedBudget" type="text"
                        value={form.estimatedBudget} onChange={handleChange}
                        placeholder="e.g. $25,000 – $50,000"
                        disabled={submitting}
                        className={inputCls('estimatedBudget')}
                      />
                    </div>

                    <div>
                      <label htmlFor="tags" className="block text-sm font-semibold text-foreground mb-1.5">
                        Tags
                        <span className="text-xs text-muted-foreground font-normal ml-1">(comma-separated)</span>
                      </label>
                      <input
                        id="tags" name="tags" type="text"
                        value={form.tags} onChange={handleChange}
                        placeholder="AI, SaaS, B2C, Mobile"
                        disabled={submitting}
                        className={inputCls('tags')}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="imageURL" className="block text-sm font-semibold text-foreground mb-1.5">
                        Cover Image URL
                      </label>
                      <input
                        id="imageURL" name="imageURL" type="url"
                        value={form.imageURL} onChange={handleChange}
                        placeholder="https://example.com/your-image.jpg"
                        disabled={submitting}
                        className={inputCls('imageURL')}
                      />

                      {/* Image preview */}
                      {form.imageURL && (
                        <div className="mt-3 h-36 rounded-xl overflow-hidden border border-border bg-muted">
                          <img
                            src={form.imageURL}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="hidden h-full items-center justify-center text-sm text-muted-foreground">
                            Invalid image URL
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Form footer */}
              <div className="px-8 py-5 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive font-bold">*</span> Required fields.
                  Your idea will be visible to the entire community after submission.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5
                    bg-gradient-to-r from-violet-600 to-purple-600 text-white font-extrabold rounded-xl
                    hover:from-violet-500 hover:to-purple-500 hover:scale-105 active:scale-100
                    transition-all duration-200 shadow-lg shadow-primary/30 text-sm
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4" />
                      Publish Idea
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddIdea