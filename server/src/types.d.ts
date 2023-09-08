import {Document} from "mongoose";

//Cards
export enum ECardsType {
DO,
STOP
}

type TSegundos = number

type TDay = {
    Ischeck: boolean,
    date: Date,
}


interface TGoal extends Document {
    achieved: boolean,
    startDate: Date,
    totalTime: number
}

type TStopBegin = Date
type TStopEnd = Date

type TStop = [TStopBegin,TStopEnd]

type TCard = {
type: ECardsType,
totalTime: TSegundos,
stops: TStop
days: TDay[]
}

 export interface ICard extends Document{
    title:string,
    user: IUser,
    cardType: TCard,
    starTime:Date,
    goals: TGoal[]
}

//user
export interface IUser extends Document{
    _id?: string,
    username:string,
    password:string,
    email:string,
    cards:object[],
    appTime: Date,
    comparePass(hashPass: string): Promise<boolean>
}

