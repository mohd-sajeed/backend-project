import asyncHandler from "../utils/asyncHandler.js";


const registeUser=asyncHandler(async(req,res)=>{
res.status(500).json({
    message:"chai aur code"
})
})

export default registeUser