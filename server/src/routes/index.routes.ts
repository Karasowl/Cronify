import { Router } from 'express'
import '../controllers/index.controllers'
import {createCard, getCards} from '../controllers/index.controllers'

const router = Router();

router.get('/', (req, res) => {
    res.status(200).send('server active')
})

//GetCards
router.get('/home/get-cards',getCards)
router.get('/home/create-card',createCard)

export default router