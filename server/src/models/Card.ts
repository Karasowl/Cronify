import {Schema, model, Document } from "mongoose";

enum TypeOfCard{
    DO,
    STOP
}

type Card = TypeOfCard


interface ICard extends Document{
    title:string,
    type: TypeOfCard
    starTime:number,
    days: object[],
    goals:object[],
}

const UserSchema:Schema = new Schema({
    title:{type: TypeOfCard, required:true},
    type:{type: String, required:true},
    starTime:{type: Number, required:true},
    days:Array,
    goals:Array
}, {timestamps:true})


const Card = model<ICard>('Card', UserSchema)
