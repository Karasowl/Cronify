import UserContext from "./User-context"
import {useState} from "react"
import * as Types from "./../types"
import fetcher from "../helpers/fetch"
import {urls } from "../helpers/enums"


const UserProvider = ({children}:Types.TProps) => {

    const [isLogged, setLogged] = useState(false)
    const [user, setUser] = useState<Types.IUser>(localStorage.user)

    const setLoginState = async (isLoggedIn:boolean):Promise<boolean> => {
      try {
        if(isLoggedIn){
        if(typeof localStorage.token === 'undefined'){
          console.log(`Error: localStorage.token es ${localStorage.token}`)
          return false
        }else{
          const authFound = await fetcher({url: urls.auth, options:{
           method:'GET',
           headers: {
             "content-Type": 'application/json', 
             auth:localStorage.token
           }
          }})
 
          if(typeof authFound === "string" ){
           throw new Error(authFound)
          } else{
           console.log(`${(authFound as Types.IAuthData).auth} es igual a ${localStorage.token}`)
           setLogged(isLoggedIn)
           return true
        }
         }
        }else{
          setLogged(isLoggedIn)
          return false
        }
      } catch (error) {
        console.log(error)
        return false
      }
    }
    
    const loginState:Types.ILoginState = {
        isLogged,
        setLoginState
    }

    const User: Types.IUserContext = {
        loginState,
        user,
        setUser
    }

 
  return (
    <UserContext.Provider value={User}>{children}</UserContext.Provider>
  )
}

export default UserProvider