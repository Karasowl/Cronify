import { createContext } from "react";
import * as Types from '../../types'

const ErrorContext = createContext({} as Types.IErrorContext)

export default ErrorContext