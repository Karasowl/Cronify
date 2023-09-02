import { useNavigate } from "react-router-dom";
import {useEffect} from 'react'

export const useRedirect = (condition:boolean, urlTrue:string, urlFalse:string) => {
    const navigate = useNavigate()

    useEffect(() => {
        condition ? navigate(urlTrue, { replace: true }) : navigate(urlFalse, { replace: true });
        }, [condition, navigate]);
    

}

export default useRedirect
