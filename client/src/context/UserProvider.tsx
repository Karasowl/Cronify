import UserContext from "./User-context"
import {useState} from "react"
import * as Types from "./../types"


const UserProvider = ({children}:Types.TProps) => {

    const [isLogged, setLogged] = useState(false)
    
    const loginState:Types.ILoginState = {
        isLogged,
        setLogged
    }

    const User: Types.IUserContext = {
        loginState,
    }

 
  return (
    <UserContext.Provider value={User}>{children}</UserContext.Provider>
  )
}

export default UserProvider