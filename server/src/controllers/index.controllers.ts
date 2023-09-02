import { ECardsType } from '../types'
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
        const {username, password, email, appTime } = req.body
        const newUser = new UserModel({
            username,
            email,
            password,
            appTime
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


export const getUser = async (req: Request, res:Response) =>{
    
    try{
        const userId = req.params.id
        const user = await UserModel.findById(userId)
        
        if(user){
            res.status(200).send(user)
        } else{
            res.status(404).send(user)
        }
    

       
    }catch(error){
        console.log(error)
        res.status(500).send(`Error deleting user: ${error}`)
        return
    }



}

    
