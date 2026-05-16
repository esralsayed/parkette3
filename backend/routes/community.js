import express from "express";
import { io, userSocketMap } from "../app.js";
import { CommunityPost, Message } from "../models/Chat/community.js";
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
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find all users who have this userId in their friends array
    // but this user hasn't added them back yet
    const requests = await User.find({
      friends: userId,           // they added me
      _id: { $nin: user.friends, $ne: userId } // but I haven't added them
    }).select('_id name username level avatar.skin avatar.hair friendCode');

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

// messages
import { classifyMessage, moderateChildMessage } from "./moderation.js";

communityroutes.post("/messages/send", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({
        message: "senderId, receiverId, and content are required",
      });
    }

    // ================= MODERATION =================
    const moderationResult = await moderateChildMessage(content);

    console.log("[MODERATION RESULT]", moderationResult);

    if (moderationResult.flagged) {
    return res.status(403).json({
      message: "Message blocked by moderation system",
      reason: "unsafe_content_detected",
    });
  }
    console.log("FLAGGED?", moderationResult.flagged);
    console.log("CATEGORIES", moderationResult.categories);
    const classification =
    await classifyMessage(content, moderationResult);

    console.log(classification);

    // ==============================================

    // Map Groq tier → your schema's status enum
    const statusMap = {
      safe: "approved",
      needs_caution: "flagged",
      unsafe: "blocked",
    };

    // Map Groq's free-form reasons → your schema's flagReasons enum
    const reasonMap = {
      "Threats": "bullying",
      "Explicit bullying": "bullying",
      "Mild bullying": "bullying",
      "Hate speech": "inappropriate_language",
      "Sexual content": "adult_content",
      "Grooming": "adult_content",
      "Predatory behavior": "adult_content",
      "Asking for personal information": "personal_info_detected",
      "Sharing contact info": "personal_info_detected",
      "Violence": "other",
      "Emotional manipulation": "other",
      "Suspicious behavior": "other",
    };

    const mappedStatus = statusMap[classification.tier] ?? "flagged";
    const mappedReasons = (classification.reasons || [])
      .map(r => reasonMap[r] ?? "other")
      .filter((v, i, arr) => arr.indexOf(v) === i); // deduplicate

    const isBlocked = classification.tier === "unsafe";
    const needsReview = classification.tier === "needs_caution";

    const msg = await Message.create({
      senderId,
      receiverId,

      // Use sanitized text if provided
      content:
        classification.sanitized?.trim()?.length > 0
          ? classification.sanitized
          : content,

       moderation: {
        status: mappedStatus,
        flagReasons: mappedReasons,
        reviewedAt: new Date(),
        autoModerated: true,
        blocked: isBlocked,
        needsReview: needsReview,
      },
    });

    // Only deliver to receiver if safe
    if (!isBlocked && !needsReview) {
      const socketId = userSocketMap.get(receiverId);
      if (socketId) {
        io.to(socketId).emit("new_message", msg);
      }
    }

    return res.status(201).json({
      ...msg.toObject(),
      delivered: !isBlocked && !needsReview,
      moderationTier: classification.tier,
    });

  } catch (error) {
    console.error("[MESSAGE SEND ERROR]", error);

    return res.status(500).json({
      message: "Failed to send message",
    });
  }
});

//sessions routes

import { Session } from "../models/Chat/Session.js";

// ==================== CREATE SESSION ====================

communityroutes.post("/session/create", async (req, res) => {
  try {
    const { hostId, friendIds } = req.body;

     console.log("hostId:", hostId);
    console.log("friendIds:", friendIds);
    console.log("userSocketMap:", Object.fromEntries(userSocketMap));

    const session = new Session({
      host: hostId,
      participants: [hostId, ...friendIds]
    });

    await session.save();
    await session.populate('host participants', 'name username level avatar');

    const sessionId = session._id.toString();

    // Notify all participants
    session.participants.forEach(p => {
      const socketId = userSocketMap.get(p._id.toString());
      if (socketId) {
        io.to(socketId).emit('session_created', {
          sessionId,
          session: session
        });
const socket = io.sockets.sockets.get(socketId);
if (socket) {
  socket.join(sessionId);
}
      }
    });

    return res.status(201).json({ session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

communityroutes.post("/session/post", async (req, res) => {
  try {
    console.log(req.body);
    const { sessionId, senderId, content, type } = req.body;
    console.log("[SESSION POST] sockets in room:", io.sockets.adapter.rooms.get(sessionId));

    if (!sessionId || !senderId || !content || !type) 
      return res.status(400).json({ message: "Missing required fields" });

    if (type === "emoji") {
      const post = await CommunityPost.create({  // ← was missing await
        sessionId,
        senderId,                  
        content,
        isVisible: true                           // ← was = instead of :
      });

      // Broadcast to everyone in the session room
      io.to(sessionId).emit("session_emoji", {
        senderId,
        content,
        postId: post._id,
        sessionId
      });

      return res.status(201).json({ post });      // ← was missing return
    }

  } catch (error) {
    console.error("[SESSION POST] Error:", error.message);
    return res.status(500).json({ message: "Failed to send" });
  }
});


communityroutes.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log("session Id" , sessionId);

    if (!sessionId) 
    return res.status(404).json({ message: "Session Id not found" });

    const session = await Session.findById(sessionId); 
    if (!session) return res.status(404).json({ message: "Session not found" });

    return res.status(200).json({ session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==================== LEAVE SESSION ====================
communityroutes.post("/session/leave", async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Remove user from participants
    session.participants = session.participants.filter(
      id => id.toString() !== userId
    );

    if (session.participants.length === 0) {
      // Delete empty session
      await Session.findByIdAndDelete(sessionId);
    } else {
      // If host left → assign new host
      if (session.host.toString() === userId) {
        session.host = session.participants[0];
      }
      await session.save();
    }

    // Notify others
    io.to(sessionId).emit("member_left", { 
      userId, 
      message: "A player left the community" 
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
export default communityroutes; 