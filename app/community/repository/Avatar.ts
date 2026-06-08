import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/avatar` || 'http://localhost:5000/api/avatar';

export async function saveAvatar(updates: Record<string, string | null>) {
  const userStr = await AsyncStorage.getItem('user');  // ← matches what login stores
  const token = await AsyncStorage.getItem('token');

  if (!userStr) throw new Error('No user found');
  
  const user = JSON.parse(userStr);
  const userId = user.id;  // ← or user.id depending on what your backend returns

  const response = await fetch(`${BASE_URL}/users/${userId}/avatar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error('Failed to save avatar');
  return response.json();
}

export async function loadAvatar(): Promise<Record<string, string | null>> {
  const userStr = await AsyncStorage.getItem('user');
  const token = await AsyncStorage.getItem('token');

  if (!userStr) throw new Error('No user found');

  const user = JSON.parse(userStr);
  const userId = user.id;

  const response = await fetch(`${BASE_URL}/myavatar/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to load avatar');

  const data = await response.json();
  return data.avatar;
}