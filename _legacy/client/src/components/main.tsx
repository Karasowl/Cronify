import React from 'react'
import ReactDOM from 'react-dom/client'
import UserProvider from '../context/UserProvider'
import App from './App'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Statistics from './Statistics/Statistics'
import Home from './Home/Home'
import User from './User/User'
import Settings from './Settings/Settings'
import Login from './Login'
import {routes} from '../helpers/enums'
import ErrorProvider from '../context/error-context/ErrorProvider'

const  router = createBrowserRouter([
    { path:"/",
    element: <App/>,
    errorElement: <h1>Error</h1>,
    children:[
        {
        path:routes.home,
        element: <Home/>,  
        },
        {
        path:routes.statistics,
        element: <Statistics/>,  
        },
        {
        path:routes.user,
        element: <User/>,  
        },
        {
        path:routes.settings,
        element: <Settings/>,  
        },
        {
        path:routes.login,
        element: <Login/>,  
        },
        {
        path: routes.register,
        element: <Login/>,  
        }
             ]
    }
])



ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserProvider>
      <ErrorProvider>
        <RouterProvider router={router} />
      </ErrorProvider>
    </UserProvider>
  </React.StrictMode>
)
