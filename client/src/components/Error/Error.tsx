import {useContext} from 'react'
import Alert from 'react-bootstrap/Alert'
import {Button} from 'react-bootstrap';
import ErrorContext from '../../context/error-context/Error-context'
import.meta.env

interface ErrorProps {
    showErr: boolean;
  }

function Error(showErr:ErrorProps) {
    const errorState = useContext(ErrorContext)

    if (showErr) {
      return (
        <div id='alert-errors' className='d-flex flex-column justify-content-center'>
          {errorState.err.map(({errorMessage, errorStatus}, index) =>
            <Alert className='alert' variant="danger" onClose={()=> {
                console.log(index)
                console.log(`tamaño: ${errorState.err.length}`)
                console.log(errorState.err)
                }}key={index+1}>
                <Button onClick={()=>{errorState.clearError(index)}} className='err-button'><i className='bi bi-x'></i></Button>
                <Alert.Heading className='alert-heading'>{`Oh snap! You got an error ${errorStatus}!`}</Alert.Heading>
                <p>{errorMessage}</p>
            </Alert>
          )}
        </div>
      );
    }
  }
  
  export default Error;
  