import { useState } from "react"
import ErrorContext from "./Error-context"
import.meta.env

//[{errorMessage: '', errorStatus: null}]

 const ErrorProvider = ({children}:TProps) => {
    const [err, setErr] = useState<TError[]>([])

    const clearError = (index:number):void => {
        setErr(prevErr => prevErr.filter((_, i) =>{
            if(i===index) console.log(`Encontrado: ${index} es el índice de JSX y ${i} es el índice de Array`)
            return i !== index
        }))
    }
    const showErr = ():boolean => {
        if(err.length > 0){
            return true
        }
        else{
            return false
        }
    }

    const addError = (error:TError):void => {
        setErr([...err, error])
    
    }
    
    const errorState:IErrorContext = {
        err,
        showErr,
        addError,
        clearError
    }


  return (
    <ErrorContext.Provider value={errorState}>{children}</ErrorContext.Provider>
  )
}

export default ErrorProvider
