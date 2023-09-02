import { useContext } from "react"
import useRedirect from "../../Hooks/useRedirect"
import userContext from "../../context/user-context"

const Statistics = () => {
  const userState = useContext(userContext)
  useRedirect(userState.loginState.isLogged, "/statistics", "/login")
  return (
    <div id="statistics" className="">Statistics</div>
  )
}

export default Statistics