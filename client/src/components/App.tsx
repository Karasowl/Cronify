import './Sass/App.scss'
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
<NavApp/>
<div className={
    navigation.state === 'loading' ? 'loading' : ''
}>
<Outlet/>
</div>
<BottomNav/>
</div>
)
}

export default App