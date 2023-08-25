import {Schema, model, Document } from "mongoose";
import {ICard} from '../types'


const UserSchema:Schema = new Schema({
    title:{type: String, required:true},
    type:{type: String, required:true},
    starTime:{type: Number, required:true},
    days:Array,
    goals:Array,
    user: {type: Schema.Types.ObjectId, ref:'User'}
}, {timestamps:true})


export default model<ICard>('Card', UserSchema)
