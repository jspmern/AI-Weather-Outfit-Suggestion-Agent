import { Router } from "express";
import { weatherOutfitAgent } from "../agent/weatherOutfitAgent.js";
const router = Router();
router.post("/agent",async(req,res,next)=>{
    console.log("")
 let response= await weatherOutfitAgent({query:req.body.message})
    res.json({message:response})
})
export { router };