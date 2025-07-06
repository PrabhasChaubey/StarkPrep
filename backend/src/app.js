import express from "express"
import cors from"cors"
import cookieParser from "cookie-parser"


const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//kuch config karna padta hai
app.use(express.json({limit:"16kb"})) //json se data aaye toh
app.use(express.urlencoded({extended:true,limit:"16kb"}))//url ke liye config
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import contestRoutes from './routes/contest.routes.js';

//routes declaration
app.use("/api/v1/users",userRouter);
app.use('/api/v2/contests', contestRoutes);


//http://localhost:8000/api/v1/users/register
export {app}