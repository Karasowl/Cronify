import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import PORT from './config/app-port'

const server = express()

server.use(express.json())
server.use(cors())
server.use(morgan('dev'))

server.listen(PORT, () => {
    console.log(`server running in port ${PORT}`)
    
})

server.get('/', (req, res) => {
    res.status(200).send('server active')
})