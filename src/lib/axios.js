import axios from 'axios'

/**
 * Production-ready Axios instance
 * ────────────────────────────────
 * baseURL        — reads from VITE_API_BASE_URL env variable
 *                  Development: http://localhost:5000
 *                  Production:  https://ideavault-api.onrender.com
 *
 * withCredentials — REQUIRED for the browser to send the
 *                   httpOnly JWT cookie cross-origin.
 *                   Works because:
 *                     Server: cors({ credentials: true })
 *                     Cookie: sameSite=none; secure=true (prod)
 *
 * timeout        — 20s in production (Render free tier can be slow
 *                  to wake from cold start), 15s in development.
 */
const isProd = import.meta.env.PROD

const axiosInstance = axios.create({
  baseURL        : import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
  timeout        : isProd ? 20_000 : 15_000,
  headers        : {
    'Content-Type': 'application/json',
    'Accept'      : 'application/json',
  },
})

/* ── Request interceptor ──────────────────────────────────
   Logs requests in development.
   In production, can attach additional headers if needed.
───────────────────────────────────────────────────────── */
if (!isProd) {
  axiosInstance.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  })
}

/* ── Response interceptor ─────────────────────────────────
   Normalise error shape so callers always get
   err.response.data.message.
   The 401/403 handling lives in useAxiosSecure.js
   so it has access to React context (useAuth, useNavigate).
───────────────────────────────────────────────────────── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error / timeout — no response object
    if (!error.response) {
      error.response = {
        data: {
          success: false,
          message:
            error.code === 'ECONNABORTED'
              ? 'Request timed out. The server may be starting up — please try again.'
              : 'Network error. Check your internet connection.',
        },
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance