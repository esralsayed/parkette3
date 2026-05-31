import express from 'express';
import { User } from '../models/User.js';
const avatarRoutes = express.Router(); 

// PATCH /api/users/:id/avatar
avatarRoutes.patch('/users/:id/avatar', async (req, res) => {
  try {
    console.log('are we inside backend? saving avatar?'); 
    const { hair, skin, gender, miniAvatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { avatar: { hair, skin, gender, miniAvatar } } },
      { new: true, runValidators: true }
    ).select('avatar');
    console.log(user);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save avatar', error: err.message });
  }
});

avatarRoutes.get("/myavatar/:userId", async (req,res) => {
    try{
        const { userId } = req.params; 
        
        const user = await User.findById(userId); 
        if (!user) return res.status(404).json({message: "User not found"}); 

        const avatar = user.avatar; //its an object
        console.log("are we in the backend loading?", avatar);

        if (!avatar) return res.status(404).json({message: "No avatar found for this user"});  //give option to make for the first time.
        
        return res.status(200).json({message: "Returned avatar", avatar}); 
    } catch (err){
        console.error("Error loading avatar", err); 
        res.status(500).json({message:"server error"}); 
    }
})

export default avatarRoutes; 