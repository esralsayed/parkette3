import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"; // 🔁 replace with your server URL

let socketInstance: Socket | null = null;
console.log("useSocket module loaded");

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function useSocket(userId: string | null) {
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    if (!userId) return;

    const socket = socketRef.current;

    if (!socket.connected) {
      socket.connect();
    }

    // Register this user with the server so userSocketMap works
    socket.emit("register", userId);

socket.on('connect', () => {
  socket.emit('register', userId);
});

    console.log("imported useSocket =", useSocket);

    return () => {
      // Don't disconnect on unmount — keep alive for the session
      // socket.disconnect();
    };
  }, [userId]);

  return socketRef.current;
}