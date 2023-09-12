import { useNavigate, useLocation } from "react-router-dom";
import {useEffect} from 'react'

export const useRedirect = (condition:boolean, urlCurrent:string[], urlNext:string = "") => {
    const navigate = useNavigate()
    const location = useLocation().pathname

    useEffect(() => {
        const foundOne = urlCurrent.find(ex => ex === location)
        if (typeof foundOne !== 'undefined' ){
            condition ? navigate(urlNext, { replace: true }) : null
        }
        console.log('useEffect de UseRedirect')
        
        }, [condition, navigate]);
    

}

export default useRedirect
