import { Outlet, ScrollRestoration } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const MainLayout = () => (
  <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
    <Navbar />
    <main className="flex-grow animate-fade-in">
      <Outlet />
    </main>
    <Footer />
    <ScrollRestoration />
  </div>
)

export default MainLayout