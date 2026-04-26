import express from "express";
import Diary from "../models/Diary.js";
import { User } from "../models/User.js";
const diaryroutes = express.Router(); 

// GET /api/diary/ => to get the diary
diaryroutes.get("/", async (req,res) => {
    try{

        console.log("fetching diary...", req.body); 
        const { userId } = req.body; 
        if (!userId) 
            return res.status(400).json({ message: "userId required" });

        //fetch the diary
        const diary = await Diary.find({userId}); //getting the diary, the diary will be initilazed when user signsup for the first time.

        console.log("got the diary?",diary); 
        res.json(diary); 
    } catch(err){
    console.error("Error fetching diary:", err);
    res.status(500).json({ message: "Server error" });
    }
})

export const createDiaryForUser = async (userId, name) => {
  const existing = await Diary.findOne({ userId });
  if (existing) return existing;

  return await Diary.create({
    userId,
    diaryTitle: { text: `${name}'s diary` }
  });
};

// POST /api/diary/ => ill use use this for now to add a diary bc i alr have a user (for adminnn)
diaryroutes.post("/admin", async (req, res) => {
  try {
    console.log("adding diary...", req.query);

    const { userId } = req.query;

    if (!userId)
      return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const diary = await createDiaryForUser(userId, user.name);

    return res.status(201).json({
      message: "Diary created successfully",
      diary
    });

  } catch (err) {
    console.error("Error creating diary:", err);
    res.status(500).json({ message: "Server error" });
  }
});

diaryroutes.delete("/admin", async (req,res) => {
    try{
        console.log("deleting diary...", req.query); 
        const { userId } = req.query; 
        if (!userId) 
            return res.status(400).json({ message: "userId required" });

        //fetch the diary
        const diary = await Diary.deleteOne({userId: userId}); //creating a diary
        console.log("deleted the diary?",diary); 
        res.json(diary); 
    } catch(err){
    console.error("Error deleting diary:", err);
    res.status(500).json({ message: "Server error" });
    }
})


//for editing but u should edit it to have diaryId instead
diaryroutes.put("/save/:userId/cover", async (req,res) => {
    try{
        console.log("saving diary cover...", req.query); 
        console.log(req.body); 
        const { userId } = req.params; 
        if (!userId) 
            return res.status(400).json({ message: "userId required" });

        const filter = {userId};
        const update = req.body;

        //fetch the diary
        const diary = await Diary.findOneAndUpdate(filter,update, {returnDocument:"after"}); 
        console.log("editing the diary?",diary); 
        res.json(diary); 
    } catch(err){
    console.error("Error editing diary:", err);
    res.status(500).json({ message: "Server error" });
    }
})


export default diaryroutes; 