import { useState, useEffect, useCallback } from 'react'
import {
  Camera, Save, User, Mail,
  Shield, Calendar, Lightbulb,
  MessageSquare, Bookmark, RefreshCw,
} from 'lucide-react'
import toast              from 'react-hot-toast'
import PageTitle          from '../../components/shared/PageTitle'
import LoadingSpinner     from '../../components/ui/LoadingSpinner'
import { useAuth }        from '../../context/AuthContext'
import useAxiosSecure     from '../../hooks/useAxiosSecure'
import { buildAvatarUrl } from '../../lib/utils'

const Profile = () => {
  const { user, updateUserProfile } = useAuth()
  const axiosSecure                 = useAxiosSecure()

  /* ── Server state ───────────────────────────────────────────── */
  const [profile,  setProfile]  = useState(null)
  const [stats,    setStats]    = useState({ ideas: 0, comments: 0, bookmarks: 0 })
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  /* ── Edit state ─────────────────────────────────────────────── */
  const [isEditing,  setIsEditing]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [form,       setForm]       = useState({ name: '', photoURL: '' })
  const [formErrors, setFormErrors] = useState({})

  /* ── Fetch profile + stats ──────────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileRes, ideasRes, commentsRes, bookmarksRes] = await Promise.allSettled([
        axiosSecure.get('/api/users/me'),
        axiosSecure.get('/api/ideas/my'),
        axiosSecure.get('/api/comments/my'),
        axiosSecure.get('/api/bookmarks'),
      ])

      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value.data.user
        setProfile(p)
        setForm({ name: p.name || '', photoURL: p.photoURL || '' })
      } else {
        throw new Error('Could not load profile.')
      }

      setStats({
        ideas    : ideasRes.status     === 'fulfilled' ? (ideasRes.value.data.ideas?.length     || 0) : 0,
        comments : commentsRes.status  === 'fulfilled' ? (commentsRes.value.data.comments?.length || 0) : 0,
        bookmarks: bookmarksRes.status === 'fulfilled' ? (bookmarksRes.value.data.bookmarks?.length || 0) : 0,
      })
    } catch (err) {
      setError(err.message || 'Failed to load profile.')
      toast.error('Could not load your profile.')
    } finally {
      setLoading(false)
    }
  }, [axiosSecure])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  /* ── Validate form ──────────────────────────────────────────── */
  const validate = () => {
    const errors = {}
    if (!form.name.trim())         errors.name = 'Name is required.'
    if (form.name.trim().length > 60) errors.name = 'Name must be under 60 characters.'
    if (form.photoURL && !/^https?:\/\/.+/.test(form.photoURL.trim())) {
      errors.photoURL = 'Please enter a valid URL starting with http:// or https://'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /* ── Save profile ───────────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    const toastId = toast.loading('Saving profile…')
    try {
      const payload = {
        name    : form.name.trim(),
        photoURL: form.photoURL.trim(),
      }

      /* 1. Update in MongoDB */
      await axiosSecure.patch('/api/users/me', payload)

      /* 2. Update in Firebase Auth (display name + photo) */
      await updateUserProfile(payload.name, payload.photoURL)

      /* 3. Update local state */
      setProfile((prev) => ({ ...prev, ...payload }))

      toast.dismiss(toastId)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      setFormErrors({})
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(err?.response?.data?.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  /* ── Cancel edit ────────────────────────────────────────────── */
  const handleCancel = () => {
    setForm({ name: profile?.name || '', photoURL: profile?.photoURL || '' })
    setFormErrors({})
    setIsEditing(false)
  }

  /* ── Derived values ─────────────────────────────────────────── */
  const displayName = profile?.name     || user?.displayName || 'User'
  const photoURL    = profile?.photoURL || user?.photoURL    || ''
  const email       = profile?.email    || user?.email       || ''
  const provider    = profile?.provider === 'google' ? 'Google OAuth' : 'Email & Password'
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  /* ── Preview avatar while editing ──────────────────────────── */
  const previewAvatar = (isEditing ? form.photoURL.trim() : photoURL) ||
    buildAvatarUrl(isEditing ? form.name || displayName : displayName, 80)

  const inputCls = (field) => `
    w-full px-4 py-2.5 bg-background border rounded-xl text-sm
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition-all duration-200 disabled:opacity-60
    ${formErrors[field] ? 'border-destructive focus:ring-destructive/40' : 'border-border'}
  `

  /* ─────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────── */
  return (
    <>
      <PageTitle title="Profile" />

      <div className="min-h-screen bg-muted/20">

        {/* Page header */}
        <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-b border-border">
          <div className="container mx-auto px-4 py-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                  Profile Management
                </h1>
                <p className="text-muted-foreground mt-2 text-base">
                  Manage your account information and track your activity.
                </p>
              </div>
              <button
                onClick={fetchProfile}
                disabled={loading}
                aria-label="Refresh profile"
                className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {loading ? (
            <LoadingSpinner message="Loading your profile…" />

          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
              <div className="text-5xl">⚠️</div>
              <p className="text-lg font-bold text-foreground">{error}</p>
              <button
                onClick={fetchProfile}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>

          ) : (
            <div className="max-w-2xl mx-auto space-y-6">

              {/* ── Profile Card ──────────────────────────────── */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

                {/* Cover banner */}
                <div className="h-28 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative">
                  <div
                    className="absolute inset-0 opacity-20 dot-grid"
                    aria-hidden="true"
                  />
                </div>

                <div className="px-6 pb-6">
                  {/* Avatar + Edit button */}
                  <div className="flex items-end justify-between -mt-12 mb-6">
                    <div className="relative">
                      <img
                        src={previewAvatar}
                        alt={displayName}
                        className="h-20 w-20 rounded-2xl border-4 border-card object-cover shadow-xl"
                        onError={(e) => {
                          e.target.src = buildAvatarUrl(displayName, 80)
                        }}
                      />
                      {isEditing && (
                        <div
                          className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent hover:border-primary/30 transition-all"
                      >
                        <Camera className="h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {/* View mode */}
                  {!isEditing ? (
                    <div>
                      <h2 className="text-2xl font-extrabold text-foreground">{displayName}</h2>
                      <p className="text-muted-foreground text-sm mt-1">{email}</p>
                    </div>

                  ) : (
                    /* Edit mode */
                    <form onSubmit={handleSave} noValidate className="space-y-5">
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="prof-name"
                          className="block text-sm font-semibold text-foreground mb-1.5"
                        >
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="prof-name"
                          type="text"
                          value={form.name}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, name: e.target.value }))
                            if (formErrors.name) setFormErrors((p) => ({ ...p, name: '' }))
                          }}
                          placeholder="Your full name"
                          disabled={saving}
                          maxLength={60}
                          className={inputCls('name')}
                        />
                        {formErrors.name && (
                          <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Photo URL */}
                      <div>
                        <label
                          htmlFor="prof-photo"
                          className="block text-sm font-semibold text-foreground mb-1.5"
                        >
                          Profile Photo URL{' '}
                          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <input
                          id="prof-photo"
                          type="url"
                          value={form.photoURL}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, photoURL: e.target.value }))
                            if (formErrors.photoURL) setFormErrors((p) => ({ ...p, photoURL: '' }))
                          }}
                          placeholder="https://example.com/photo.jpg"
                          disabled={saving}
                          className={inputCls('photoURL')}
                        />
                        {formErrors.photoURL && (
                          <p className="text-xs text-destructive mt-1">{formErrors.photoURL}</p>
                        )}
                        {/* Preview */}
                        {form.photoURL && !formErrors.photoURL && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <img
                              src={form.photoURL}
                              alt="Preview"
                              className="h-7 w-7 rounded-full object-cover border border-border"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <span>Preview updated above</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all text-sm shadow-md shadow-primary/25 disabled:opacity-60"
                        >
                          {saving ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              Saving…
                            </>
                          ) : (
                            <><Save className="h-4 w-4" /> Save Changes</>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-5 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* ── Account Info ───────────────────────────────── */}
              <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
                  Account Information
                </h3>

                <div className="space-y-1">
                  {[
                    { icon: User,     label: 'Display Name',  value: displayName },
                    { icon: Mail,     label: 'Email Address', value: email       },
                    { icon: Shield,   label: 'Auth Provider', value: provider    },
                    { icon: Calendar, label: 'Member Since',  value: memberSince },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                    >
                      <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Activity Stats ─────────────────────────────── */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">
                  Your Activity
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      icon : Lightbulb,
                      value: stats.ideas,
                      label: 'Ideas Shared',
                      color: 'from-violet-500/10 to-purple-500/10 border-violet-200/50 dark:border-violet-800/30',
                      text : 'text-violet-600 dark:text-violet-400',
                    },
                    {
                      icon : MessageSquare,
                      value: stats.comments,
                      label: 'Comments Made',
                      color: 'from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-800/30',
                      text : 'text-blue-600 dark:text-blue-400',
                    },
                    {
                      icon : Bookmark,
                      value: stats.bookmarks,
                      label: 'Bookmarks',
                      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-800/30',
                      text : 'text-emerald-600 dark:text-emerald-400',
                    },
                  ].map(({ icon: Icon, value, label, color, text }) => (
                    <div
                      key={label}
                      className={`bg-gradient-to-br ${color} border rounded-2xl p-5 text-center`}
                    >
                      <Icon className={`h-5 w-5 mx-auto mb-2 ${text}`} />
                      <div className="text-3xl font-extrabold text-foreground">{value}</div>
                      <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Profile