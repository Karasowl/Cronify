import { ECardsType, IUser } from '../types'
import UserModel from '../models/User'
import CardModel from '../models/Card'
import AuthModel from '../models/Auth'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

export const getCards = async (req: Request, res:Response) =>{
  try {
    const {auth} = req.headers
    const authFound = await AuthModel.findOne({token: auth})
    if(!authFound){
      return res.status(404).json({ success: false, message: `Ups, necesita loguearse para acceder`})
    }
    const cards = await CardModel.find()
    return res.status(200).json({ success: true, data: cards })
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

export const createCard = async (req: Request, res:Response) =>{ 
  try {
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

    return res.status(201).json({ success: true, data: newCard })
  } catch (error) {
    if(error instanceof Error){
        return res.status(400).json({ success: false, message: error.message })
    } else {
        return res.status(500).json({ success: false, message: (error as Error).message })
    }
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body

    const newUser = new UserModel({
      username: username,
      email: email,
      password: password,
    })

   const user = await newUser.save()
   const payload = {
    id: user._id
   }
    const token = jwt.sign(payload, JWT_SECRET )
    const newAuth = new AuthModel({
      token,
      createdAt: Date.now()
    })
    await newAuth.save()
    return res.status(201).json({ success: true, data: {
      auth: token,
      user
    } })
  } catch (error) {
    if(error instanceof Error){
        return res.status(400).json({ success: false, message: error.message })
    } else {
        return res.status(500).json({ success: false, message: (error as Error).message })
    }
  }
}

export const login = async (req: Request, res:Response) =>{
  try {
    if(!req.body.email || !req.body.password)
      return res.status(400).json({ success: false, message: "Email and password are required" }) 

    const {email, password, stayLogged} = req.body
    const user = await UserModel.findOne({email}, {__v:0, _id:0}) as IUser

    if(!user){
      return res.status(404).json({ success: false, message: `El email ${email} no se encuentra registrado`})
    }

    const passMatch = await user.comparePass(password)

    if(!passMatch){
      return res.status(401).json({ success: false, message: `El password no es correcto`})
    }

    const payload = {
      id: user._id
     }
      const token = jwt.sign(payload, JWT_SECRET )
      const newAuth = new AuthModel({
        token,
        createdAt: Date.now()
      })
      await newAuth.save()
      return res.status(201).json({ success: true, data: {
        auth: token,
        user
      } })
  } catch(error){
    return res.status(500).json({ success: false, message: `Error getting user: ${error}`})
  }
}

export const auth = async (req: Request, res: Response) => {
    try {
      const {auth} = req.headers
      
      const authFound = await AuthModel.findOne({token:auth})
      if(!authFound){
        return res.status(404).json({ success: false, message: `No tiene autorización para acceder`})
      }
      return res.status(201).json({ success: true, data: {
        auth:authFound,
      }})
    } catch (error) {
      console.log(error)
      
      return res.status(404).json({ success: false, message: `Comprobación de autorización no completada: ${error}`})
    }
    
}
