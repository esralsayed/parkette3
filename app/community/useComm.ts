import {
  addFriend,
  approveFriendRequest, denyFriendRequest,
  getCommunitySession,
  getFriendRequests,
  getFriends, getMyFriendCode, removeFriend
} from '@/app/repositories/Community';
import { useEffect, useState } from 'react';

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
  const [session, setSession] = useState<Session | null>(null);
  const [myFriendCode, setMyFriendCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<Friend[]>([]);

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
    setLoading(true);
    try {
      const data = await getCommunitySession(friendIds);
      setSession(data.session);
    } catch (e: any) {
      setError(e.message);
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

  return {
    friends,
    session,
    myFriendCode,
    loading,
    error,
    startSession,
    handleAddFriend,
    loadFriends,
    handleDeny,
    requests, 
    handleApprove,
    handleRemoveFriend
  };
}