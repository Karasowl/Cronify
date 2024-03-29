import mongoose from "mongoose"




const {DB_HOST, DB_SERVER, DB_USER, DB_PASS, DB_DATABASE} = process.env;
const URI = `${DB_HOST}://${DB_USER}:${DB_PASS}${DB_SERVER}/${DB_DATABASE}`

// let isOnline:any

// (async()=>{
//      isOnline = await import('is-online')
//      const online = await isOnline()
//      console.log(online)
// })()


mongoose.connection.once('connecting', ()=>{
console.log('Database is connecting')
})

mongoose.connect(URI)
.then( db => console.log(`Database is connected`))
.catch(err => console.log(`Error ${err.message} from Database`))

mongoose.connection.on('error',(err)=>{
console.log(`Error de base de datos: ${err}`)
})

