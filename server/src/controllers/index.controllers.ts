import UserModel from '../models/User'
import CardModel from '../models/Card'
import { Request, Response } from 'express'

export const getCards = (req: Request, res:Response) =>{
    const user1 = new UserModel()
    user1.username = 'kksk'
    user1.password = 'dggd'
    user1.appTime = new Date()
    user1.email = 'XXXXXXXXXXXXXX'
    const card1 = new CardModel()
    card1.title = 'card1'
    card1.user = user1._id
    user1.cards.push(card1)
    res.status(200).send(user1)



}
    
