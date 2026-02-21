import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import AuthRoute from './routes/auth_route.js'
import cookieParser from "cookie-parser"
import cors from 'cors'

dotenv.config()
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

const port =process.env.PORT
app.listen(port, ()=>{
    console.log('Our Server is Running',port)
})

//database Connection
mongoose.connect(process.env.MONGO_DB).then(()=>{
    console.log('Database Connect')
}).catch(err => console.log('connection failed', err))

//routes
app.use('/api/auth', AuthRoute)
