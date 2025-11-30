import { useState } from "react"
import ErrorContext from "./Error-context"
import * as Types from "./../../types"


 const ErrorProvider = ({children}:Types.TProps) => {
    const [err, setErr] = useState<string[]>([])

    const clearError = (index:number):void => {
        setErr(prevErr => prevErr.filter((_, i) =>{
            return i !== index
    }))
    console.log('Clearing error at index', index, 'new errors:', err);
    }

    const addError = (error:string):void => {
        setErr(prevErr => [...prevErr, error]);
      }
      
    
    const errorState:Types.IErrorContext = {
        err,
        addError,
        clearError
    }


  return (
    <ErrorContext.Provider value={errorState}>{children}</ErrorContext.Provider>
  )
}

export default ErrorProvider
