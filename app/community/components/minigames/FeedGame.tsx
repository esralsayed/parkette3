import Dog from "@/assets/svgs/community/animals/dog.png";
import Hamster from "@/assets/svgs/community/animals/hamester.png";
import Rabbit from "@/assets/svgs/community/animals/rabbit.png";
import Apple from "@/assets/svgs/community/food/apple.svg";
import Bone from "@/assets/svgs/community/food/bone.svg";
import Carrot from "@/assets/svgs/community/food/carrot.svg";
import Grain from "@/assets/svgs/community/food/grains.svg";
import Lettuce from "@/assets/svgs/community/food/lettuce.svg";
import Meat from "@/assets/svgs/community/food/meat.svg";
import Nut from "@/assets/svgs/community/food/nut.svg";
import Sunflower from "@/assets/svgs/community/food/sunflower.svg";

import { AppColors, AppFonts, AppFontSizes } from "@/constants/theme";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  PanResponder,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from "react-native";
import { SvgProps } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type AnimalId = "dog" | "rabbit" | "hamster";

interface FoodItem {
  id: string;
  emoji: string;
  label: string;
  owner: AnimalId;
Svg?: React.FC<SvgProps>;

}

interface Animal {
  id: AnimalId;
  emoji: string;
  name: string;
  fact: string;
  ImageComponent: ImageSourcePropType
}

// ─────────────────────────────────────────────
// DATA — mirrors Page4 SVGs exactly
// ─────────────────────────────────────────────

const ANIMALS: Animal[] = [
  {
    id: "dog",
    emoji: "🐶",
    name: "Dog",
    fact: "Dogs love bones & meat!",
    ImageComponent: Dog,
  },
  {
    id: "rabbit",
    emoji: "🐰",
    name: "Rabbit",
    fact: "Rabbits love fresh veggies!",
    ImageComponent: Rabbit,
  },
  {
    id: "hamster",
    emoji: "🐹",
    name: "Hamster",
    fact: "Hamsters love seeds & grains!",
    ImageComponent: Hamster,
  },
];

const ALL_FOODS: FoodItem[] = [
  { id: "bone",    emoji: "🦴", label: "Bone",    owner: "dog", Svg: Bone },
  { id: "meat",    emoji: "🥩", label: "Meat",    owner: "dog" , Svg: Meat },
  { id: "carrot",  emoji: "🥕", label: "Carrot",  owner: "rabbit", Svg: Carrot },
  { id: "lettuce", emoji: "🥬", label: "Lettuce", owner: "rabbit" , Svg: Lettuce},
  { id: "apple",   emoji: "🍎", label: "Apple",   owner: "rabbit" , Svg: Apple },
  { id: "seed",    emoji: "🌻", label: "Seeds",   owner: "hamster" , Svg: Sunflower },
  { id: "grain",   emoji: "🌾", label: "Grain",   owner: "hamster", Svg: Grain },
  { id: "nut",     emoji: "🥜", label: "Nut",     owner: "hamster", Svg: Nut },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─────────────────────────────────────────────
// FOOD CARD — draggable item in the tray
// ─────────────────────────────────────────────

interface FoodCardProps {
  food: FoodItem;
  used: boolean;
  onDragStart: (food: FoodItem) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  used,
  onDragStart,
  onDragMove,
  onDragEnd,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(used ? 0.3 : 1)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: used ? 0.3 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [used]);

  const usedRef = useRef(used);
React.useEffect(() => { usedRef.current = used; }, [used]);

  const panResponder = useRef(
    PanResponder.create({
    onStartShouldSetPanResponder: () => !usedRef.current,
    onMoveShouldSetPanResponder: () => !usedRef.current,
      onPanResponderGrant: (e) => {
        onDragStart(food);
        Animated.spring(scale, {
          toValue: 1.15,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (e) => {
        onDragMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
      onPanResponderRelease: (e) => {
        onDragEnd(e.nativeEvent.pageX, e.nativeEvent.pageY);
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: (e) => {
        onDragEnd(e.nativeEvent.pageX, e.nativeEvent.pageY);
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      },
    })
  ).current;
  const Svg = food.Svg;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        transform: [{ scale }],
        opacity,
        width: 150,
        height: 120,
        borderRadius: 16,
        backgroundColor: AppColors.lilac,
        borderWidth: 3,
        borderColor: AppColors.blue,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        shadowColor: AppColors.blue,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
      }}
    >
        {Svg ? <Svg width={40} height={40} /> : <Text style={{ fontSize: 42 }}>{food.emoji}</Text>  }
      <Text
        style={{
          ...AppFonts.bodySmall,
          fontSize: 28,
          color: AppColors.blue,
          marginTop: 2,
        }}
      >
        {food.label}
      </Text>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// ANIMAL TARGET — drop zone card
// ─────────────────────────────────────────────

interface AnimalTargetProps {
  animal: Animal;
  isHighlighted: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  fedCount: number;
}

const AnimalTarget: React.FC<AnimalTargetProps> = ({
  animal,
  isHighlighted,
  isCorrect,
  isWrong,
  fedCount,
}) => {
  const shake = useRef(new Animated.Value(0)).current;
  const bgColor = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isWrong) {
      Vibration.vibrate(80);
      Animated.sequence([
        Animated.timing(shake, { toValue: 8,  duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6,  duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0,  duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [isWrong]);


  const borderColor = isHighlighted
    ? "#22c55e"
    : isWrong
    ? "#ef4444"
    : isCorrect
    ? "#22c55e"
    : AppColors.blue;

  const bg = isHighlighted
    ? "#dcfce7"
    : isWrong
    ? "#fee2e2"
    : isCorrect
    ? "#dcfce7"
    : "#fff";

  return (
    <View style={{ alignItems: "center", width: 100 }}>
      <Animated.View
        style={{
          transform: [{ translateX: shake }],
          width: 150,
          height: 150,
          borderRadius: 18,
          backgroundColor: bg,
          borderWidth: 4,
          borderColor,
          alignItems: "center",
          justifyContent: "flex-end",
          overflow: "hidden",
          shadowColor: AppColors.blue,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 5,
          paddingBottom: 4,
        }}
      >
        <Image
        source={animal.ImageComponent}
        style={{
            width: 100,
            height: 100,
            resizeMode: "contain",
        }}
        />        
        {fedCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              backgroundColor: "#22c55e",
              borderRadius: 50,
              width: 26,
              height: 26,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: "#fff",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>
              {fedCount}
            </Text>
          </View>
        )}
      </Animated.View>
      <Text
        style={{
          ...AppFonts.bodySmall,
          color: AppColors.blue,
          fontSize: AppFontSizes.body,
          marginTop: 6,
        }}
      >
        {animal.name}
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────
// FLOATING GHOST — follows finger during drag
// ─────────────────────────────────────────────

interface GhostProps {
  food: FoodItem | null;
  x: number;
  y: number;
}

const DragGhost: React.FC<GhostProps> = ({ food, x, y }) => {
  if (!food) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - 30,
        top: y - 50,
        zIndex: 999,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 44 }}>{food.emoji}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────
// FEEDBACK BANNER
// ─────────────────────────────────────────────

interface FeedbackBannerProps {
  message: string;
  ok: boolean;
  visible: boolean;
}

const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ message, ok, visible }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(1400),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, message]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 16,
        alignSelf: "center",
        opacity,
        backgroundColor: ok ? "#22c55e" : "#ef4444",
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 8,
        zIndex: 50,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
        {message}
      </Text>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// WIN SCREEN
// ─────────────────────────────────────────────

interface WinScreenProps {
  onReplay: () => void;
  onClose: () => void;
}

const WinScreen: React.FC<WinScreenProps> = ({ onReplay, onClose }) => (
  <View
    style={{
      position: "absolute",
      inset: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: AppColors.lilac,
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      zIndex: 100,
      borderRadius: 20,
    }}
  >
    <Text
      style={{
        ...AppFonts.body,
        fontSize: AppFontSizes.body,
        //fontWeight: "800",
        color: AppColors.blue,
      }}
    >
      You fed everyone!
    </Text>
    <Text style={{ color: "#7c3aed", fontSize: AppFontSizes.bodySmall, ...AppFonts.bodySmall}}>
      All animals are happy 🐾
    </Text>
    <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
      <TouchableOpacity
        onPress={onReplay}
        style={{
          backgroundColor: AppColors.blue,
          borderRadius: 14,
          paddingHorizontal: 28,
          paddingVertical: 12,
          shadowColor: "#2a3fa0",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 5,
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: AppColors.lilac, fontSize: 28, ...AppFonts.body }}>
          Play Again
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onClose}
        style={{
          backgroundColor: AppColors.lilac,
          borderRadius: 14,
          paddingHorizontal: 28,
          paddingVertical: 12,
          borderWidth: 3,
          borderColor: AppColors.blue,
          shadowColor: AppColors.blue,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 5,
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: AppColors.blue, fontSize: 28, ...AppFonts.body }}>
          Go Back
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// FEED GAME — main component
// ─────────────────────────────────────────────

interface FeedGameProps {
  visible: boolean;
  onClose: () => void;
}

export default function FeedGame({ visible, onClose }: FeedGameProps) {
  const [foods, setFoods] = useState<FoodItem[]>(shuffle(ALL_FOODS));
  const [usedFoods, setUsedFoods] = useState<Set<string>>(new Set());
  const [fedCounts, setFedCounts] = useState<Record<AnimalId, number>>({
    dog: 0,
    rabbit: 0,
    hamster: 0,
  });
  const [correct, setCorrect] = useState(0);

  // drag state
  const [dragging, setDragging] = useState<FoodItem | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [highlighted, setHighlighted] = useState<AnimalId | null>(null);

  // feedback
  const [feedback, setFeedback] = useState({ msg: "", ok: true, tick: 0 });
  const [wrongAnimal, setWrongAnimal] = useState<AnimalId | null>(null);

  const [won, setWon] = useState(false);

  // layout refs to detect drop zones
  const animalLayouts = useRef<Record<AnimalId, { x: number; y: number; w: number; h: number }>>({} as any);

  const animalRefs = useRef<Record<AnimalId, View | null>>({
  dog: null,
  rabbit: null,
  hamster: null,
});

  const containerRef = useRef<View>(null);
  const containerOrigin = useRef({ x: 0, y: 0 });

function getAnimalAtPoint(px: number, py: number): AnimalId | null {
  for (const animal of ANIMALS) {
    const layout = animalLayouts.current[animal.id];
    if (!layout) {
      console.log(animal.id, "has no layout!");
      continue;
    }

    console.log(
      `${animal.id} bounds: x[${layout.x} - ${layout.x + layout.w}] y[${layout.y} - ${layout.y + layout.h}]`,
      `| point: ${px}, ${py}`,
      `| xHit: ${px >= layout.x && px <= layout.x + layout.w}`,
      `| yHit: ${py >= layout.y && py <= layout.y + layout.h}`
    );

    if (
      px >= layout.x &&
      px <= layout.x + layout.w &&
      py >= layout.y &&
      py <= layout.y + layout.h
    ) {
      console.log("HIT:", animal.id);
      return animal.id;
    }
  }
  console.log("NO HIT");
  return null;
}

const draggingRef = useRef<FoodItem | null>(null);

function handleDragStart(food: FoodItem) {
  draggingRef.current = food;  // ← set ref
  setDragging(food);     
  animalLayouts.current = {} as any;
  
  ANIMALS.forEach((animal) => {
    animalRefs.current[animal.id]?.measureInWindow((x, y, w, h) => {
      animalLayouts.current[animal.id] = { 
        x: x , y: y, 
        w: w, h: h
      };
    });
  });
  setDragging(food);
}

function handleDragMove(px: number, py: number) {
  setDragPos({ x: px, y: py });
  setHighlighted(getAnimalAtPoint(px , py));
}

const correctRef = useRef(0);


  function handleDragEnd(px: number, py: number) {
  console.log("Drop at:", px, py);
  console.log("Layouts:", JSON.stringify(animalLayouts.current));
  const target = getAnimalAtPoint(px , py );
const currentDrag = draggingRef.current;  // ← read from ref, not state

    if (target && currentDrag) {
      if (currentDrag.owner === target) {
        // correct!
        const newUsed = new Set(usedFoods);
        newUsed.add(currentDrag.id);
        setUsedFoods(newUsed);
        setFedCounts((prev) => ({ ...prev, [target]: prev[target] + 1 }));
        correctRef.current += 1;
        setCorrect(correctRef.current); // still update UI
        const animal = ANIMALS.find((a) => a.id === target)!;
        setFeedback({ msg: `✓ ${currentDrag.label} for ${animal.name}! ${animal.fact}`, ok: true, tick: Date.now() });
        if (correctRef.current === ALL_FOODS.length) {
          setTimeout(() => setWon(true), 700);
        }
      } else {
        // wrong
        setWrongAnimal(target);
        setTimeout(() => setWrongAnimal(null), 500);
        const animal = ANIMALS.find((a) => a.id === target)!;
        setFeedback({ msg: `✗ ${currentDrag.label} is not for ${animal.name}!`, ok: false, tick: Date.now() });
      }
    }
  draggingRef.current = null;
    setDragging(null);
    setHighlighted(null);
  }

  function resetGame() {
    setFoods(shuffle(ALL_FOODS));
    setUsedFoods(new Set());
    setFedCounts({ dog: 0, rabbit: 0, hamster: 0 });
    correctRef.current = 0;
    setCorrect(0);
    setDragging(null);
    setHighlighted(null);
    setWon(false);
    setFeedback({ msg: "", ok: true, tick: 0 });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
          alignContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          ref={containerRef}
          onLayout={() => {
            containerRef.current?.measureInWindow((x, y) => {
            containerOrigin.current = { x, y };
            });
        }}
          style={{
            width: '100%',
            height: '80%',
            backgroundColor: AppColors.lilac,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: "hidden",
          }}
        >
          {/* ── Header ── */}
          <View
            style={{
              backgroundColor: AppColors.blue,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 14,
            }}
          >
            <Text style={{ ...AppFonts.title, color: AppColors.lilac, fontSize: 42, }}>
              Feed the Animals!
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  backgroundColor: AppColors.lilac,
                  borderRadius: 50,
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderWidth: 3,
                  borderColor: "#2a3fa0",
                }}
              >
                <Text style={{ ...AppFonts.bodySmall,color: AppColors.blue, fontSize: 24 }}>
                  {correct} / {ALL_FOODS.length}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: AppColors.lilac, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Instructions ── */}
          <Text
            style={{
              ...AppFonts.body,
              textAlign: "center",
              color: AppColors.blue,
              fontSize: 24,
              marginTop: 10,
              opacity: 0.7,
            }}
          >
            Drag the food to the right animal!
          </Text>

          {/* ── Animal Drop Zones ── */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              paddingHorizontal: 16,
              paddingTop: 18,
              paddingBottom: 10,
              zIndex: 5,
            }}
          >
            {ANIMALS.map((animal) => (
            <View
            key={animal.id}
            ref={(ref) => {
                animalRefs.current[animal.id] = ref;
            }}
            onLayout={() => {
                animalRefs.current[animal.id]?.measureInWindow((x, y, w, h) => {
                animalLayouts.current[animal.id] = { x, y, w, h };
                });
            }}
            style={{ width: 200, alignItems: 'center' }} // ← add width: 200

            >
                <AnimalTarget
                  animal={animal}
                  isHighlighted={highlighted === animal.id}
                  isCorrect={fedCounts[animal.id] > 0 && wrongAnimal !== animal.id}
                  isWrong={wrongAnimal === animal.id}
                  fedCount={fedCounts[animal.id]}
                />
              </View>
            ))}
          </View>

          {/* ── Divider ── */}
          <View
            style={{
              height: 3,
              marginHorizontal: 24,
              backgroundColor: AppColors.blue,
              borderRadius: 4,
              opacity: 0.18,
              marginBottom: 4,
            }}
          />

          {/* ── Food Tray ── */}
          <Text
            style={{
              ...AppFonts.body,
              textAlign: "center",
              color: AppColors.blue,
              fontSize: 24,
              marginBottom: 8,
            }}
          >
            ← Slide to see all food →
          </Text>

          <View
            style={{ 
            flexDirection: 'row',
            flexWrap: 'wrap', 
            gap: 16,
            paddingHorizontal: 20,
              paddingBottom: 24,
              alignItems: "center", justifyContent: 'center'}}
          >
            {foods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                used={usedFoods.has(food.id)}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              />
            ))}
          </View>

          {/* ── Feedback Banner ── */}
          <FeedbackBanner
            message={feedback.msg}
            ok={feedback.ok}
            visible={feedback.tick > 0}
            key={feedback.tick}
          />

          {/* ── Dragging Ghost ── */}
        <Modal visible={!!dragging} transparent animationType="none">
        <DragGhost food={dragging} x={dragPos.x} y={dragPos.y} />
        </Modal>

          {/* ── Win Screen ── */}
          {won && (
            <WinScreen onReplay={resetGame} onClose={onClose} />
          )}
        </View>
      </View>
    </Modal>
  );
}