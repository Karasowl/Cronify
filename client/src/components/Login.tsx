import { useContext, useEffect, useState } from "react"
import { Button } from "react-bootstrap"
import {AppContext} from '../context/AppContext'
import {useNavigate} from 'react-router-dom'

const Login = () => {
    const context = useContext(AppContext)
    const navigate = useNavigate()
    const [logued, setLogued] = useState(context.isLoguedState)


    useEffect(()=>{
        if (logued) {
            navigate('/home', {replace: true})
        }
    },[logued])

  return (
    <div id="login">
    <div>
    <Button onClick={()=>{
        context.isLoguedState = true
        setLogued(true)
    }}>Login</Button>
    </div>
    </div>
  )
}

export default Login