import '../Sass/App.scss'
import NavApp from './NavApp/NavApp'
import BottomNav from './BottomNav/BottomNav'
import {Outlet, useNavigation, useNavigate} from 'react-router-dom'
import { useEffect } from 'react'

function App () {
const navigation = useNavigation()
const navigate = useNavigate()

useEffect(() => {
navigate('/home', {replace: true})
},[])

return(
<div id='app'>

<div id='nav-app' className='w-100'>
<NavApp/>
</div>

<div className={
    navigation.state === 'loading' ? 'loading' : ''
}>
<Outlet/>
</div>

<div id='bottom-nav' className='d-fex justify-content-center align-items-center'>
<BottomNav/>
</div>

</div>
)
}

export default App