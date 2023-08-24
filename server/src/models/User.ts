import {Schema, model, Document } from "mongoose";


interface IUser extends Document{
    username:string,
    password:string,
    email:string,
    cards:object[],
    appTime: Date,
}

const UserSchema:Schema = new Schema({
    username:{type: String, required:true},
    password:{type: String, required:true},
    email:String,
    cards:[{type: Schema.Types.ObjectId, ref:'Card'}],
    appTime:Date,
}, {timestamps:true})


export default model<IUser>('User', UserSchema)