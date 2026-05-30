import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 
`${process.env.EXPO_PUBLIC_API_URL}/api/community` || 'http://localhost:5000/api/community';

async function getHeaders() {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function getUserId(): Promise<string> {
  const userStr = await AsyncStorage.getItem('user');
  if (!userStr) throw new Error('No user found');
  return JSON.parse(userStr).id;
}

// 1. Get friends list
export async function getFriends() {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/friends/${userId}`, { headers });
  if (!response.ok) throw new Error('Failed to load friends');
  return response.json(); // { friends: [...] }
}

// 2. Get community session with chosen friends
export async function createSession(friendIds: string[]) {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/session/create`, {
    method: "POST",          // ← was missing
    headers,
    body: JSON.stringify({
      hostId: userId,        // ← renamed to match backend's { hostId }
      friendIds,
    }),
  });

  if (!response.ok) throw new Error('Failed to load session');
  return response.json(); // { session: { host, participants } }
}

export async function leaveSession(sessionId: string, userId: string) {
  const headers = await getHeaders();

  await fetch(`${API_URL}/session/leave`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      sessionId,
      userId,
    }),
  });
}

export const broadcast = async (
  sessionId: string,
  senderId: string,
  content: string,
  type: string
) => {
  try {
    const headers = await getHeaders();

    const res = await fetch(`${API_URL}/session/post`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        senderId,
        content,
        type,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("[BROADCAST ERROR]", res.status, error);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[BROADCAST NETWORK ERROR]", err);
    return null;
  }
};

// 3. Add friend by code
export async function addFriend(friendCode: string) {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/friends/add`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, friendCode }),
  });
  if (!response.ok) throw new Error('Failed to add friend');
  return response.json(); // { message, friend }
}

// 4. Get my friend code to display to others
export async function getMyFriendCode(): Promise<string> {
  const userStr = await AsyncStorage.getItem('user');
  if (!userStr) throw new Error('No user found');
  const userId = JSON.parse(userStr).id;
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/friendcode/${userId}`, { headers });
  if (!response.ok) throw new Error('Failed to get friend code');
  const data = await response.json();
  return data.friendCode;
}

// Get pending friend requests
export async function getFriendRequests() {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/friends/requests/${userId}`, { headers });
  if (!response.ok) throw new Error('Failed to load requests');
  return response.json(); // { requests: [...] }
}

export async function removeFriend(friendId: string) {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/friends/remove`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, friendId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to remove friend');
  }

  return response.json();
}

// Approve a friend request
export async function approveFriendRequest(friendId: string) {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/friends/approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, friendId }),
  });
  if (!response.ok) throw new Error('Failed to approve request');
  return response.json();
}

// Deny a friend request
export async function denyFriendRequest(friendId: string) {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/friends/deny`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, friendId }),
  });
  if (!response.ok) throw new Error('Failed to deny request');
  return response.json();
}

// 1. Send message (creates MessageSchema doc)
export async function sendMessage(receiverId: string, content: string) {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(`${API_URL}/messages/send`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      senderId: userId,
      receiverId,
      content,
    }),
  });

  if (!response.ok) throw new Error("Failed to send message");
  return response.json(); // returns saved Message
}

export async function getMessagesWithFriend(friendId: string) {
  const userId = await getUserId();
  const headers = await getHeaders();

  const response = await fetch(
    `${API_URL}/messages/${userId}/${friendId}`,
    { headers }
  );

  if (!response.ok) throw new Error("Failed to load messages");
  return response.json(); // { messages: [...] }
}