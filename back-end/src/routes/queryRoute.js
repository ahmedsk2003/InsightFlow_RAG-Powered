// import express from "express";
// import {handleQuery} from "../services/openaiService.js"

// const router = express.Router()

// // Post  /api/query
// router.post("/",async(req,res) => {

//    try {
//     const {query} = req.body

//     if(!query ){ 
//         return res.status(400).json({error: "Query is required"})
//     }

//     const response = await handleQuery(query)

//     res.json({
//         success: true,
//         answer: response.answer,
//         sources: response.sources || []

//     })

    
//    } catch (err) {
//     console.error("Error in /api/query:" ,err)

//     res.status(500).json({ error: "Server Error"})
//    }

// })

// export default router;

import express from "express";
import {handleQuery} from "../services/openaiService.js"

const router = express.Router()

// Post  /api/query
router.post("/",async(req,res) => {

   try {
    const {query} = req.body

    if(!query ){ 
        return res.status(400).json({error: "Query is required"})
    }

    const response = await handleQuery(query)

    res.json({
        success: true,
        answer: response.answer,
        sources: response.sources || []

    })

    
   } catch (err) {
    console.error("Error in /api/query:" ,err)

    res.status(500).json({ error: "Server Error"})
   }

})

export default router;
