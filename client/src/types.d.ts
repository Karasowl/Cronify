


export type TProps = {
    children: JSX.Element | JSX.Element[]
}


export interface ILoginState {
    isLogged: boolean,
    setLogged: (value:boolean) => void
}
interface IUserContext  {
   loginState : ILoginState
}


//fecth

export interface IFetchOptions extends RequestInit{
    url: string,
    options?: {
        method: string,
        headers?: {
            'Content-Type': string,
            'Authorization'?: string
        },
        body?: STRING
    }
}

//NavBar

export type INavBarPage = {
    title: string,
    containerClassName: string,
    toggleClassName: string,
    buttonClassName:string
  }
  
  export interface INavBarPages {
    [key: string]: TNavBarPage
  }

  //Error

export interface IErrorContext {
    err: string[],
    addError: (value:string) => void,
    clearError: (index:number) => void
  }
  
// Data of Responses

export interface IResponseData {
    success:boolean,
    data?: object
    message?: string,
}

interface IUser {
    username:string,
    password:string,
    email:string,
    cards:object[],
    appTime: Date,
    comparePass(hashPass: string): Promise<boolean>
  }
  interface IAuthData {
    auth: string,
    user: IUser
  }