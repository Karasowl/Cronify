import UserContext from "./User-context"
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
    <UserContext.Provider value={User}>{children}</UserContext.Provider>
  )
}

export default UserProvider