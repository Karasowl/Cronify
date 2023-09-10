import {useContext} from 'react'
import Alert from 'react-bootstrap/Alert'
import {Button} from 'react-bootstrap';
import ErrorContext from '../../context/error-context/Error-context'
import * as Types from "./../../types"



function Error() {
    const errorState:Types.IErrorContext = useContext(ErrorContext)
      return (
        <div id='alert-errors' className='d-flex flex-column justify-content-center'>
          {errorState.err.map((message:string, index) =>
            <Alert 
            className='alert' 
            variant="danger" 
            onClose={()=>{}}
            key={index+1}
            >
                <Button onClick={()=>{errorState.clearError(index)}} className='err-button'><i className='bi bi-x'></i></Button>
                <Alert.Heading className='alert-heading'></Alert.Heading>
                <p>{message}</p>
            </Alert>
          )}
        </div>
      )
    }
  
  export default Error;
  