import { useEffect, useRef, useState } from "react";
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

// useSocket.ts — return connected state
export function useSocket(userId: string | null) {
  const socketRef = useRef<Socket>(getSocket());
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socket = socketRef.current;

    const handleConnect = () => {
      console.log("[useSocket] connected, registering:", userId);
      socket.emit("register", userId);
      setIsRegistered(true);
    };

    socket.on("connect", handleConnect);

    if (socket.connected) {
      socket.emit("register", userId);
      setIsRegistered(true);
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [userId]);

  return { socket: socketRef.current, isRegistered };
}