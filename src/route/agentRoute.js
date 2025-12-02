import { Router } from "express";
const router = Router();
router.post("/agent",async(req,res,next)=>{
    res.send("Agent Route is working");
})
export { router };