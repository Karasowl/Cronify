import { jwt } from 'jsonwebtoken';
import {Document} from "mongoose";

//Cards
export enum ECardsType {
    DO ='DO',
    STOP = 'STOP'
    }

type TSegundos = number

type TDay = {
    Ischeck: boolean,
    date: Date,
}


interface TGoal extends Document {
    id: string,
    active: boolean,
    achieved: boolean,
    startDate: Date,
    totalTime: number
}

type TStopBegin = Date
type TStopEnd = Date

type TStop = [TStopBegin,TStopEnd] | []

type TCard = {
type: ECardsType,
totalTime: TSegundos,
stops: TStop
days: TDay[]
}

 export interface ICard extends Document{
    cardType: TCard,
    createdAt?,
    goals: TGoal[]
    starTime:Date,
    title:string,
    user: string,
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

//auth
export interface IAuth extends Document{
    token: string,
    createdAt: Date,
}

