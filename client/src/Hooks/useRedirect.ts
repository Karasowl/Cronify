import { useNavigate, useLocation } from "react-router-dom";
import {useEffect} from 'react'

export const useRedirect = (condition:boolean, urlTrue:string, urlFalse:string = "", exemptions:string[] = []) => {
    const navigate = useNavigate()
    const location = useLocation().pathname

    useEffect(() => {
        const foundOne = exemptions.find(ex => ex === location)
        if (typeof foundOne === 'undefined' ){
            condition ? navigate(urlTrue, { replace: true }) : navigate(urlFalse, { replace: true })
        } else return
        }, [condition, navigate]);
    

}

export default useRedirect
