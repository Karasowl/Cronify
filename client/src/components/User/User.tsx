import { useContext } from "react"
import useRedirect from "../../Hooks/useRedirect"
import userContext from "../../context/user-context"


function User() {
  const userState = useContext(userContext)
  useRedirect(userState.loginState.isLogged, "/user", "/login")
  return (
    <div id="user">User</div>
  )
}

export default User