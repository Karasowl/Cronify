import { Schema, model } from "mongoose";
import { IAuth } from "../types";

const Auth = new Schema({
    token: {
        type: String,
        require: [true, 'falta el jwt']
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        expires: 60 * 60 * 24
    }
})

export default model<IAuth>('Auth', Auth)