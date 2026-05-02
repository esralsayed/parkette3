import express from "express";
import { User } from "../models/User";
const communityroutes = express.Router(); 

// LOAD YOUR AVATAR
communityroutes.get("/avatar/:userId", async (req,res) => {
    try{
        const { userId } = req.params; 
        
        const user = await User.findById(userId); 
        if (!user) return res.status(404).json({message: "User not found"}); 

        const avatar = user.avatar; //its an object
        if (!avatar) return res.status(404).json({message: "No avatar found for this user"});  //give option to make for the first time.
        
        return res.status(200).json({message: "Returned avatar", avatar}); 
    } catch (err){
        console.error("Error loading avatar", err); 
        res.status(500).json({message:"server error"}); 
    }
})

//create avatar
communityroutes.put("/avatar/:userId", async (req,res) => {
    try{
        const { userId } = req.params; 
        const { hair, skin, top, bottom, shoes, accessory, pet } = req.body; //this will have all the avatar fields like hair, etc.
        if (!userId) return res.status(400).json({message: "userId required"}); 

        const user = await User.findByIdAndUpdate(userId,
            { $set: { avatar: { hair, skin, top, bottom, shoes, accessory, pet } } },
            { new: true, runValidators: true }
        ); 
        if (!user) return res.status(404).json({message: "User not found"}); 

  res.status(201).json(user.avatar);

    } catch (err){
        console.error("Error loading avatar", err); 
        res.status(500).json({message:"server error"}); 
    }
})

export default communityroutes; 