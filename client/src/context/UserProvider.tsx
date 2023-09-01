import userContext from "./user-context"
import {useState} from "react"
import.meta.env


const UserProvider = ({children}:TProps) => {

    const [isLogged, setLogged] = useState(false)
    
    const loginState:ILoginState = {
        isLogged,
        setLogged
    }

    const User: IUserContext = {
        loginState,
    }

 
  return (
    <userContext.Provider value={User}>{children}</userContext.Provider>
  )
}

export default UserProvider