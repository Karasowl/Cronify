import { useContext } from "react"
import useRedirect from "../../Hooks/useRedirect"
import userContext from "../../context/User-context"


function Settings() {
  const userState = useContext(userContext)
  useRedirect(userState.loginState.isLogged, "/settings", "/login")
  return (
    <div id="settings">Settings</div>
  )
}

export default Settings