import express from "express";
import { User } from "../models/User.js";
const communityroutes = express.Router(); 

// 1. GET friends list with details
communityroutes.get("/friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate({
        path: 'friends',
        select: 'name username level avatar.skin avatar.hair' // only what you need
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ friends: user.friends });
  } catch (err) {
    console.error("Error loading friends:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. GET community session with chosen friends
communityroutes.get("/session/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { friendIds } = req.query; // e.g. ?friendIds=id1,id2

    const friendIdList = friendIds ? friendIds.split(',') : [];

    // Get current user
    const user = await User.findById(userId)
      .select('name username level avatar');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get chosen friends
    const friends = await User.find({
      _id: { $in: friendIdList },
      friends: userId // security: only load if they're actually your friend
    }).select('name username level avatar');

    return res.status(200).json({
      session: {
        host: user,
        participants: friends,
      }
    });
  } catch (err) {
    console.error("Error loading session:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - send a friend request using their code
communityroutes.post("/friends/add", async (req, res) => {
  try {
    const { userId, friendCode } = req.body;
    console.log('userId received:', userId);

    // Find the friend by their code
    const friend = await User.findOne({ friendCode });
    if (!friend) return res.status(404).json({ message: "No user found with that code" });

    // Can't add yourself
    if (friend._id.toString() === userId) {
      return res.status(400).json({ message: "You can't add yourself" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already friends
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Add each other as friends (mutual)
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: friend._id } });
    //await User.findByIdAndUpdate(friend._id, { $addToSet: { friends: userId } });

    console.log(friendCode, userId); 

    return res.status(200).json({ message: "Friend added!", friend: {
      name: friend.name,
      username: friend.username,
      friendCode: friend.friendCode,
    }});
  } catch (err) {
    console.error("Error adding friend:", err);
    res.status(500).json({ message: "Server error" });
  }
});

communityroutes.get("/friendcode/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('friendCode');
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ friendCode: user.friendCode });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST - remove a friend
communityroutes.post("/friends/remove", async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ message: "Missing userId or friendId" });
    }

    // Remove both directions (mutual unfriend)
    await User.findByIdAndUpdate(userId,   { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    return res.status(200).json({ message: "Friend removed" });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET pending friend requests for a user
communityroutes.get("/friends/requests/:userId", async (req, res) => {
  try {
    console.log("ARE WE HERE?")
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find all users who have this userId in their friends array
    // but this user hasn't added them back yet
    const requests = await User.find({
      friends: userId,           // they added me
      _id: { $nin: user.friends, $ne: userId } // but I haven't added them
    }).select('_id name username level avatar.skin avatar.hair friendCode');

    console.log(requests);

    return res.status(200).json({ requests });
  } catch (err) {
    console.error("Error loading friend requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST approve a friend request
communityroutes.post("/friends/approve", async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Make sure request actually exists
    const friend = await User.findOne({ _id: friendId, friends: userId });
    if (!friend) return res.status(404).json({ message: "No request found" });

    // Add each other mutually
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });

    return res.status(200).json({ message: "Friend approved", friend: {
      _id: friend._id,
      name: friend.name,
      username: friend.username,
      level: friend.level,
      avatar: friend.avatar,
    }});
  } catch (err) {
    console.error("Error approving friend:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST deny a friend request
communityroutes.post("/friends/deny", async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    // Remove userId from their friends list
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    return res.status(200).json({ message: "Request denied" });
  } catch (err) {
    console.error("Error denying friend request:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default communityroutes; 