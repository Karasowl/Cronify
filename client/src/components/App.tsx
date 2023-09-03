import '../Sass/App.scss'
import NavApp from './NavApp/NavApp'
import BottomNav from './BottomNav/BottomNav'
import {Outlet} from 'react-router-dom'
// import { useNavigate } from 'react-router-dom'
// import { useEffect } from 'react'
import useRedirect from '../Hooks/useRedirect'
import { useLocation } from 'react-router-dom'
import routes from '../helpers/routes'
import userContext from '../context/user-context'
import { useContext } from 'react'

function App () {
const userState = useContext(userContext)
const location = useLocation().pathname

useRedirect(userState.loginState.isLogged, routes.home, routes.login, [routes.register])

return(
<div id='app'>

<div id='nav-app' className='w-100'>
<NavApp/>
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