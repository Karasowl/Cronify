import { Router } from 'express'
import '../controllers/index.controllers'
import {getCards} from '../controllers/index.controllers'

const router = Router();

router.get('/', (req, res) => {
    res.status(200).send('server active')
})

//GetCards
router.get('/home/get-cards',getCards)

export default router