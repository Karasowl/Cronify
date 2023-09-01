import { Router } from 'express'
import '../controllers/index.controllers'
import {createCard, createUser, getCards, getUser} from '../controllers/index.controllers'

const router = Router();

router.get('/', (req, res) => {
    res.status(200).send('server active')
})

//GetCards
router.get('/api/get-cards',getCards)
router.post('/api/create-card',createCard)
router.post('/api/create-user',createUser)
router.get('/api/get-user/:id',getUser)

export default router