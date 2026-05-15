import Dog from "@/assets/svgs/community/animals/dog.svg";
import Hamster from "@/assets/svgs/community/animals/hamester.svg";
import Rabbit from "@/assets/svgs/community/animals/rabbit.svg";
import Boat1 from "@/assets/svgs/community/boat1.svg";
import Bush1 from "@/assets/svgs/community/bush1.svg";
import Character1 from "@/assets/svgs/community/char1.svg";
import Cloud2 from "@/assets/svgs/community/cloud2.svg";
import Cloud3 from "@/assets/svgs/community/cloud3.svg";
import Fish from "@/assets/svgs/community/fish1.svg";
import Char4 from '@/assets/svgs/community/Girl 11.svg';
import Char3 from '@/assets/svgs/community/Girl 4.svg';
import Char5 from '@/assets/svgs/community/Girl 8.svg';
import Char2 from '@/assets/svgs/community/girl2.svg';
import House from "@/assets/svgs/community/houseandfriends.svg";
import Seesaw from "@/assets/svgs/community/seesaw.svg";
import Senara from "@/assets/svgs/community/senara.svg";
import Slide from "@/assets/svgs/community/slide.svg";
import Swing from "@/assets/svgs/community/swing.svg";
import Tree1 from "@/assets/svgs/community/tree.svg";
import { AppColors, AppFonts, AppFontSizes, Spacing } from "@/constants/theme";
import React from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import NavBar from "../../components/navbar";
import { useSessionStore as useCommunitySession } from "../hooks/sessionStore";
import { useCommunity } from "../hooks/useComm";
import { useDirectMessages } from "../services/useMessages";
import { useSessionStore } from "../services/userSession";
import { useSessionChat } from "../services/useSessionChat";
import { EmojiBar, InstantMessageBar, MessageBar } from "./Messages&Posts";

const { width, height } = Dimensions.get("window");
const isDesktopLike = width > 800;


// Each "page" is PAGE_WIDTH wide
const PAGE_WIDTH = isDesktopLike ? width : width;
const SCENE_WIDTH = PAGE_WIDTH * 4; // 4 pages total
const SCENE_HEIGHT = isDesktopLike ? height : 3000;

// ─────────────────────────────────────────────
// SCENE BUTTON
// ─────────────────────────────────────────────
interface SceneButtonProps {
  name: string;
  onPress: () => void;
  x: number;
  y: number;
  style?: ViewStyle;
}

export function SceneButton({ name, onPress, x, y, style }: SceneButtonProps) {
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
      <Text
        style={{
          ...AppFonts.body,
          color: AppColors.blue,
          fontSize: AppFontSizes.body,
        }}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// SCENE LAYOUT
// ─────────────────────────────────────────────

const Background = () => (
  <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: AppColors.lilac}} />
);

const Sky = () => (
  <View style={{ position: "absolute", height: "60%", width: "100%", backgroundColor: AppColors.lilac }} />
);

const Ground = ({ totalWidth }: { totalWidth: number }) => (
  <View
    style={{
      position: "absolute",
      bottom: 0,
      height: "38%",
      width: totalWidth,
      backgroundColor: AppColors.blue,
    }}
  />
);

// ─────────────────────────────────────────────
// PAGE SECTIONS
// ─────────────────────────────────────────────

/**
 * Page 1: Character avatar placeholder, House, Tree, Slide
 */
const Page1 = ({ offsetX, groundY }: { offsetX: number; groundY: number }) => (
  <>
    <House
      style={{ position: 'absolute', left: offsetX + 20, top: groundY - 650 }}
      width={1400}
      height={1200}
    />
    <Character1 style={{ position: 'absolute', left: offsetX + 100, top: groundY - 150 }}
      width={350}
      height={350} />
    <Slide
      style={{ position: 'absolute', left: offsetX + PAGE_WIDTH - 850, top: groundY - 640 }}
      width={1000}
      height={1200}
    />
    <Char2 style={{ position: 'absolute', left: offsetX + 1200, top: groundY - 100 }}
      width={350}
      height={350} />

    {/* Slide button */}
    <SceneButton
      name="Slide"
      x={offsetX + PAGE_WIDTH - 110}
      y={groundY + 10}
      onPress={() => console.log("Slide clicked")}
    />
  </>
);

/**
 * Page 2: Swing, Seesaw (Ride), extra Tree
 */
const Page2 = ({ offsetX, groundY }: { offsetX: number; groundY: number }) => (
  <>
    {/* Clouds */}
    <Cloud2 style={{ position: 'absolute', left: offsetX + 300, top: groundY - 700 }}
      width={500}
      height={500} />

    {/* Swing set */}
    <Swing style={{ position: 'absolute', left: offsetX -400, top: groundY - 800 }}
      width={1400}
      height={1200} />

        <Char3 style={{ position: 'absolute', left: offsetX + 150, top: groundY - 300 }}
      width={300}
      height={300} />

    {/* Seesaw (Ride) */}
    <Seesaw style={{ position: 'absolute', left: offsetX + 600, top: groundY - 150 }}
      width={500}
      height={500} />

    {/* Tree */}
    <Tree1 style={{ position: 'absolute', left: offsetX + 650, top: groundY - 650 }}
      width={1400}
      height={1200} />

    {/* Swing button */}
    <SceneButton
      name="Swing"
      x={offsetX + 60}
      y={groundY + 10}
      onPress={() => console.log("Swing clicked")}
    />

    {/* Ride button */}
    <SceneButton
      name="Ride"
      x={offsetX + PAGE_WIDTH / 2 - 60}
      y={groundY -50}
      onPress={() => console.log("Ride clicked")}
    />
  </>
);

/**
 * Page 3: Boat, Fishes
 */
const Page3 = ({ offsetX, groundY }: { offsetX: number; groundY: number }) => {
  const waterTop = groundY;
  return (
    <>
      {/* Clouds */}
      <Cloud3 style={{ position: 'absolute', left: offsetX + 650, top: groundY - 650 }}
      width={500}
      height={500} />
    <Char4 style={{ position: 'absolute', left: offsetX + 600, top: groundY - 200 }}
      width={300}
      height={300} />
      {/* Boat on water line */}
      <Boat1 style={{ position: 'absolute', left: offsetX - 50, top: groundY - 450 }}
      width={800}
      height={800} />

      {/* Fishes below water (in the blue ground area) */}
      <Fish style={{ position: 'absolute', left: offsetX + 650, top: groundY - 400 }}
      width={1400}
      height={1200}/>

      <Senara style={{ position: 'absolute', left: offsetX + 800, top: groundY - 80 }}
      width={400}
      height={400} />

    {/* Fish button (this page has Fish activity) */}
    <SceneButton
      name="Fish"
      x={offsetX + PAGE_WIDTH / 2 + 200}
      y={groundY + 10}
      onPress={() => console.log("Fish clicked")}
    />

      {/* Boat button */}
      <SceneButton
        name="Boat"
        x={offsetX + 80}
        y={waterTop - 14 - 50}
        onPress={() => console.log("Boat clicked")}
      />
    </>
  );
};

/**
 * Page 4: Animals, Trees, Bushes, Feed button
 */
const Page4 = ({ offsetX, groundY }: { offsetX: number; groundY: number }) => (
  <>
    {/* Clouds */}
    <Cloud2 style={{ position: 'absolute', left: offsetX + 650, top: groundY - 650 }}
      width={500}
      height={500} />

    {/* Big tree (right side) */}
    <Tree1 style={{ position: 'absolute', left: offsetX + 650, top: groundY - 800 }}
      width={1400}
      height={1200}  />

    {/* Bushes across */}
    <Bush1 style={{ position: 'absolute', left: offsetX + 1200, top: groundY - 100 }}
      width={300}
      height={300} />
    <Bush1 style={{ position: 'absolute', left: offsetX + 1450, top: groundY - 100 }}
      width={300}
      height={300}/>

    <Char5 style={{ position: 'absolute', left: offsetX + 950, top: groundY - 250 }}
      width={300}
      height={300} />

    {/* Octopus / main pet */}
    <Dog style={{ position: 'absolute', left: offsetX + 350, top: groundY - 150 }}
      width={300}
      height={300} />

    {/* Animals */}
    <Rabbit style={{ position: 'absolute', left: offsetX + 50, top: groundY - 50 }}
      width={300}
      height={300} />
    <Hamster style={{ position: 'absolute', left: offsetX + 650, top: groundY - 50 }}
      width={250}
      height={250} />

    {/* Flowers on ground */}
    

    {/* Feed button */}
    <SceneButton
      name="Feed"
      x={offsetX + PAGE_WIDTH / 2 - 40}
      y={groundY + 10}
      onPress={() => console.log("Feed clicked")}
    />
  </>
);

// ─────────────────────────────────────────────
// FULL SCENE
// ─────────────────────────────────────────────

const Scene = ({
  messages,
  groundY,
}: {
  messages: { id: number; name: string; content: string; x: number; y: number }[];
  groundY: number;
}) => {
  return (
    <>
      <Background />
      <Sky />
      <Ground totalWidth={SCENE_WIDTH} />

      {/* 4 Pages */}
      <Page1 offsetX={0} groundY={groundY} />
      <Page2 offsetX={PAGE_WIDTH} groundY={groundY} />
      <Page3 offsetX={PAGE_WIDTH * 2} groundY={groundY} />
      <Page4 offsetX={PAGE_WIDTH * 3} groundY={groundY} />

      {/* Page dividers (subtle) */}
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: PAGE_WIDTH * i - 1,
            top: 0,
            width: 2,
            height: SCENE_HEIGHT,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
      ))}

      {/* Floating chat messages */}
      {messages.map((msg) => (
        <MessageBar
          key={msg.id}
          name={msg.name}
          content={msg.content}
          style={{ position: "absolute", left: msg.x, top: msg.y }}
        />
      ))}
    </>
  );
};

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function CommunityLanding() {
  const { friends: allFriends, send, leave, broadcast } = useCommunity();

  const session = useCommunitySession((state) => state.session);
  const currentUserId = useSessionStore((state) => state.user?.id);
  const sessionId = session?._id ?? null;

  const { emojis } = useSessionChat(sessionId, currentUserId ?? null);
  const { messages } = useDirectMessages(currentUserId ?? null);

  const [sceneMessages, setSceneMessages] = React.useState<
    { id: number; name: string; content: string; x: number; y: number }[]
  >([]);

  // Ground sits at 62% of scene height
  const groundY = SCENE_HEIGHT * 0.62;

const friends = (session?.participants ?? [])
  .filter((id: any) => id !== currentUserId)
  .map((id: any) => allFriends.find((f) => f._id === id))
  .filter(Boolean);

  console.log("[SESSION]", session);
console.log("[FRIENDS]", friends);

  // DM messages → scene
  React.useEffect(() => {
    if (!messages.length) return;
    const latest = messages[messages.length - 1];
    const sender = session?.participants?.find((f: any) => f._id === latest.senderId);
    setSceneMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: sender?.username ?? "Friend",
        content: latest.content,
        x: 200 + Math.random() * 600,
        y: 200 + Math.random() * 400,
      },
    ]);
  }, [messages]);

  // Session emojis → scene
  React.useEffect(() => {
    if (!emojis.length) return;
    const latest = emojis[emojis.length - 1];
    const sender = session?.participants?.find((f: any) => f._id === latest.senderId);
    setSceneMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: sender?.username ?? "Friend",
        content: latest.content,
        x: 400 + Math.random() * 600,
        y: 300 + Math.random() * 400,
      },
    ]);
  }, [emojis]);

  // Emoji send
  const addEmojiMessage = async (emoji: string) => {
    setSceneMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "You",
        content: emoji,
        x: 400 + Math.random() * 600,
        y: 300 + Math.random() * 400,
      },
    ]);
    if (sessionId && currentUserId) {
      await broadcast(sessionId, currentUserId, emoji, "emoji");
    }
  };

  // Leave session
  const handleLeave = async () => {
    if (!sessionId || !currentUserId) return;
    try {
      await leave(sessionId, currentUserId);
    } catch (e) {
      console.error("Failed to leave session", e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed top UI */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 }}>
        <NavBar />
        <TouchableOpacity
          onPress={handleLeave}
          style={{
            backgroundColor: AppColors.blue,
            padding: 10,
            margin: 8,
            borderRadius: 8,
            alignSelf: "flex-end",
            marginTop: 12,
          }}
        >
          <Text style={{ color: AppColors.lilac, ...AppFonts.body, fontSize: AppFontSizes.body }}>
            Leave Session
          </Text>
        </TouchableOpacity>
        <EmojiBar onSelect={addEmojiMessage} />
        <InstantMessageBar friends={friends} onSend={send} />
      </View>

      {/* Scrollable world — always horizontal so all 4 pages are side-by-side */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 60 }}
      >
        <View
          style={{
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
            position: "relative",
          }}
        >
          <Scene messages={sceneMessages} groundY={groundY} />
        </View>
      </ScrollView>

    </View>
  );
}