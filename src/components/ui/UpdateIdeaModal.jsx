import { useState, useEffect } from 'react'
import { createPortal }        from 'react-dom'
import { X }                   from 'lucide-react'
import { CATEGORIES }          from '../../lib/mockData'

const UpdateIdeaModal = ({ isOpen, onClose, idea, onSave, loading = false }) => {
  const [form, setForm] = useState({
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
  })

  /* Populate form when idea changes */
  useEffect(() => {
    if (idea) {
      setForm({
        title              : idea.title               || '',
        shortDescription   : idea.shortDescription    || '',
        detailedDescription: idea.detailedDescription || '',
        category           : idea.category            || 'Tech',
        tags               : Array.isArray(idea.tags)
          ? idea.tags.join(', ')
          : (idea.tags || ''),
        imageURL           : idea.imageURL         || '',
        estimatedBudget    : idea.estimatedBudget  || '',
        targetAudience     : idea.targetAudience   || '',
        problemStatement   : idea.problemStatement || '',
        proposedSolution   : idea.proposedSolution || '',
      })
    }
  }, [idea])

  /* Lock scroll + Escape key */
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose() }
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handler)
    }
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim())            return
    if (!form.shortDescription.trim()) return
    if (onSave) onSave({ ...form })
  }

  const inputCls = `
    w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition-all disabled:opacity-60
  `

  const Label = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
      {children}
    </label>
  )

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Update idea"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-10 animate-fade-in flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Update Idea</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edit your startup idea details
            </p>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-grow">
          <form id="update-idea-form" onSubmit={handleSubmit} className="p-6 space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="upd-title">Title *</Label>
                <input
                  id="upd-title" name="title" type="text"
                  value={form.title} onChange={handleChange}
                  required disabled={loading}
                  className={inputCls}
                />
              </div>
              <div>
                <Label htmlFor="upd-category">Category *</Label>
                <select
                  id="upd-category" name="category"
                  value={form.category} onChange={handleChange}
                  disabled={loading}
                  className={`${inputCls} cursor-pointer appearance-none`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="upd-short">Short Description *</Label>
              <textarea
                id="upd-short" name="shortDescription"
                value={form.shortDescription} onChange={handleChange}
                rows={2} required disabled={loading} maxLength={300}
                className={`${inputCls} resize-none`}
              />
            </div>

            <div>
              <Label htmlFor="upd-detail">Detailed Description</Label>
              <textarea
                id="upd-detail" name="detailedDescription"
                value={form.detailedDescription} onChange={handleChange}
                rows={3} disabled={loading}
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="upd-tags">Tags (comma-separated)</Label>
                <input
                  id="upd-tags" name="tags"
                  value={form.tags} onChange={handleChange}
                  placeholder="AI, SaaS, B2C"
                  disabled={loading}
                  className={inputCls}
                />
              </div>
              <div>
                <Label htmlFor="upd-budget">Estimated Budget</Label>
                <input
                  id="upd-budget" name="estimatedBudget"
                  value={form.estimatedBudget} onChange={handleChange}
                  placeholder="$50,000"
                  disabled={loading}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="upd-image">Image URL</Label>
              <input
                id="upd-image" name="imageURL" type="url"
                value={form.imageURL} onChange={handleChange}
                placeholder="https://…"
                disabled={loading}
                className={inputCls}
              />
            </div>

            <div>
              <Label htmlFor="upd-audience">Target Audience *</Label>
              <input
                id="upd-audience" name="targetAudience"
                value={form.targetAudience} onChange={handleChange}
                required disabled={loading}
                className={inputCls}
              />
            </div>

            <div>
              <Label htmlFor="upd-problem">Problem Statement *</Label>
              <textarea
                id="upd-problem" name="problemStatement"
                value={form.problemStatement} onChange={handleChange}
                rows={2} required disabled={loading}
                className={`${inputCls} resize-none`}
              />
            </div>

            <div>
              <Label htmlFor="upd-solution">Proposed Solution *</Label>
              <textarea
                id="upd-solution" name="proposedSolution"
                value={form.proposedSolution} onChange={handleChange}
                rows={2} required disabled={loading}
                className={`${inputCls} resize-none`}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 shrink-0">
          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="px-5 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="update-idea-form"
            disabled={loading}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default UpdateIdeaModal