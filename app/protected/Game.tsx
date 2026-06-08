import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  AppColors,
  AppFonts,
  ButtonStyles,
  Spacing
} from "../../constants/theme";
import NavBar from "../components/navbar";

// ─── PIXEL CLOUD DECORATION ──────────────────────────────
const PixelCloud = ({ style }: { style?: object }) => (
  <View style={[pixelStyles.cloud, style]}>
    <View style={pixelStyles.cloudTop} />
    <View style={pixelStyles.cloudBottom} />
  </View>
);

// ─── SECTION 1: HERO ─────────────────────────────────────
const HeroSection = ({
  userName,
  onOpenCalendar,
}: {
  userName: string;
  onOpenCalendar: () => void;
}) => {
  return (
    <View style={styles.heroWrapper}>
      {/* Outer card — dark blue thick border */}
      <View style={styles.outerCard}>
        {/* Inner scene card — sky background */}
        <View style={styles.sceneCard}>
          {/* Sky background layer */}
          <View style={styles.skyBackground}>
            {/* Clouds */}
            <PixelCloud style={{ top: 10, left: 30 }} />
            <PixelCloud style={{ top: 20, left: 120, transform: [{ scaleX: 1.3 }] }} />
            <PixelCloud style={{ top: 8, right: 60 }} />

            {/* Dark pixel trees / terrain on the right */}
            <View style={styles.terrainRight} />
          </View>

          {/* Ground strip */}
          <View style={styles.ground} />

          {/* Character sprite placeholder — replace with your actual sprite */}
          <View style={styles.characterBox}>
            {/* Pixel-art style character block
            <View style={styles.characterSprite}>
              <View style={styles.spriteHead} />
              <View style={styles.spriteBody} />
            </View>
            {/* Size label like Figma shows */}
           {/* <View style={styles.sizeLabel}>
              <Text style={styles.sizeLabelText}>146 × 224</Text>
            </View> */}
            <Image
              source={require("../../assets/images/maingirl.png")}
              style={styles.characterSprite}
            />
          </View>

          {/* Center content */}
          <View style={styles.centerContent}>
            <Text style={styles.mainTitle}>Let's Play!</Text>
          </View>

          {/* Right-side nav arrows */}
          <View style={styles.arrowNav}>
            <View style={{flexDirection: "column", gap: 2, alignItems: "center"}}>
              <View>
            <TouchableOpacity style={styles.arrowBtn}>
              <Text style={styles.arrowText}>▲</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.arrowRow}>
               <TouchableOpacity style={styles.arrowBtn}>
                <Text style={styles.arrowText}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowBtn}>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
             
              <TouchableOpacity style={styles.arrowBtn}>
                <Text style={styles.arrowText}>▶</Text>
              </TouchableOpacity>
              </View>
            </View>
          
          </View>
        </View>

        {/* Bottom action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionBtn}
          onPress={() => router.push("/community/components/avatar")}>
              <Text style={styles.actionBtnText}>Customize</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}
          onPress={() => router.push("/protected/chapters")}>
            <Text style={styles.actionBtnText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/protected/chapters")}
            style={[styles.actionBtn, styles.chapterBtn]}
          >
            <Text style={styles.actionBtnText}>Chapter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function gamedashboard() {
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.name || "User");
          setUserId(user.id || null);
        }
      } catch (error) {
        console.error("Error loading user name:", error);
      }
    };
    loadUserName();
  }, []);

  return (
    <View style={styles.root}>
      <NavBar/>
      <HeroSection userName={userName} onOpenCalendar={() => {}} />
    </View>
  );
}

// ─── PIXEL CLOUD STYLES ───────────────────────────────────
const pixelStyles = StyleSheet.create({
  cloud: {
    position: "absolute",
    alignItems: "center",
  },
  cloudTop: {
    width: 24,
    height: 12,
    backgroundColor: "#ffffff",
    marginBottom: -2,
  },
  cloudBottom: {
    width: 40,
    height: 12,
    backgroundColor: "#ffffff",
  },
});

// ─── MAIN STYLES ──────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.lilacLight,
  },

  heroWrapper: {

    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
  },

  // Outer card: thick dark blue border, rounded
  outerCard: {
    width: "100%",
    maxWidth: 1200,
    borderWidth: 6,
    borderColor: AppColors.blue,
    borderRadius: 12,
    backgroundColor: AppColors.lilac,
    overflow: "hidden",
    // Pixel shadow
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 8,
  },

  // Inner scene: the sky + ground area
  sceneCard: {
    width: "100%",
    height: 460,
    borderWidth: 4,
    borderColor: AppColors.blue,
    backgroundColor: AppColors.lilac, // mid-blue sky
    overflow: "hidden",
    position: "relative",
  },

  skyBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.lilacLight, // light sky blue
  },

  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: AppColors.blue, // dark navy ground
  },

  // Character box — bottom-left
  characterBox: {
    position: "absolute",
    bottom: 10,
    left: 16,
    alignItems: "center",
  },
  characterSprite: {
    borderWidth: 2,
    alignItems: "center",
    overflow: "hidden",
  },


  // Center "Let's Play!" text
  centerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  mainTitle: {
    fontSize: 42,
    color: AppColors.blue,
    fontFamily: AppFonts.title?.fontFamily,
    textShadowColor: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  // D-pad arrows — bottom-right
  arrowNav: {
    position: "absolute",
    bottom: 12,
    right: 20,
    alignItems: "center",
    gap: 2,
  },
  arrowRow: {
    flexDirection: "row",
    gap: 2,
  },
  arrowBtn: {
    width: 42,
    height: 26,
    paddingHorizontal: 30,
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 16,
    color: AppColors.blue,
  },

  // Terrain blocks on the right
  terrainRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: AppColors.blue,
    opacity: 0.7,
  },

  // Bottom action bar
  actionBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 120,
    backgroundColor: AppColors.blue,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  actionBtn: {
    ...ButtonStyles.primary,
    backgroundColor: AppColors.lilacLight ?? "#E8D8FF",
    borderWidth: 3,
    borderColor: AppColors.lilac,
    borderRadius: 4,
    paddingHorizontal: 50,
    paddingVertical: Spacing.sm,
  },
    actionBtn2: {
    backgroundColor: AppColors.blue ?? "#E8D8FF",
    borderWidth: 3,
    borderColor: AppColors.lilac,
    borderRadius: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    // Pixel-style shadow
    shadowColor: AppColors.blue,
    shadowOffset: { width: 5, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  chapterBtn: {
    backgroundColor: AppColors.lilac ?? "#C8A8FF",
  },
  actionBtnText: {
    color: AppColors.blue,
    fontFamily: AppFonts.button?.fontFamily,
    fontSize: 30,
  },
});