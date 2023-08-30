import '../Sass/App.scss'
import NavApp from './NavApp/NavApp'
import BottomNav from './BottomNav/BottomNav'
import {Outlet, useNavigation, useNavigate} from 'react-router-dom'
import { useContext, useEffect } from 'react'
import TodoProvider from '../context/AppProvider'
import {AppContext} from '../context/AppContext'

function App () {
const navigation = useNavigation()
const navigate = useNavigate()
const {isLoguedState} = useContext(AppContext)

useEffect(() => {
    if(isLoguedState){
        navigate('/home', {replace: true})
    }else{
        navigate('/login', {replace: true})
    }

},[isLoguedState])

return(
<TodoProvider>
<div id='app'>

<div id='nav-app' className='w-100'>
<NavApp/>
</div>

<div className={
    navigation.state === 'loading' ? 'loading' : ''
}>
<div className='d-grid'>
<Outlet/>
</div>
</div>

<div id='bottom-nav' className='d-fex justify-content-center align-items-center'>
<BottomNav/>
</div>

</div>
</TodoProvider>
)
}

export default App