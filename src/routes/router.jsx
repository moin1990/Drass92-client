import { createBrowserRouter }   from 'react-router-dom'
import MainLayout                from '../components/layout/MainLayout'
import PrivateRoute              from '../components/shared/PrivateRoute'
import Home                      from '../pages/Home/Home'
import Ideas                     from '../pages/Ideas/Ideas'
import IdeaDetails               from '../pages/IdeaDetails/IdeaDetails'
import AddIdea                   from '../pages/AddIdea/AddIdea'
import MyIdeas                   from '../pages/MyIdeas/MyIdeas'
import MyInteractions            from '../pages/MyInteractions/MyInteractions'
import Profile                   from '../pages/Profile/Profile'
import Login                     from '../pages/Auth/Login'
import Register                  from '../pages/Auth/Register'
import NotFound                  from '../pages/NotFound/NotFound'

const router = createBrowserRouter([
  {
    path    : '/',
    element : <MainLayout />,
    children: [
      { index: true,              element: <Home />     },
      { path: 'ideas',            element: <Ideas />    },
      { path: 'login',            element: <Login />    },
      { path: 'register',         element: <Register /> },
      {
        path   : 'idea/:id',
        element: <PrivateRoute><IdeaDetails /></PrivateRoute>,
      },
      {
        path   : 'add-idea',
        element: <PrivateRoute><AddIdea /></PrivateRoute>,
      },
      {
        path   : 'my-ideas',
        element: <PrivateRoute><MyIdeas /></PrivateRoute>,
      },
      {
        path   : 'my-interactions',
        element: <PrivateRoute><MyInteractions /></PrivateRoute>,
      },
      {
        path   : 'profile',
        element: <PrivateRoute><Profile /></PrivateRoute>,
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export default router