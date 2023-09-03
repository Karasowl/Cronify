import { ECardsType, IUser } from '../types'
import UserModel from '../models/User'
import CardModel from '../models/Card'
import { Request, Response } from 'express'

export const getCards = async (req: Request, res:Response) =>{
const cards = await CardModel.find()
res.status(200).send(cards)

}
    
export const createCard = async (req: Request, res:Response) =>{
    
    const {title, starTime, cardType, user, goals} = req.body
    const newCard = new CardModel({
        title,
        starTime : Date.now(),
        cardType,
        user,
        goals,

    })
    await newCard.validate();
    await newCard.save()
    res.status(200).send(newCard)

}

export const createUser = async (req: Request, res:Response) =>{
    
    try{
        const {username, password, email} = req.body
        console.log(username, password, email)

        const newUser = new UserModel({
            username,
            email,
            password
        })
        await newUser.save()
        .then((result) => {
            console.log(`Usuario guardado: ${result}`)
        })
        .catch((err)=>{
            console.log(`Error al guardar usuario: ${err} `)
        })
        res.status(200).send(newUser)
    }catch(error){
        console.log(error)
        res.status(500).send(`Error creating user: ${error}`)
        return;
    }



}


export const login = async (req: Request, res:Response) =>{
    
    try{
        //
        if(!req.body.email || !req.body.password)
            return res.status(400).json({
                auth: false,
                msg: `Email and password are required`
            }) 


        //
        const {email, password} = req.body
        const user = await UserModel.findOne({email}) as IUser

        //
        if(!user){
           return res.status(404).send({
                auth: false,
                msg: `El email ${email} no se encuentra registrado`,
            })
        }

        //
        const passMatch = await user.comparePass(password)
        console.log(password, passMatch);
        
        if(!passMatch){
            return res.status(401).json({
                auth: false,
                msg: `El password no es correcto`
            })
        }

        res.status(200).json({
            auth: true,
            msg: `User ${user.username} logged in`,
            user, 
        })} catch(error){
        res.status(500).json({
            auth: false,
            msg: `Error getting user: ${error}`
        }
            )
        return
    }



}

    
