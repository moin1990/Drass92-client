import { Navigate, useLocation } from 'react-router-dom'
import { useAuth }               from '../../context/AuthContext'
import LoadingSpinner            from '../ui/LoadingSpinner'

/**
 * PrivateRoute
 * ────────────
 * Guards every private page.
 *
 * loading = true  →  Firebase is still resolving auth state on page load.
 *                    Show a full-screen spinner — never redirect while loading.
 *                    This is what prevents the "logged-in user sent to /login
 *                    on reload" bug.
 *
 * no user         →  Redirect to /login, stash intended path in location.state
 *                    so Login can navigate back after successful sign-in.
 *
 * user present    →  Render children normally.
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location          = useLocation()

  if (loading) return <LoadingSpinner fullScreen message="Authenticating…" />

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return children
}

export default PrivateRoute