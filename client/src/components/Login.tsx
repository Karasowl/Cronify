
import { Button, Image, Form } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import {useContext, useState} from 'react'
import UserContext from "../context/User-context"
import routes from "../helpers/routes"
import {fetcherPOST } from "../helpers/fetch"
import Error from "./Error/Error"
import ErrorContext from "../context/error-context/Error-context"
import.meta.env



const Login = () => {
  const areWeInLogin = location.pathname === routes.login
  const userState = useContext(UserContext)
  const errorState = useContext(ErrorContext)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stayLogged, setStayLogged] = useState(false) //puede tener problemas
  const navigate = useNavigate()
  return (
    <div id="login">
      <Error
      showErr = {errorState.showErr()}
      ></Error>
        <div className="img-container container w-75 d-flex justify-content-center align-items-center flex-column ">
          <Image
            className="img-fluid img-logo"
            src="../../public/cronify.svg"
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
            onClick={(event) => {
              event.preventDefault()
              if(areWeInLogin){
              fetcherPOST(
                {
                  url:'http://localhost:9785/api/login', 
                  options:{
                    method: 'POST', 
                    headers:{"Content-Type": "application/json"},
                    body: JSON.stringify({email, password})
                  }
              }
                )
                .then((response) => {
                  if((response as Response).status === 200){
                    userState.loginState.setLogged(true)
                    navigate(routes.home)
                  } else{
                    
                    console.log(`Ocurrió un error al loguearse: ${(response as Response).status}`)
                  }
                })
                .catch(err => console.log(err))
              } else{
                //register
                fetcherPOST(
                  {url:'http://localhost:9785/api/create-user', 
                  options:{
                    method: 'POST', 
                    headers:{
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({username, email, password})
                  }
                  }
                  )
                .then((response) => {
                  if((response as Response).status === 200){
                    navigate(routes.login)
                  } else{
                   errorState.addError({errorMessage:response.msg, errorStatus:200})
                   errorState.showErr()
                    console.log(`Ocurrió un error al registrarse: ${(response as Response).status}`, errorState.showErr())
                    
                  }
                })
                .catch(err => console.log(err))
            }
          }
        }
            variant="primary"
            type="submit"
          >
            { areWeInLogin ? "Login" : "Register"}
          </Button>
        </Form>
      </div>
  );
};
export default Login;
