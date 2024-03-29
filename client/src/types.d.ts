import ECardsType from './helpers/enums'

//date-fns custom

export type TProps = {
    children: JSX.Element | JSX.Element[]
}

export interface IPropsHome {
  updateCards: (value: number) => void,
  card: Types.ICard | object
}



export interface ILoginState {
    isLogged: boolean,
    setLoginState: (value:boolean) => void
}
interface IUserContext  {
   loginState : ILoginState
   user: IUser
   setUser: (value:IUser) => void
}


//fecth

export interface IFetchOptions extends RequestInit{
    url: string,
    options?: {
        method: string,
        headers?: {
            'Content-Type'?: string,
            auth?: string
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

//User

interface IUser {
  _id?: string,
    username:string,
    password:string,
    email:string,
    cards:object[],
    appTime: Date,
    comparePass(hashPass: string): Promise<boolean>
  }



  //Auth
  interface IAuthData {
    auth: string,
    user?: IUser
  }

  //Cards

  
  type TSegundos = number
  
  type TDay = {
      Ischeck: boolean,
      date: Date,
  }
  
  
  interface TGoal extends Document {
      achieved: boolean,
      startDate: Date
      totalTime: number
  }
  
  type TStopBegin = string //o Date?
  type TStopEnd = string //o Date?
  
  type TStop = [TStopBegin,TStopEnd] | []
  
  type TCard = {
  type: ECardsType,
  totalTime: TSegundos,
  stops: TStop
  days: TDay[]
  }

  export interface ICard{
    _id?: string,
    cardType: TCard,
    createdAt?,
    goals: TGoal[]
    starTime:Date | string,
    title:string,
    user: string,
    maxReached: Duration | null
}