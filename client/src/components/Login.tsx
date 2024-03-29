
import { Button, Image, Form } from "react-bootstrap"
import {useNavigate } from "react-router-dom"
import {useContext, useState} from 'react'
import UserContext from "../context/user-context"
import {routes, urls} from "../helpers/enums"
import ErrorContext from "../context/error-context/Error-context"
import * as Types from  '../types'
import fetcher from "../helpers/fetch"


const Login = () => {
  const areWeInLogin = location.pathname === routes.login
  const userState = useContext(UserContext)
  const errorState = useContext(ErrorContext)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stayLogged, setStayLogged] = useState(false) //puede tener problemas
  const [data, setData] = useState<Types.IAuthData | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()


  const registerOpt: Types.IFetchOptions = {
      url: urls.createUser,
      options:{
        method: 'POST',
        headers:{
            "content-Type":'application/json'
        },
        body: JSON.stringify(
          {
            username,
            email,
            password
          }
        )
      }
  }
  const loginOpt: Types.IFetchOptions = {
      url: urls.login,
      options:{
        method: 'POST',
        headers:{
          "content-Type": 'application/json'
        },
        body: JSON.stringify(
          {
            email,
            password,
            stayLogged
          }
        )
      }
  }

  const handleButton = async () => {
    
   try {
    setLoading(true)
    
    if(typeof areWeInLogin !== 'undefined'){
      
      const response  = await fetcher(areWeInLogin ? loginOpt : registerOpt)
      
      if(response !== null){
        if(typeof response === 'string' ){
          errorState.addError(response)
        }else {
          const responseData = response as Types.IAuthData;
          if(responseData?.auth){
            setData(responseData)
            const token = responseData.auth
            console.log(`stayLogged: ${stayLogged}`)
              stayLogged ? localStorage.token = token : sessionStorage.token = token
              console.log("Token guardado en localStorage:", token);
            userState.loginState.setLoginState(true)
          }
        }
    }
    
  }
  setTimeout(() => { setLoading(false)// aún no he logrado convertir a setLoginState en una función que pueda usarse con await en este contexto
  }, 10)
   } catch (error) {
    console.log(error)
    
   }
}

return (
    <div id="login">
      {loading ? <div>LOADING...</div>: <><div className="img-container container w-75 d-flex justify-content-center align-items-center flex-column ">
      <Image
        className="img-fluid img-logo"
        src="../../cronify.svg"
        fluid
      />
      <p>CRONI.FY</p>
    </div>
    <Form>
      {areWeInLogin ? "" : (<Form.Group className="mb-3" controlId="form-text">
        <Form.Label>Username</Form.Label>
        <Form.Control type="email" placeholder="Enter Username" value={username} onChange={(e => setUsername(e.target.value))}/>
      </Form.Group>) }
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e => setEmail(e.target.value))}/>
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" value={password} onChange={(e => setPassword(e.target.value))} />
      </Form.Group>
      <Form.Group className="mb-4 check-container" controlId="formBasicCheckbox">
        <Form.Check type="checkbox" label=" Stay logged in" value={String(stayLogged)} onChange={(e) => setStayLogged(e.target.checked)}/>
        {areWeInLogin ? <Button onClick={()=>{
          navigate(routes.register)
        }} className="">Sin Up</Button> : ""}
      </Form.Group>
      <Button
      //login
        variant="primary"
        type="submit"
        onClick={async (e) => {
          e.preventDefault()
          await handleButton()
         if(typeof data?.user !== 'undefined'){
          userState.setUser(data.user)
         }


        }}
      >
        { areWeInLogin ? "Login" : "Register"}
      </Button>
    </Form> </>
      
      }
        
      </div>
  )
}

export default Login;
