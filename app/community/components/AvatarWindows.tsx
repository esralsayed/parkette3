import { AppColors, AppFonts } from "@/constants/theme";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActiveWindow } from "../hooks/useAvatar";
const { width: screenWidth } = Dimensions.get('window'); 

//hair imports
import Hair1 from "@/assets/svgs/avatar/hairs/Hair 1.svg";
import Hair2 from "@/assets/svgs/avatar/hairs/Hair 2.svg";
import Hair8 from "@/assets/svgs/avatar/hairs/Hair 8.svg";
import Hair9 from "@/assets/svgs/avatar/hairs/Hair 9.svg";

import Boyhair1 from "@/assets/svgs/avatar/hairs/boyhair1.svg";
import Boyhair2 from "@/assets/svgs/avatar/hairs/boyhair2.svg";
import Boyhair3 from "@/assets/svgs/avatar/hairs/boyhair3.svg";
import Boyhair4 from "@/assets/svgs/avatar/hairs/boyhair4.svg";

//skin imports
import Skin1 from "@/assets/svgs/avatar/skintones/Skin tone.svg";
import Skin5 from "@/assets/svgs/avatar/skintones/Skin tone5.svg";
import Skin6 from "@/assets/svgs/avatar/skintones/Skin tone6.svg";
import Skin7 from "@/assets/svgs/avatar/skintones/Skin tone7.svg";

// Girl bald imports
import Bald_girl_skin2 from '@/assets/svgs/avatar/skintones/2.png';
import Bald_girl_skin3 from '@/assets/svgs/avatar/skintones/3.png';
import Bald_girl_skin4 from '@/assets/svgs/avatar/skintones/4.png';
import Bald_girl_skin1 from '@/assets/svgs/diary/bald2.png';

// Boy bald imports
import Bald_boy_skin4 from '@/assets/svgs/avatar/skintones/22.png';
import Bald_boy_skin3 from '@/assets/svgs/avatar/skintones/23.png';
import Bald_boy_skin2 from '@/assets/svgs/avatar/skintones/24.png';
import Bald_boy_skin1 from '@/assets/svgs/diary/bald3.png';

export const BALD_MAP: Record<'girl' | 'boy', Record<string, any>> = {
  girl: {
    skin1: Bald_girl_skin1,
    skin2: Bald_girl_skin2,
    skin3: Bald_girl_skin3,
    skin4: Bald_girl_skin4,
  },
  boy: {
    skin1: Bald_boy_skin1,
    skin2: Bald_boy_skin2,
    skin3: Bald_boy_skin3,
    skin4: Bald_boy_skin4,
  },
};

// How big to render the base on screen
const BASE_W = 317;
const BASE_H = 440;

// How big to render the base on screen
const AVATAR_SCALE = 1; // tweak this one number to resize everything
export const RENDERED_W = BASE_W * AVATAR_SCALE;
export const RENDERED_H = BASE_H * AVATAR_SCALE;

// Keep imports as-is, but create a lookup map instead of storing components in arrays
const HAIR_MAP: Record<string, React.ComponentType<any>> = {
  hair1: Hair1, hair2: Hair2, hair3: Hair8,
  hair9: Hair9,
};

const BOY_HAIR_MAP: Record<string, React.ComponentType<any>> = {
  hair1: Boyhair1, hair2: Boyhair2, hair3: Boyhair3,
  hair4: Boyhair4,
};

const SKIN_MAP: Record<string, React.ComponentType<any>> = {
  skin1: Skin1, skin2: Skin5, skin3: Skin6,
  skin4: Skin7,
};

// Keep HAIR_DEFS and SKIN_DEFS for the Window grid but just as id lists
export const HAIR_DEFS = Object.keys(HAIR_MAP).map(id => ({ id, component: HAIR_MAP[id] }));
export const HAIR_DEFS2 = Object.keys(BOY_HAIR_MAP).map(id => ({ id, component: BOY_HAIR_MAP[id] }));
export const SKIN_DEFS = Object.keys(SKIN_MAP).map(id => ({ id, component: SKIN_MAP[id] }));

// export function AvatarLayer({
//   selectedId,
//   layerKey,
//   gender
// }: {
//   selectedId: string | null;
//   layerKey: LayerKey;
//   gender? : 'girl' | 'boy'
// }) {
//   // Look up component fresh at render time
//   const map = layerKey === 'hair'
//     ? gender === 'girl' ? HAIR_MAP : BOY_HAIR_MAP  // pick the right map
//     : SKIN_MAP;
//   const Component = selectedId ? map[selectedId] : null;
//   const config = LAYER_CONFIG[layerKey];

//   if (!Component) return null;

//   const { top, left, width, height } = config;
//   const svgW = 'svgW' in config ? config.svgW : width;
//   const svgH = 'svgH' in config ? config.svgH : height;

//   return (
//     <Component
//       key={selectedId}
//       width={svgW}
//       height={svgH}
//       style={{ position: 'absolute', top, left }}
//     />
//   );
// }

const LOCKED_HAIRS = ['hair9']; // add future locked ones here

interface WindowProps {
    onClose?: () => void; 
    activeWindow: ActiveWindow; 
    onSelect: (id: string) => void; 
    unlockedItems?: { type: string; itemId: string }[];  // ← add
    gender? : 'girl' | 'boy'
}

export function Window ({ onClose, activeWindow, onSelect, gender, unlockedItems = []}: WindowProps) {
    let name = "";
    let setObjects: string | any[] = []; 

    console.log("in window", activeWindow);

    switch (activeWindow) {
      case 'hair':
        name = "Hair";
        const defs = gender === 'boy' ? HAIR_DEFS2 : HAIR_DEFS;
        setObjects = defs.filter(
          (h) => !LOCKED_HAIRS.includes(h.id) ||
          unlockedItems.some((u) => u.itemId === h.id)
        );
        break;
        case 'skin':      name = "Skin Tone";  setObjects = SKIN_DEFS; break;
        default:          break;
    }

    const rows = []; 
    for (let i = 0; i < setObjects.length; i += 4) {
        rows.push(setObjects.slice(i, i + 4));
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