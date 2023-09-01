import '../Sass/App.scss'
import NavApp from './NavApp/NavApp'
import BottomNav from './BottomNav/BottomNav'
import {Outlet} from 'react-router-dom'
import useLogin from '../Hooks/useLogin'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function App () {
const navigate = useNavigate()

const logged = useLogin()
useEffect(() => {
    logged ? navigate('/home', { replace: true }) : navigate('/login', { replace: true });
  }, [logged, navigate]);


return(
<div id='app'>

<div id='nav-app' className='w-100'>
<NavApp/>
</div>
<div className='d-grid'>
<Outlet/>
</div>

<div id='bottom-nav' className='d-fex justify-content-center align-items-center'>
<BottomNav/>
</div>

</div>
)
}

export default App