

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
        body?: string
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
  export type TError = {
    errorMessage: string,
    errorStatus: number | null

}

export interface IErrorContext {
    err: TError[],
    showErr: () => boolean,
    addError: (value:TError) => void,
    clearError: (index:number) => void
  }
  
