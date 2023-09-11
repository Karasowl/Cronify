import '../Sass/App.scss'
import NavApp from './NavApp/NavApp'
import BottomNav from './BottomNav/BottomNav'
import {Outlet} from 'react-router-dom'
import useRedirect from '../Hooks/useRedirect'
import { useLocation } from 'react-router-dom'
import {routes} from '../helpers/enums'
import userContext from '../context/User-context'
import { useContext} from 'react'
import Error from "./Error/Error"

function App () {
const userState = useContext(userContext)
userState.loginState.setLoginState(localStorage.token)
const location = useLocation().pathname
useRedirect(!userState.loginState.isLogged, [routes.root], routes.login) //esto se puede refactorizar para que redirija hacia otra ruta en caso de que el valor booleano sea el opuesto
useRedirect(userState.loginState.isLogged, [routes.root], routes.home)
useRedirect(userState.loginState.isLogged, [routes.login, routes.register], routes.home)
useRedirect(!userState.loginState.isLogged, [routes.home, routes.settings, routes.statistics, routes.user], routes.login)

return(
<div id='app'>

<div id='nav-app' className='w-100'>
<NavApp/>
</div>
<div className='error'>
<Error></Error>
</div>
<div className='d-grid'>
<Outlet/>
</div>

<div id='bottom-nav' className='d-fex justify-content-center align-items-center'>
{location === routes.login || location === routes.register ? '' : <BottomNav/>}
</div>

</div>
)
}

export default App