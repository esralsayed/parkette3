
import Angry from "@/assets/svgs/emojis/angry.svg";
import Heart from "@/assets/svgs/emojis/heart.svg";
import Kiss from "@/assets/svgs/emojis/kiss.svg";
import Message from "@/assets/svgs/emojis/messages.svg";
import Plain from "@/assets/svgs/emojis/plain.svg";
import Sleepy from "@/assets/svgs/emojis/sleepy.svg";
import Happy from "@/assets/svgs/emojis/smiley.svg";
import Wow from "@/assets/svgs/emojis/wow.svg";
import { AppColors, AppFonts, AppFontSizes, Spacing } from "@/constants/theme";
import React, { useState } from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View, ViewStyle
} from "react-native";
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
            backgroundColor: AppColors.lilac,
            padding: 10,
            borderRadius: 12,
            width: 80,
            height: 80,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: AppColors.blue,
            shadowColor: AppColors.blue,
            shadowOffset: { width: 4, height: 3 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4,
        }}
        >
        <Message width={80} height={80} />
        </TouchableOpacity>

      {/* FRIEND LIST */}
      {open && !selectedFriend && (
        <View
          style={{
            backgroundColor: AppColors.lilac,
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
              <Text
              style={[{
                ...AppFonts.body, 
                color: AppColors.blue,
                fontSize: 24
              }]}>{f.username}</Text>
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
            width: 400,
          }}
        >
          <Text style={[{...AppFonts.body, fontSize: AppFontSizes.body, color: AppColors.blue}]}>To: {selectedFriend.username}</Text>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type message..."
            style={{
            ...AppFonts.body,
            fontSize: 28,
            color:"#888888", 
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
            <Text style={{ color: AppColors.lilac, ...AppFonts.bodySmall, fontSize: 24 }}>Send</Text>
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

const EMOJIS = [<Happy />, <Angry/>, <Sleepy />, <Heart />, <Wow/>, <Kiss />];

export function EmojiBar({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);

  const EMOJIS = [
  { id: "happy", Icon: Happy },
  { id: "angry", Icon: Angry },
  { id: "sleepy", Icon: Sleepy },
  { id: "heart", Icon: Heart },
  { id: "wow", Icon: Wow },
  { id: "kiss", Icon: Kiss },
];

  return (
    <View style={stylesEmoji.wrapper}>
      {/* trigger */}
        <TouchableOpacity
        onPress={() => setOpen((p) => !p)}
        style={[stylesEmoji.trigger, open && stylesEmoji.triggerActive]}
        >
            <Plain width={60} height={60} />   {/* ← no <Text> wrapper */}
        </TouchableOpacity>

      {/* expanded bar */}
      {/* expanded bar */}
      {open && (
        <View style={stylesEmoji.container}>
          {EMOJIS.map(({ id, Icon }) => (
            <TouchableOpacity
              key={id}
              onPress={() => {
                onSelect(id);
                setOpen(false);
              }}
              style={stylesEmoji.emojiBtn}
            >
              <Icon />
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
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },

  triggerActive: {
    backgroundColor: AppColors.lilac,
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