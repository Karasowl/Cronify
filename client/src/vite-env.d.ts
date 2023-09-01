/// <reference types="vite/client" />

type TProps = {
    children: JSX.Element | JSX.Element[]
}


interface ILoginState {
    isLogged: boolean,
    setLogged: (value:boolean) => void
}
interface IUserContext  {
   loginState : ILoginState
}


//fecth

interface IFetchOptions {
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