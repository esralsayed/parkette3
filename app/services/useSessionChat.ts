import { useEffect, useState } from "react";
import { getSocket } from "./useSocket";

export function useSessionChat(sessionId: string | null, currentUserId: string | null) {
  const [posts, setPosts] = useState<any[]>([]);
  const [emojis, setEmojis] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();

    const handleEmoji = (data: any) => {
      if (data.sessionId !== sessionId) return;
    if (data.senderId === currentUserId) return;   // ← ignore own emojis


      setEmojis((prev) => [...prev, data]);
    };

    socket.on("session_emoji", handleEmoji);

    return () => {
      socket.off("session_emoji", handleEmoji);
    };
  }, [sessionId]);

  return { posts, emojis };
}