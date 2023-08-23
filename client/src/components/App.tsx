import './Sass/App.scss'
import NavApp from './NavApp/NavApp'
import BottomNav from './BottomNav/BottomNav'
import BodyCard from './Cards/BodyCard'

function App () {

return(
<>
<NavApp/>
<div className='container col-12 d-flex justify-content-end align-items-center flex-column mb-5'>
<BodyCard/>
<BottomNav/>
</div>
</>
)
}

export default App