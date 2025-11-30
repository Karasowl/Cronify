import {Schema, model, Document } from "mongoose";
import {ICard} from '../types'


const CardSchema:Schema = new Schema({
    title:{
        type: String, 
        required:[true, 'El título es requerido'],
        trim:true,
        minlength: [3,'El título debe tener al menos 3 caracteres'],
        maxlength: [20, 'El título no debe ser mayor que 20 caracteres'],
    },
    user: {
        type: Schema.Types.ObjectId, 
        ref:'User',
        required:[true, 'El usuario es requerido']
    },
    cardType:{
        type: Object, 
        required:[true, 'El tipo de tarjeta es requerido'],
    },
    starTime:{
        type: Date, 
        required:[false]
    },
    goals:{
        type:Array,
        required:[true, 'Los objetivos son requeridos'],
        index:true

    },
    maxReached:{
        type:Object,
        default: null
    }
}, {timestamps:true})


export default model<ICard>('Card', CardSchema)
