import { useEffect, useState } from "react";
import { getSocket } from "./useSocket";

export function useDirectMessages(userId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const handleMessage = (msg: any) => {
      if (msg.senderId !== userId && msg.receiverId !== userId) return;

      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new_message", handleMessage);

    return () => {
      socket.off("new_message", handleMessage);
    };
  }, [userId]);

  return { messages };
}