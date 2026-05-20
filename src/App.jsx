import { RouterProvider } from 'react-router-dom'
import { Toaster }        from 'react-hot-toast'
import { ThemeProvider }  from './context/ThemeContext'
import { AuthProvider }   from './context/AuthContext'
import router             from './routes/router'
import { useTheme }       from './context/ThemeContext'

/* ─────────────────────────────────────────────────────────────────
   ToasterWithTheme
   ─────────────────
   Reads isDark from ThemeContext so toast styles adapt to the
   current theme in real-time.
───────────────────────────────────────────────────────────────── */
const ToasterWithTheme = () => {
  const { isDark } = useTheme()

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerStyle={{ top: 72 }}
      toastOptions={{
        duration: 3500,

        style: {
          borderRadius  : '14px',
          padding       : '12px 16px',
          fontSize      : '14px',
          fontWeight    : '500',
          boxShadow     : isDark
            ? '0 8px 32px rgba(0,0,0,0.45)'
            : '0 8px 32px rgba(0,0,0,0.12)',
          background    : isDark ? 'hsl(222 47% 9%)' : 'hsl(0 0% 100%)',
          color         : isDark ? 'hsl(210 20% 96%)' : 'hsl(224 71.4% 4.1%)',
          border        : isDark
            ? '1px solid hsl(217 33% 18%)'
            : '1px solid hsl(220 13% 91%)',
        },

        success: {
          iconTheme: { primary: '#7c3aed', secondary: '#ffffff' },
          duration : 3000,
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          duration : 4500,
        },
        loading: {
          iconTheme: { primary: '#7c3aed', secondary: 'transparent' },
        },
      }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────
   App
   ────
   Provider order matters:
   ThemeProvider → AuthProvider → RouterProvider

   ThemeProvider must be outermost so AuthProvider (and everything
   else) can call useTheme() without error.
───────────────────────────────────────────────────────────────── */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToasterWithTheme />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App