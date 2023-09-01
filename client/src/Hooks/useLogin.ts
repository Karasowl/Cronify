import { useEffect, useContext } from 'react'
import { fetcherGET } from '../helpers/fetch'
import userContext from '../context/user-context'
// import { useNavigate } from 'react-router-dom'
import.meta.env





const useLogin = () => {

    const userState = useContext(userContext)
    // const navigate = useNavigate()

    // const userID = localStorage.getItem('userID')
    const userID = '64f1b0f62bb7b645e5c44fa0'
    // const token = localStorage.getItem('token')

    const fetchinOptions: IFetchOptions = {
        url: `http://localhost:9785/api/get-user/${userID}`,
       options: {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`
        },
       }
    }

    useEffect(() => {
        
        const updateLogin = async () => {
            try{
                const response = await fetcherGET(fetchinOptions) as Response
                console.log(response)
                
                
                if(response.status === 200){
                    console.log(`Usuario iniciado correctamente`)
                    
                    userState.loginState.setLogged(true)
                    console.log(`loginstate ahora esta en ${userState.loginState.isLogged}`)
                    
                } else {
                 console.log(`Ocurrió un error al iniciar sesión: ${response.status}`)
                }
            } catch(err){ 
                console.log(err)
            } }

            updateLogin()

            
          
        
    },[])

    return userState.loginState.isLogged
        
}

export default useLogin

