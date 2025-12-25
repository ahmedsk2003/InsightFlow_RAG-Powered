import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import queryRoute from "./routes/queryRoute.js"
import uploadroute from "./routes/uploadRoute.js"
import analyzeRoute from "./routes/analyzeRoute.js"
import previewRoute from "./routes/previewRoute.js";

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/preview",previewRoute)


//routes 

app.use("/api/query", queryRoute)
app.use("/api/upload",uploadroute)
app.use("/api/analyze",analyzeRoute)


const PORT = process.env.PORT || 4000;
app.listen( PORT, ()=> {
    console.log(`backend is running on port ${PORT}`)

})

