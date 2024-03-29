import { Router } from 'express'
import '../controllers/index.controllers'
import {createCard, createUser, getCards, login, auth, updateCard, deleteCard} from '../controllers/index.controllers'

const router = Router();

router.get('/', (req, res) => {
    res.status(200).send('server active')
})

//Users
router.post('/api/create-user',createUser)
router.post('/api/login',login)
router.get('/api/auth',auth)
//Cards
router.post('/api/create-card',createCard)
router.get('/api/get-cards',getCards)
router.patch('/api/update-card/:id',updateCard)
router.delete('/api/delete-card/:id',deleteCard)

export default router