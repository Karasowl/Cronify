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
    const card1 = new CardModel()
    card1.title = 'card1'
    card1.user = user1._id
    card1.type = 'DO'
    card1.starTime = Date.now()
    card1.days = [{day:1, time:new Date(), done:false}]
    card1.save()
    user1.cards.push(card1)
    user1.save()
    const response = {
        user1,
        card1
    }
    res.status(200).send(response)

}
    
