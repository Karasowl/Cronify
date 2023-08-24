import {Schema, model, Document } from "mongoose";

type Card = 'DO'|'STOP'


interface ICard extends Document{
    title:string,
    type: Card
    starTime:number,
    days: object[],
    goals:object[],
    user: string
}

const UserSchema:Schema = new Schema({
    title:{type: String, required:true},
    type:{type: String, required:true},
    starTime:{type: Number, required:true},
    days:Array,
    goals:Array,
    user: {type: Schema.Types.ObjectId, ref:'User'}
}, {timestamps:true})


export default model<ICard>('Card', UserSchema)
