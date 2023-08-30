import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Statistics from './Statistics/Statistics'
import Home from './Home/Home'
import User from './User/User'
import Settings from './settings/Settings'

const  router = createBrowserRouter([
    { path:"/",
    element: <App/>,
    children:[
        {
        path:"home",
        element: <Home/>,  
        },
        {
        path:"statistics",
        element: <Statistics/>,  
        },
        {
        path:"user",
        element: <User/>,  
        },
        {
        path:"settings",
        element: <Settings/>,  
        }
             ]
    }
])



ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
)