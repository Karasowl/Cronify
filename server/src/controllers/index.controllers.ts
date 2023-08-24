import UserModel from '../models/User'
import CardModel from '../models/Card'
import { Request, Response } from 'express'
import { ca } from 'date-fns/locale'

export const getCards = async (req: Request, res:Response) =>{
const cards = await CardModel.find()
res.status(200).send(cards)

}
    
export const createCard = (req: Request, res:Response) =>{
    const user1 = new UserModel()
    user1.username = 'kksk'
    user1.password = 'dggd'
    user1.appTime = new Date()
    user1.email = 'XXXXXXXXXXXXXX'
    const card3 = new CardModel()
    card3.title = 'card3'
    card3.user = user1._id
    card3.type = 'DO'
    card3.starTime = Date.now()
    card3.days = [{day:1, time:new Date(), done:false}]
    card3.save()
    user1.cards.push(card3)
    user1.save()
    const response = {
        user1,
        card1: card3
    }
    res.status(200).send(response)

}
    
