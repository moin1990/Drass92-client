import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth }      from '../lib/firebase'
import axiosInstance from '../lib/axios'

const AuthContext    = createContext(null)
const googleProvider = new GoogleAuthProvider()

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  /* ── Issue JWT by sending Firebase ID token to server ──────── */
  const issueServerToken = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return
    try {
      /*
       * getIdToken(forceRefresh) — gets a fresh Firebase ID token.
       * The server verifies this with Firebase Admin SDK before
       * issuing our own JWT. Passes `true` to force-refresh if
       * the existing token is near expiry.
       */
      const idToken = await firebaseUser.getIdToken(false)

      await axiosInstance.post('/api/auth/login', {
        idToken,
        // Dev fallback: also send email (ignored in production)
        email: firebaseUser.email,
      })
    } catch {
      /* Silent — protected API calls will 401 and interceptor handles */
    }
  }, [])

  /* ── Sync user to MongoDB ───────────────────────────────────── */
  const syncUserToDB = useCallback(async ({ name, email, photoURL, provider = 'email' }) => {
    try {
      await axiosInstance.post('/api/users', { name, email, photoURL, provider })
    } catch {
      /* Non-fatal */
    }
  }, [])

  /* ── onAuthStateChanged — runs on every auth event ─────────── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // Re-issue server JWT on every auth resolution (covers reload)
        await issueServerToken(firebaseUser)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [issueServerToken])

  /* ── Actions ───────────────────────────────────────────────── */
  const register = (email, password) => {
    setLoading(true)
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const updateUserProfile = (displayName, photoURL) =>
    updateProfile(auth.currentUser, { displayName, photoURL: photoURL || '' })

  const login = (email, password) => {
    setLoading(true)
    return signInWithEmailAndPassword(auth, email, password)
  }

  const googleLogin = () => {
    setLoading(true)
    return signInWithPopup(auth, googleProvider)
  }

  const logout = async () => {
    setLoading(true)
    try {
      await axiosInstance.post('/api/auth/logout')
    } catch {
      /* Best-effort */
    }
    return signOut(auth)
  }

  /* ── Force-refresh the server JWT (call after token expiry) ── */
  const refreshServerToken = useCallback(async () => {
    const firebaseUser = auth.currentUser
    if (firebaseUser) await issueServerToken(firebaseUser)
  }, [issueServerToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        updateUserProfile,
        syncUserToDB,
        login,
        googleLogin,
        logout,
        refreshServerToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}