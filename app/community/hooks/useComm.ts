import {
  addFriend,
  approveFriendRequest,
  broadcast,
  createSession,
  denyFriendRequest,
  getFriendRequests,
  getFriends,
  getMessagesWithFriend,
  getMyFriendCode, leaveSession, removeFriend, sendMessage
} from '@/app/community/repository/Community';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getSocket } from '../services/useSocket';
import { useSessionStore } from './sessionStore';

interface Friend {
  _id: string;
  name: string;
  username: string;
  level: number;
  avatar: {
    skin: string | null;
    hair: string | null;
  };
}

interface Session {
  host: Friend;
  participants: Friend[];
}

export function useCommunity() {
  const [friends, setFriends] = useState<Friend[]>([]);
  //const [session, setSession] = useState<Session | null>(null);
  const [myFriendCode, setMyFriendCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<Friend[]>([]);
  const { setSession } = useSessionStore(); 

async function loadRequests() {
  try {
    const data = await getFriendRequests();
    setRequests(data.requests);
  } catch (e: any) {
    setError(e.message);
  }
}

useEffect(() => {
  loadFriends();
  loadMyFriendCode();
  loadRequests();
}, []);

async function handleApprove(friendId: string) {
  try {
    const data = await approveFriendRequest(friendId);
    // move from requests to friends
    setRequests(prev => prev.filter(r => r._id !== friendId));
    setFriends(prev => [...prev, data.friend]);
  } catch (e: any) {
    setError(e.message);
  }
}

async function handleDeny(friendId: string) {
  try {
    await denyFriendRequest(friendId);
    setRequests(prev => prev.filter(r => r._id !== friendId));
  } catch (e: any) {
    setError(e.message);
  }
}

  // Load friends on mount
  useEffect(() => {
    loadFriends();
    loadMyFriendCode();
  }, []);

  async function loadFriends() {
    setLoading(true);
    try {
      const data = await getFriends();
      setFriends(data.friends);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMyFriendCode() {
    try {
      const code = await getMyFriendCode();
      setMyFriendCode(code);
    } catch (e: any) {
      setError(e.message);
    }
  }

async function startSession(friendIds: string[]) {
  const s = getSocket();
  console.log("socket connected?", s.connected); // should now be true
  console.log("socket id?", s.id);

  setLoading(true);
  try {
    const data = await createSession(friendIds);
    setSession(data.session);
    router.push(`/community/components/communityLanding`);
  } catch (e: any) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
}

    async function leave(sessionId: string, userId: string) {
    try {
      await leaveSession(sessionId, userId);
      setSession(null); 
      router.push(`/community/components/friendsList`); 
    } catch (e: any) {
      setError(e.message);
      throw e; 
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFriend(friendCode: string) {
    setLoading(true);
    try {
      const data = await addFriend(friendCode);
      // add new friend to list without refetching
      setFriends(prev => [...prev, data.friend]);
      return data.message;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFriend(friendId: string) {
  try {
    await removeFriend(friendId);
    setFriends(prev => prev.filter(f => f._id !== friendId));
  } catch (e: any) {
    setError(e.message);
  }
}

//for messages
  const [messages, setMessages] = useState<any[]>([]);

  // load chat with friend
  const loadMessages = async (friendId: string) => {
    setLoading(true);
    try {
      const data = await getMessagesWithFriend(friendId);
      setMessages(data.messages);
    } finally {
      setLoading(false);
    }
  };

  // send message
  const send = async (receiverId: string, content: string) => {
    const msg = await sendMessage(receiverId, content);

    // optimistic UI update
    setMessages((prev) => [...prev, msg]);

    return msg;
  };


  return {
    friends,
    myFriendCode,
    loading,
    error,
    startSession,
    broadcast,
    handleAddFriend,
    loadFriends,
    handleDeny,
    requests, 
    leave,
    handleApprove,
    handleRemoveFriend, messages, send, loadMessages, 
  };
}