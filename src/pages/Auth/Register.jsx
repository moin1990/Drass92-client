import { useState }  from 'react'
import { Link }      from 'react-router-dom'
import { Eye, EyeOff, Lightbulb, CheckCircle2, XCircle } from 'lucide-react'
import PageTitle      from '../../components/shared/PageTitle'

const rules = (pw) => ({
  length: pw.length >= 6,
  upper : /[A-Z]/.test(pw),
  lower : /[a-z]/.test(pw),
})

const RuleRow = ({ passed, label }) => (
  <li className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? 'text-emerald-500' : 'text-muted-foreground'}`}>
    {passed ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
    {label}
  </li>
)

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', photoURL: '', password: '' })
  const [showPw, setShowPw]     = useState(false)
  const [pwTouched, setPwTouched] = useState(false)

  const pwRules   = rules(form.password)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (name === 'password' && !pwTouched) setPwTouched(true)
  }

  const inputCls = `
    w-full px-4 py-3 bg-background border border-border rounded-xl
    text-sm text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition-all duration-200
  `

  return (
    <>
      <PageTitle title="Create Account" />

      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

            <div className="p-8">
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                  <Lightbulb className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Create your account
                </h1>
                <p className="text-muted-foreground text-sm mt-1.5">
                  Join thousands of innovators on IdeaVault
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent transition-colors mb-6"
              >
                <GoogleIcon /> Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6" aria-hidden="true">
                <div className="flex-grow h-px bg-border" />
                <span className="text-xs text-muted-foreground">or register with email</span>
                <div className="flex-grow h-px bg-border" />
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

                {/* Name */}
                <div>
                  <label htmlFor="reg-name" className="block text-sm font-semibold text-foreground mb-1.5">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="reg-name" name="name" type="text"
                    value={form.name} onChange={handleChange}
                    placeholder="John Doe" autoComplete="name"
                    className={inputCls}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-semibold text-foreground mb-1.5">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="reg-email" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@example.com" autoComplete="email"
                    className={inputCls}
                  />
                </div>

                {/* Photo URL */}
                <div>
                  <label htmlFor="reg-photo" className="block text-sm font-semibold text-foreground mb-1.5">
                    Profile Photo URL{' '}
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    id="reg-photo" name="photoURL" type="url"
                    value={form.photoURL} onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className={inputCls}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-semibold text-foreground mb-1.5">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password" name="password"
                      type={showPw ? 'text' : 'password'}
                      value={form.password} onChange={handleChange}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password rules */}
                  {pwTouched && (
                    <ul className="mt-2.5 space-y-1.5 pl-0.5">
                      <RuleRow passed={pwRules.length} label="At least 6 characters" />
                      <RuleRow passed={pwRules.upper}  label="At least one uppercase letter (A–Z)" />
                      <RuleRow passed={pwRules.lower}  label="At least one lowercase letter (a–z)" />
                    </ul>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-primary/25 text-sm mt-1"
                >
                  Create Account
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline underline-offset-2">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            By creating an account you agree to our{' '}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </>
  )
}

export default Register