import '../Sass/App.scss'
import NavApp from './NavApp/NavApp'
import BottomNav from './BottomNav/BottomNav'
import {Outlet} from 'react-router-dom'
import useLogin from '../Hooks/useLogin'
// import { useNavigate } from 'react-router-dom'
// import { useEffect } from 'react'
import useRedirect from '../Hooks/useRedirect'
import { useLocation } from 'react-router-dom'
import routes from '../helpers/routes'

function App () {
const loggued = useLogin()
const location = useLocation().pathname
useRedirect(loggued, routes.home, routes.login)

return(
<div id='app'>

<div id='nav-app' className='w-100'>
<NavApp/>
</div>
<div className='d-grid'>
<Outlet/>
</div>

<div id='bottom-nav' className='d-fex justify-content-center align-items-center'>
{location === routes.login ? '' : <BottomNav/>}
</div>

</div>
)
}

export default App