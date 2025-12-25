import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import queryRoute from "./routes/queryRoute.js"
import uploadroute from "./routes/uploadRoute.js"
import analyzeRoute from "./routes/analyzeRoute.js"


dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())


//routes 

app.use("/api/query", queryRoute)
app.use("/api/upload",uploadroute)
app.use("/api/analyze",analyzeRoute)


const PORT = process.env.PORT || 4000;
app.listen( PORT, ()=> {
    console.log(`backend is running on port ${PORT}`)

})

