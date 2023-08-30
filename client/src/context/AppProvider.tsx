import {AppContext} from './AppContext'
import.meta.env


const INITIAL_STATE:TAppContext = {
  isLoguedState: false
}

const TodoProvider = ({children}:TProps) => {
  return (
    <AppContext.Provider value={INITIAL_STATE}>{children}</AppContext.Provider>
  )
}

export default TodoProvider