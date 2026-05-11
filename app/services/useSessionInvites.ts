import { router } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import { useSessionStore } from "../community/sessionStore";
import { getSocket } from "./useSocket";

export function useSessionInvite(currentUserId: string | null) {
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = getSocket();

    const onSessionCreated = (data: any) => {
      console.log("session_created received!", data);

      setSession(data.session);

      Alert.alert(
        "Session Invite 🎮",
        `${data.session.host.username} invited you to join a session!`,
        [
          {
            text: "Join",
            onPress: () =>
              router.replace("/community/communityLanding"),
          },
          { text: "Decline", style: "cancel" },
        ]
      );
    };

    socket.on("session_created", onSessionCreated);

    return () => {
      socket.off("session_created", onSessionCreated);
    };
  }, [currentUserId]);
}