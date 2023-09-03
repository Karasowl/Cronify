import { Router } from 'express'
import '../controllers/index.controllers'
import {createCard, createUser, getCards, login} from '../controllers/index.controllers'

const router = Router();

router.get('/', (req, res) => {
    res.status(200).send('server active')
})

//Cards
router.get('/api/get-cards',getCards)
router.post('/api/create-card',createCard)
//Users
router.post('/api/create-user',createUser)
router.post('/api/login',login)

export default router