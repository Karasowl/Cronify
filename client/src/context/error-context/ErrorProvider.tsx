import { useState } from "react"
import ErrorContext from "./Error-context"
import * as Types from "./../../types"

//[{errorMessage: '', errorStatus: null}]

 const ErrorProvider = ({children}:Types.TProps) => {
    const [err, setErr] = useState<Types.TError[]>([])

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

    const addError = (error:Types.TError):void => {
        setErr([...err, error])
    
    }
    
    const errorState:Types.IErrorContext = {
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
