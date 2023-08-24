import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import PORT from './config/app-port'
import './database/db'
import routes from './routes/index.routes'

const server = express()

server.use(express.json())
server.use(cors())
server.use(morgan('dev'))
//rutas
server.use(routes)

server.listen(PORT, () => {
    console.log(`server running in port ${PORT}`)
    
})