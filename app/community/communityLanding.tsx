import { AppColors, AppFonts, AppFontSizes, Spacing } from "@/constants/theme";
import React, { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View, ViewStyle
} from "react-native";
import NavBar from "../components/navbar";
import { useSessionStore } from "./sessionStore";
import { useCommunity } from "./useComm";
const { width, height } = Dimensions.get("window");
const isDesktopLike = width > 800;

//send messages button
export function InstantMessageBar({
  friends,
  onSend,
}: {
  friends: any[];
  onSend: (receiverId: string, message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [text, setText] = useState("");

  return (
    <View style={{ position: "absolute", right: 20, top: 200, zIndex: 100 }}>
      {/* MAIN BUTTON */}
      <TouchableOpacity
        onPress={() => setOpen((p) => !p)}
        style={{
          backgroundColor: AppColors.blue,
          padding: 12,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white" }}>💬</Text>
      </TouchableOpacity>

      {/* FRIEND LIST */}
      {open && !selectedFriend && (
        <View
          style={{
            backgroundColor: "white",
            borderWidth: 2,
            borderColor: AppColors.blue,
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
          }}
        >
          {friends.map((f) => (
            <TouchableOpacity
              key={f._id}
              onPress={() => setSelectedFriend(f)}
              style={{ padding: 8 }}
            >
              <Text>{f.username}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* MESSAGE INPUT */}
      {selectedFriend && (
        <View
          style={{
            marginTop: 10,
            backgroundColor: "white",
            borderWidth: 2,
            borderColor: AppColors.blue,
            padding: 10,
            borderRadius: 10,
            width: 200,
          }}
        >
          <Text>To: {selectedFriend.username}</Text>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type message..."
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              marginTop: 5,
              padding: 5,
            }}
          />

          <TouchableOpacity
            onPress={() => {
              onSend(selectedFriend._id, text);
              setText("");
              setSelectedFriend(null);
              setOpen(false);
            }}
            style={{
              marginTop: 8,
              backgroundColor: AppColors.blue,
              padding: 8,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "white" }}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

//message component

interface MessageBarProps {
  name: string;
  content: React.ReactNode;
  style?: ViewStyle;
}

export function MessageBar({ name, content, style }: MessageBarProps) {
  return (
    <View style={[stylesMsg.container, style]}>
      {/* Name (top label) */}
      <View style={stylesMsg.header}>
        <Text style={stylesMsg.name}>{name}</Text>
      </View>

      {/* Content */}
      <View style={stylesMsg.content}>
        {typeof content === "string" ? (
          <Text style={stylesMsg.text}>{content}</Text>
        ) : (
          content
        )}
      </View>
    </View>
  );
}

const stylesMsg = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: AppColors.lilac,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderRadius: 12,
    padding: Spacing.sm,
    minWidth: 80,

    // shadow (same aesthetic as your buttons)
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },

  header: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.blue,
    paddingBottom: 4,
    marginBottom: 6,
  },

  name: {
    ...AppFonts.body,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    fontWeight: "600",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    ...AppFonts.body,
    fontSize: AppFontSizes.body,
    color: AppColors.blue,
  },
});

//emojis component

const EMOJIS = ["😀", "😂", "😍", "😎", "😡", "😴", "🔥", "💀"];

export function EmojiBar({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={stylesEmoji.wrapper}>
      {/* trigger */}
      <TouchableOpacity
        onPress={() => setOpen((p) => !p)}
        style={[stylesEmoji.trigger, open && stylesEmoji.triggerActive]}
      >
        <Text style={{ fontSize: 20 }}>😊</Text>
      </TouchableOpacity>

      {/* expanded bar */}
      {open && (
        <View style={stylesEmoji.container}>
          {EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => {
                onSelect(e);
                setOpen(false);
              }}
              style={stylesEmoji.emojiBtn}
            >
              <Text style={{ fontSize: 18 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const stylesEmoji = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    top: 200,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
  },

  trigger: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  triggerActive: {
    backgroundColor: AppColors.blue,
  },

  container: {
    flexDirection: "row",
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginLeft: -10,
    gap: 10,
    alignItems: "center",
  },

  emojiBtn: {
    padding: 6,
  },
});

//buttons component
interface SceneButtonProps {
  name: string;
  onPress: () => void;
  x: number;
  y: number;
  style?: ViewStyle;
}

export function SceneButton({
  name,
  onPress,
  x,
  y,
  style,
}: SceneButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
                position: "absolute",
                left: x,
                top: y,
                backgroundColor: AppColors.lilac,
                borderRadius: 10,
                borderWidth: 3,
                borderColor: AppColors.blue,
                paddingHorizontal: Spacing.xl,
                paddingVertical: Spacing.sm,
                shadowColor: AppColors.blue,
                shadowOffset: { width: 4, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 4,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text style={{ ...AppFonts.body, color: AppColors.blue, fontSize: AppFontSizes.body }}>{name}</Text>
    </TouchableOpacity>
  );
}

/* -------------------- SCENE LAYERS -------------------- */

const Background = () => (
  <View
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: "#FFF",
    }}
  />
);

const Sky = () => (
  <View
    style={{
      position: "absolute",
      height: 600,
      width: "100%",
      backgroundColor: AppColors.lilac,
    }}
  />
);

const Ground = () => (
  <View
    style={{
      position: "absolute",
      bottom: 0,
      height: "40%",
      width: "100%",
      backgroundColor: AppColors.blue,
    }}
  />
);

const Props = () => (
  <>
  </>
);

const Characters = () => (
  <View
  />
);

/* -------------------- HINTS -------------------- */

const ScrollHints = () => (
  <View
    style={{
      position: "absolute",
      top: 20,
      left: 20,
      zIndex: 10,
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: 10,
      borderRadius: 8,
    }}
  >
    <Text style={{ color: "white", fontSize: 12 }}>
      {isDesktopLike
        ? "← Scroll horizontally →"
        : "↑ Scroll vertically ↓"}
    </Text>
  </View>
);

const Buttons = () => {
    return (

    <>
        <SceneButton
        name="Slide"
        x={200}
        y={300}
        onPress={() => console.log("Menu clicked")}
        />

        <SceneButton
        name="Swing"
        x={300}
        y={300}
        onPress={() => console.log("Profile clicked")}
        />

        <SceneButton
        name="Fish"
        x={400}
        y={300}
        onPress={() => console.log("Profile clicked")}
        />

        <SceneButton
        name="Boat"
        x={500}
        y={300}
        onPress={() => console.log("Profile clicked")}
        />

        <SceneButton
        name="Ride"
        x={600}
        y={300}
        onPress={() => console.log("Profile clicked")}
        />

        <SceneButton
        name="Feed"
        x={700}
        y={300}
        onPress={() => console.log("Profile clicked")}
        />
  </>
    );
}

/* -------------------- SCENE -------------------- */

const Scene = ({
  messages,
}: {
  messages: { id: number; name: string; content: string; x: number; y: number }[];
}) => {
  return (
    <>
      <Background />
      <Sky />
      <Ground />
      <Props />
      <Characters />

      <Buttons />
      <ScrollHints />

      {messages.map((msg) => (
        <MessageBar
          key={msg.id}
          name={msg.name}
          content={msg.content}
          style={{
            position: "absolute",
            left: msg.x,
            top: msg.y,
          }}
        />
      ))}
    </>
  );
};


/* -------------------- PAGE -------------------- */

export default function CommunityLanding() {

    const {loadMessages, send} = useCommunity(); 
    const [messages, setMessages] = React.useState<
    { id: number; name: string; content: string; x: number; y: number }[]
    >([]);
    const session = useSessionStore((state) => state.session);
    console.log("session:",session);

    const friends = session?.participants ?? [];
    
    //emojis handler
    const addEmojiMessage = (emoji: string) => {
    setMessages((prev) => [
        ...prev,
        {
        id: Date.now(),
        name: "You",
        content: emoji,
        x: 400 + Math.random() * 600,
        y: 300 + Math.random() * 400,
        },
    ]);
    };

  return (
    <View style={{ flex: 1 }}>
      {/* FIXED NAVBAR */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <NavBar />

    <EmojiBar onSelect={addEmojiMessage} />

    <InstantMessageBar
      friends={friends}
      onSend={send}
    />
      </View>

      {/* SCENE AREA */}
      <ScrollView
        horizontal={isDesktopLike}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 60, // space for navbar
        }}
      >
        <View
          style={{
            width: isDesktopLike ? 3000 : width,
            height: isDesktopLike ? height : 3000,
            position: "relative",
          }}
        >
<Scene
  messages={messages}
/>
        </View>
      </ScrollView>
    </View>
  );
}