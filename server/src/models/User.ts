import { IUser } from './../types.d'
import {Schema, model, Document } from "mongoose"
import bcrypt from 'bcrypt'



const UserSchema:Schema = new Schema({
    username:{
        type: String, 
        required:[true, 'El nombre de usuario es requerido'],
        unique:[true, 'El nombre de usuario ya existe'],
        minlength: [5, 'El nombre de usuario debe tener al menos 5 caracteres'],
        maxlength: [10, 'El nombre de usuario no debe ser mayor que 10 caracteres'],
        match:[/^[a-zA-Z][a-zA-Z0-9._-]{5,9}$/, 'El nombre de usuario debe empezar con una letra y tener entre 6 y 10 caracteres alfanuméricos, puntos, guiones bajos o guiones']
    },
    password:{
        type: String, 
        required:[true, 'La contraseña es requerida'],
        trim:true,
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
        maxlength: [24, 'La contraseña no debe ser mayor que 24 caracteres'],
        match:[/^(?=.*[A-Z]{1,})(?=.*[a-z]{3,})(?=.*[0-9]{1,})(?=.*[!@#$&*]).{8,24}$/, 'La contraseña debe contener al menos una mayúscula, tres minúsculas, un dígito, un carácter especial (!@#$&*) y tener entre 8 y 24 caracteres'  ]
    },
    email:{
        type: String, 
        required:[true, 'El email es requerido'], 
        unique:[true, 'El email ya existe'],
        match:[/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Por favor, ingresa una dirección de correo electrónico válida']
    },
    cards:[{type: Schema.Types.ObjectId, ref:'Card'}],
    appTime:{
        type:Date,
        required:[true, 'La fecha de inicio es requerida'],
        default: Date.now()
    },
}, {timestamps:true})


UserSchema.pre<IUser>('save', async function(next){
    const user = this
    if(!user.isModified()) return next()
    const salt = await bcrypt.genSalt(10)
    const hashPass = await bcrypt.hash(user.password, salt)
    user.password = hashPass
    return next()
})

UserSchema.methods.comparePass = async function (hashPass:string) {
    const user = this as IUser
    return await bcrypt.compare(hashPass, user.password)
}

export default model<IUser>('User', UserSchema)