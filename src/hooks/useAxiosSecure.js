import { useEffect }   from 'react'
import { useNavigate } from 'react-router-dom'
import toast           from 'react-hot-toast'
import axiosInstance   from '../lib/axios'
import { useAuth }     from '../context/AuthContext'

const useAxiosSecure = () => {
  const { logout, refreshServerToken } = useAuth()
  const navigate                       = useNavigate()

  useEffect(() => {
    const id = axiosInstance.interceptors.response.use(
      (response) => response,

      async (error) => {
        const status  = error?.response?.status
        const message = error?.response?.data?.message

        if (status === 401) {
          // Try refreshing the token once before logging out
          try {
            await refreshServerToken()
            // Retry the original request once
            return axiosInstance.request(error.config)
          } catch {
            try { await logout() } catch { /* ignore */ }
            navigate('/login', { replace: true })
          }
        } else if (status === 403) {
          toast.error(message || 'You do not have permission to perform this action.')
        }

        return Promise.reject(error)
      }
    )

    return () => axiosInstance.interceptors.response.eject(id)
  }, [logout, navigate, refreshServerToken])

  return axiosInstance
}

export default useAxiosSecure