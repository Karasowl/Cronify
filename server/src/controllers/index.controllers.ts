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
        res.status(200).send(newUser)
    }catch(error){
        console.log(error)
        res.status(500).send(`Error creating user: ${error}`)
        return;
    }



}
    
