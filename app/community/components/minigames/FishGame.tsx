import Fish5 from "@/assets/svgs/community/animals/angel.svg";
import Fish1 from "@/assets/svgs/community/animals/goldfish.svg";
import Fish4 from "@/assets/svgs/community/animals/koi.svg";
import Fish3 from "@/assets/svgs/community/animals/seahorse.svg";
import Fish2 from "@/assets/svgs/community/animals/shark.svg";
import Boat1 from "@/assets/svgs/community/boat1.svg";
import Senara from "@/assets/svgs/community/senara.svg";
import { AppColors, AppFonts } from "@/constants/theme";
import { SvgProps } from 'react-native-svg';

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Vibration,
    View,
} from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const POND_HEIGHT = SH * 0.52;
const POND_WIDTH  = SW;

type Difficulty = "easy" | "normal" | "hard";

const DIFFS: Record<Difficulty, { spawnMs: number; lives: number; gameSec: number; speedMult: number }> = {
  easy:   { spawnMs: 1600, lives: 5, gameSec: 40, speedMult: 0.7 },
  normal: { spawnMs: 1100, lives: 3, gameSec: 30, speedMult: 1.0 },
  hard:   { spawnMs: 700,  lives: 2, gameSec: 22, speedMult: 1.5 },
};

interface FishType {
  component: React.FC<SvgProps>;
  pts: number;
  speedBase: number; // fraction of pond width per second
  size: number;
  isEvil?: boolean;
}

const FISH_TYPES: FishType[] = [
  { component: Fish1, pts: 1,  speedBase: 0.18, size: 40 },
  { component: Fish3, pts: 2,  speedBase: 0.24, size: 36 },
  { component: Fish4, pts: 3,  speedBase: 0.12, size: 42 },
  { component: Fish2, pts: -1, speedBase: 0.28, size: 46, isEvil: true },
  { component: Fish5, pts: 5,  speedBase: 0.09, size: 38 },
];

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface FishEntity {
  id: string;
  type: FishType;
  x: Animated.Value;
  y: number;
  goRight: boolean;
  caught: boolean;
  speed: number; // px/sec
}

interface Splash {
  id: string;
  emoji: string;
  x: number;
  y: number;
  opacity: Animated.Value;
  scale: Animated.Value;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

// ─────────────────────────────────────────────
// SPLASH COMPONENT
// ─────────────────────────────────────────────

const SplashFX: React.FC<{ splash: Splash }> = ({ splash }) => (
  <Animated.Text
    style={{
      position: "absolute",
      left: splash.x,
      top: splash.y,
      fontSize: 28,
      opacity: splash.opacity,
      transform: [{ scale: splash.scale }],
      zIndex: 20,
      pointerEvents: "none",
    }}
  >
    {splash.emoji}
  </Animated.Text>
);

// ─────────────────────────────────────────────
// FISH COMPONENT
// ─────────────────────────────────────────────

interface FishCardProps {
  fish: FishEntity;
  onCatch: (fish: FishEntity) => void;
  gameRunning: boolean;
}

const FishCard: React.FC<FishCardProps> = ({ fish, onCatch, gameRunning }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!gameRunning) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0,   duration: 100, useNativeDriver: true }),
    ]).start();
    onCatch(fish);
  };
const FishSvg = fish.type.component; 
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: fish.y,
        transform: [
          { translateX: fish.x },
          { scaleX: fish.goRight ? 1 : -1 },
          { scale },
        ],
        zIndex: 10,
      }}
    >
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={{ padding: 6 }}>
          <View
            style={{
                width: fish.type.size,
                height: fish.type.size,
                justifyContent: "center",
                alignItems: "center",
            }}
            >
            <FishSvg />
            </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// TIMER BAR
// ─────────────────────────────────────────────

const TimerBar: React.FC<{ timeLeft: number; total: number }> = ({ timeLeft, total }) => {
  const pct = timeLeft / total;
  const color = pct < 0.25 ? "#ef4444" : pct < 0.5 ? "#f59e0b" : AppColors.lilac;
  return (
    <View style={{ height: 8, width: "100%", backgroundColor: "#2a3fa0" }}>
      <Animated.View
        style={{
          height: 8,
          width: `${Math.max(0, pct * 100)}%`,
          backgroundColor: color,
          borderRadius: 4,
        }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// DIFFICULTY PICKER SCREEN
// ─────────────────────────────────────────────

interface DiffPickerProps {
  title: string;
  subtitle: string;
  topEmoji: string;
  onPick: (d: Difficulty) => void;
}

const DiffPicker: React.FC<DiffPickerProps> = ({ title, subtitle, topEmoji, onPick }) => (
  <View
    style={{
      position: "absolute",
      inset: 0, top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: AppColors.lilac,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      zIndex: 30,
    }}
  >
    <Text style={{ fontSize: 58 }}>{topEmoji}</Text>
    <Text style={{ color: AppColors.lilac, fontSize: 42, fontWeight: "800", ...AppFonts.title }}>
      {title}
    </Text>
    <Text style={{ color: AppColors.blue, fontSize: 28, ...AppFonts.body }}>
      {subtitle}
    </Text>
    <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
      {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
        <TouchableOpacity
          key={d}
          onPress={() => onPick(d)}
          style={{
            borderWidth: 2.5,
            borderColor: AppColors.lilac,
            borderRadius: 12,
            paddingHorizontal: 18,
            paddingVertical: 10,
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: AppColors.lilac, fontWeight: "800", fontSize: 14, ...AppFonts.body }}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─────────────────────────────────────────────
// MAIN GAME
// ─────────────────────────────────────────────

interface CatchFishGameProps {
  visible: boolean;
  onClose: () => void;
}

type GamePhase = "menu" | "playing" | "over";

export default function CatchFishGame({ visible, onClose }: CatchFishGameProps) {
  const [phase, setPhase]         = useState<GamePhase>("menu");
  const [diff, setDiff]           = useState<Difficulty>("normal");
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(3);
  const [timeLeft, setTimeLeft]   = useState(30);
  const [fishes, setFishes]       = useState<FishEntity[]>([]);
  const [splashes, setSplashes]   = useState<Splash[]>([]);

  const livesRef    = useRef(3);
  const phaseRef    = useRef<GamePhase>("menu");
  const spawnRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef      = useRef<number | null>(null);
  const lastTsRef   = useRef<number | null>(null);
  const fishesRef   = useRef<FishEntity[]>([]);

  // keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { fishesRef.current = fishes; }, [fishes]);

  // ── CLEANUP on unmount / modal close
  const stopAll = useCallback(() => {
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current)   cancelAnimationFrame(rafRef.current);
    spawnRef.current = null;
    timerRef.current = null;
    rafRef.current   = null;
    lastTsRef.current = null;
  }, []);

  useEffect(() => {
    if (!visible) stopAll();
    return () => stopAll();
  }, [visible]);

  // ── SPAWN a fish
  const spawnFish = useCallback((currentDiff: Difficulty) => {
    const cfg = DIFFS[currentDiff];
    const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    const goRight = Math.random() > 0.5;
    const startX = goRight ? -60 : POND_WIDTH + 10;
    const topMin = 30, topMax = POND_HEIGHT - 80;
    const y = topMin + Math.random() * (topMax - topMin);
    const speed = type.speedBase * POND_WIDTH * cfg.speedMult * (0.8 + Math.random() * 0.4);

    const fish: FishEntity = {
      id: uid(),
      type,
      x: new Animated.Value(startX),
      y,
      goRight,
      caught: false,
      speed: goRight ? speed : -speed,
    };

    setFishes((prev) => [...prev, fish]);
  }, []);

  // ── ANIMATION LOOP — moves fish positions
  const loop = useCallback((ts: number) => {
    if (phaseRef.current !== "playing") return;
    if (!lastTsRef.current) lastTsRef.current = ts;
    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.1);
    lastTsRef.current = ts;

    const toRemove: string[] = [];

    fishesRef.current.forEach((f) => {
      if (f.caught) return;
      // @ts-ignore — _value is internal but reliable
      const cur: number = f.x._value;
      const next = cur + f.speed * dt;
      f.x.setValue(next);

      const escaped = f.goRight ? next > POND_WIDTH + 80 : next < -100;
      if (escaped) {
        toRemove.push(f.id);
        if (!f.type.isEvil) {
          // lost a life — fish escaped
          const newLives = Math.max(0, livesRef.current - 1);
          livesRef.current = newLives;
          setLives(newLives);
          if (newLives <= 0) {
            endGame();
            return;
          }
        }
      }
    });

    if (toRemove.length) {
      setFishes((prev) => prev.filter((f) => !toRemove.includes(f.id)));
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // ── END GAME
  const endGame = useCallback(() => {
    stopAll();
    setPhase("over");
    setFishes([]);
  }, [stopAll]);

  // ── START GAME
  const startGame = useCallback((d: Difficulty) => {
    stopAll();
    const cfg = DIFFS[d];
    setDiff(d);
    setScore(0);
    setLives(cfg.lives);
    setTimeLeft(cfg.gameSec);
    setFishes([]);
    setSplashes([]);
    livesRef.current = cfg.lives;
    lastTsRef.current = null;
    setPhase("playing");

    spawnRef.current = setInterval(() => spawnFish(d), cfg.spawnMs);
    spawnFish(d);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) endGame();
        return Math.max(0, next);
      });
    }, 1000);

    rafRef.current = requestAnimationFrame(loop);
  }, [stopAll, spawnFish, endGame, loop]);

  // ── CATCH a fish
  const handleCatch = useCallback((fish: FishEntity) => {
    if (fish.caught) return;
    fish.caught = true;

    const pts = fish.type.pts;
    const splashEmoji = pts > 0 ? (pts >= 5 ? "✨" : "💦") : "😤";

    // splash FX
    const splash: Splash = {
      id: uid(),
      emoji: splashEmoji,
      // @ts-ignore
      x: fish.x._value,
      y: fish.y - 16,
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0.5),
    };
    setSplashes((prev) => [...prev, splash]);
    Animated.parallel([
      Animated.timing(splash.opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(splash.scale,   { toValue: 1.4, useNativeDriver: true }),
    ]).start(() => setSplashes((prev) => prev.filter((s) => s.id !== splash.id)));

    setFishes((prev) => prev.filter((f) => f.id !== fish.id));

    if (pts < 0) {
      Vibration.vibrate(80);
      const newLives = Math.max(0, livesRef.current - 1);
      livesRef.current = newLives;
      setLives(newLives);
      if (newLives <= 0) endGame();
    } else {
      setScore((prev) => prev + pts);
    }
  }, [endGame]);

  // ── HEARTS display
  const heartsDisplay = () => {
    const total = DIFFS[diff].lives;
    return "❤️".repeat(Math.max(0, lives)) + "🖤".repeat(Math.max(0, total - lives));
  };

  // ── SCORE label for end screen
  const endGrade = () => {
    if (score >= 20) return "🏆 Amazing!";
    if (score >= 10) return "⭐ Great job!";
    return "🐟 Keep fishing!";
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
        <View
          style={{
            height: SH * 0.9,
            backgroundColor: AppColors.blue,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: "hidden",
          }}
        >
          {/* ── HEADER ── */}
          <View
            style={{
              backgroundColor: AppColors.blue,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 18,
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: AppColors.lilac, fontSize: 42, ...AppFonts.title }}>
              Catch the Fish!
            </Text>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <View style={{ backgroundColor: AppColors.lilac, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 3, borderWidth: 2.5, borderColor: "#2a3fa0" }}>
                <Text style={{ ...AppFonts.body,color: AppColors.blue, fontSize: 28 }}>
                  Score: {score}
                </Text>
              </View>
              <View style={{ backgroundColor: AppColors.lilac, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 3, borderWidth: 2.5, borderColor: "#2a3fa0" }}>
                <Text style={{ fontSize: 24 }}>{heartsDisplay()}</Text>
              </View>
              <TouchableOpacity onPress={() => { stopAll(); setPhase("menu"); onClose(); }}>
                <Text style={{ ...AppFonts.body,color: AppColors.lilac, fontSize: 22, fontWeight: "800" }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── TIMER BAR ── */}
          <TimerBar timeLeft={timeLeft} total={DIFFS[diff].gameSec} />

          {/* ── POND ── */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#bddcff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Water top stripe */}
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 18, backgroundColor: AppColors.blue, zIndex: 2 }} />

            {/* Decorative scene SVGs from Page3 */}
            <View pointerEvents="none" style={{ position: "absolute", bottom: 30, left: -20, zIndex: 1 }}>
              <Boat1 width={220} height={220} />
            </View>
            <View pointerEvents="none" style={{ position: "absolute", bottom: 10, right: 10, zIndex: 1 }}>
              <Senara width={100} height={100} />
            </View>

            {/* Seaweed decorations */}
            {["8%", "28%", "52%", "74%"].map((left, i) => (
              <Text key={i} style={{ position: "absolute", bottom: 28, left: left as any, fontSize: 20, opacity: 0.6, zIndex: 3 }}>
                {i % 2 === 0 ? "🌿" : "🪸"}
              </Text>
            ))}

            {/* Water floor */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 28, backgroundColor: "#2a3fa0", zIndex: 2 }} />

            {/* Fish */}
            {fishes.map((fish) => (
              <FishCard
                key={fish.id}
                fish={fish}
                onCatch={handleCatch}
                gameRunning={phase === "playing"}
              />
            ))}

            {/* Splash FX */}
            {splashes.map((s) => (
              <SplashFX key={s.id} splash={s} />
            ))}

            {/* MENU OVERLAY */}
            {phase === "menu" && (
              <DiffPicker
                topEmoji="🐟"
                title="Catch the Fish!"
                subtitle="Tap fish before they swim away — avoid the shark!"
                onPick={startGame}
              />
            )}

            {/* GAME OVER OVERLAY */}
            {phase === "over" && (
              <DiffPicker
                topEmoji="🏆"
                title={endGrade()}
                subtitle={`Final score: ${score} pts — play again?`}
                onPick={startGame}
              />
            )}
          </View>

          {/* ── BOTTOM BAR ── */}
          <View style={{ backgroundColor: AppColors.blue, padding: 12, flexDirection: "row", justifyContent: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => { stopAll(); setFishes([]); setPhase("menu"); }}
              style={{
                backgroundColor: AppColors.lilac,
                borderRadius: 12,
                paddingHorizontal: 28,
                paddingVertical: 10,
                shadowColor: "#2a3fa0",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 4,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: AppColors.blue, fontSize: 32, ...AppFonts.body }}>
                Restart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { stopAll(); setPhase("menu"); onClose(); }}
              style={{
                backgroundColor: "transparent",
                borderRadius: 12,
                paddingHorizontal: 28,
                paddingVertical: 10,
                borderWidth: 2.5,
                borderColor: AppColors.lilac,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: AppColors.lilac, fontSize: 32, ...AppFonts.body }}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}