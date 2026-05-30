import { AppColors, AppFonts } from "@/constants/theme";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActiveWindow } from "../hooks/useAvatar";
const { width: screenWidth } = Dimensions.get('window'); 

//hair imports
import Hair1 from "@/assets/svgs/avatar/hairs/Hair 1.svg";
import Hair2 from "@/assets/svgs/avatar/hairs/Hair 2.svg";
import Hair3 from "@/assets/svgs/avatar/hairs/Hair 3.svg";
import Hair4 from "@/assets/svgs/avatar/hairs/Hair 4.svg";
import Hair5 from "@/assets/svgs/avatar/hairs/Hair 5.svg";
import Hair6 from "@/assets/svgs/avatar/hairs/Hair 6.svg";
import Hair7 from "@/assets/svgs/avatar/hairs/Hair 7.svg";
import Hair8 from "@/assets/svgs/avatar/hairs/Hair 8.svg";
import Hair9 from "@/assets/svgs/avatar/hairs/Hair 9.svg";

//skin imports
import Skin1 from "@/assets/svgs/avatar/skintones/Skin tone.svg";
import Skin2 from "@/assets/svgs/avatar/skintones/Skin tone2.svg";
import Skin3 from "@/assets/svgs/avatar/skintones/Skin tone3.svg";
import Skin4 from "@/assets/svgs/avatar/skintones/Skin tone4.svg";
import Skin5 from "@/assets/svgs/avatar/skintones/Skin tone5.svg";
import Skin6 from "@/assets/svgs/avatar/skintones/Skin tone6.svg";
import Skin7 from "@/assets/svgs/avatar/skintones/Skin tone7.svg";
import Skin8 from "@/assets/svgs/avatar/skintones/Skin tone8.svg";
import Skin9 from "@/assets/svgs/avatar/skintones/Skin tone9.svg";

// export const HAIR_DEFS = [
//     { id: 'hair1', component: Hair1}, 
//     { id: 'hair2', component: Hair2}, 
//     { id: 'hair3', component: Hair3}, 
//     { id: 'hair4', component: Hair4}, 
//     { id: 'hair5', component: Hair5}, 
//     { id: 'hair6', component: Hair6}, 
//     { id: 'hair7', component: Hair7}, 
//     { id: 'hair8', component: Hair8}, 
//     { id: 'hair9', component: Hair9}, 
// ]

// export const SKIN_DEFS = [
//     { id: 'skin1', component: Skin1}, 
//     { id: 'skin2', component: Skin2}, 
//     { id: 'skin3', component: Skin3}, 
//     { id: 'skin4', component: Skin4}, 
//     { id: 'skin5', component: Skin5}, 
//     { id: 'skin6', component: Skin6}, 
//     { id: 'skin7', component: Skin7}, 
//     { id: 'skin8', component: Skin8}, 
//     { id: 'skin9', component: Skin9}, 

// ]

// Natural size of the Bald base
const BASE_W = 317;
const BASE_H = 440;

// How big to render the base on screen
const AVATAR_SCALE = 1.2; // tweak this one number to resize everything
const RENDERED_W = BASE_W * AVATAR_SCALE;
const RENDERED_H = BASE_H * AVATAR_SCALE;

// Where each layer sits on the Bald canvas (in Bald's coordinate space)
// and its natural SVG size — derive scale from ratio
const LAYER_CONFIG = {
  skin: {
    top:  (87  / BASE_H) * RENDERED_H,
    left: (89  / BASE_W) * RENDERED_W,
    width:  (158 / BASE_W) * RENDERED_W,
    height: (141 / BASE_H) * RENDERED_H,
  },
  hair: {
    top:  (20  / BASE_H) * RENDERED_H,
    left: (30  / BASE_W) * RENDERED_W,
    width:  (158 / BASE_W) * RENDERED_W,
    height: (148 / BASE_H) * RENDERED_H,
    svgW: 320,   // ← override SVG render size independently
    svgH: 320,   // ← without touching position
  },
} as const;

type LayerKey = keyof typeof LAYER_CONFIG;

export { RENDERED_H, RENDERED_W };

// AvatarWindows.tsx

// Keep imports as-is, but create a lookup map instead of storing components in arrays
const HAIR_MAP: Record<string, React.ComponentType<any>> = {
  hair1: Hair1, hair2: Hair2, hair3: Hair3,
  hair4: Hair4, hair5: Hair5, hair6: Hair6,
  hair7: Hair7, hair8: Hair8, hair9: Hair9,
};

const SKIN_MAP: Record<string, React.ComponentType<any>> = {
  skin1: Skin1, skin2: Skin2, skin3: Skin3,
  skin4: Skin4, skin5: Skin5, skin6: Skin6,
  skin7: Skin7, skin8: Skin8, skin9: Skin9,
};

// Keep HAIR_DEFS and SKIN_DEFS for the Window grid but just as id lists
export const HAIR_DEFS = Object.keys(HAIR_MAP).map(id => ({ id, component: HAIR_MAP[id] }));
export const SKIN_DEFS = Object.keys(SKIN_MAP).map(id => ({ id, component: SKIN_MAP[id] }));

export function AvatarLayer({
  selectedId,
  layerKey,
}: {
  selectedId: string | null;
  layerKey: LayerKey;
}) {
  // Look up component fresh at render time
  const map = layerKey === 'hair' ? HAIR_MAP : SKIN_MAP;
  const Component = selectedId ? map[selectedId] : null;
  const config = LAYER_CONFIG[layerKey];

  if (!Component) return null;

  const { top, left, width, height } = config;
  const svgW = 'svgW' in config ? config.svgW : width;
  const svgH = 'svgH' in config ? config.svgH : height;

  return (
    <Component
      key={selectedId}
      width={svgW}
      height={svgH}
      style={{ position: 'absolute', top, left }}
    />
  );
}

const LOCKED_HAIRS = ['hair9']; // add future locked ones here

interface WindowProps {
    onClose?: () => void; 
    activeWindow: ActiveWindow; 
    onSelect: (id: string) => void; 
    unlockedItems?: { type: string; itemId: string }[];  // ← add
}

export function Window ({ onClose, activeWindow, onSelect, unlockedItems = []}: WindowProps) {
    let name = "";
    let setObjects: string | any[] = []; 

    console.log("in window", activeWindow);

    switch (activeWindow) {
        case 'hair':
          name = "Hair";
          setObjects = HAIR_DEFS.filter(
            (h) => !LOCKED_HAIRS.includes(h.id) ||
                  unlockedItems.some((u) => u.itemId === h.id)
          );
          break;
        case 'skin':      name = "Skin Tone";  setObjects = SKIN_DEFS; break;
        case 'top':       name = "Top";        break;
        case 'bottom':    name = "Bottoms";    break;
        case 'feet':      name = "Shoes";      break;
        case 'accessory': name = "Accessory";  break;
        default:          break;
    }

    const rows = []; 
    for (let i = 0; i < setObjects.length; i += 3) {
        rows.push(setObjects.slice(i, i + 3));
    }

    return (
        <View style={styles.window}>
            <View style={styles.upperWindow}>
                <Text style={styles.windowText}>{name}</Text>
                <TouchableOpacity onPress={onClose} style={styles.close}>
                    <Text style={styles.windowX}>X</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.lowerWindow}>
                <View style={styles.grid}>
                    {rows.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {row.map((sticker) => {
                              const StickerComponent = sticker.component;
                              return (

                                <TouchableOpacity
                                  key={sticker.id}
                                  style={styles.cell}
                                  onPress={() => { console.log(sticker.id); onSelect(sticker.id) }}
                                >
                                  <StickerComponent width={screenWidth * 0.06} height={screenWidth * 0.06} />
                                </TouchableOpacity>
                              );
                            })}
                        </View>
                    ))}
                </View>
            </View>
        </View>
        
    );


}

const styles = StyleSheet.create({
  window: {
    flexDirection: "column",
    borderWidth: 5,
    borderColor: AppColors.blue,
    borderRadius: 24,
    backgroundColor: AppColors.lilac,
    overflow: 'hidden',
   // width: screenWidth * 0.25,
  },
  upperWindow: {
    flexDirection: "row",
    backgroundColor: AppColors.blue,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowText: {
    ...AppFonts.body,
    color: AppColors.lilac,
    fontSize: screenWidth * 0.025,
    letterSpacing: 0.5,
    paddingLeft:10
  },
  windowX: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.025,
    color: AppColors.blue,

  },
  close: {
    width: screenWidth * 0.035,
    height: screenWidth * 0.023,
    backgroundColor: AppColors.lilac,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowCircle: {},
  lowerWindow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    //paddingVertical: screenWidth * 0.02,
   // paddingHorizontal: screenWidth * 0.005,
    backgroundColor: AppColors.lilac,
  },
  grid: {
    padding: screenWidth * 0.005,
    gap: screenWidth * 0.01,
  },
  row: {
    flexDirection: 'row',
    gap: screenWidth * 0.01,
    marginBottom: screenWidth * 0.005,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.lilac,

    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,

  },
  cellSelected: {
    backgroundColor: AppColors.blue,
  },

});