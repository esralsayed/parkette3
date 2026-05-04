import { AppColors, AppFonts } from "@/constants/theme";
import { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActiveWindow } from "./useAvatar";
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

export const HAIR_DEFS = [
    { id: 'hair1', component: Hair1}, 
    { id: 'hair2', component: Hair2}, 
    { id: 'hair3', component: Hair3}, 
    { id: 'hair4', component: Hair4}, 
    { id: 'hair5', component: Hair5}, 
    { id: 'hair6', component: Hair6}, 
    { id: 'hair7', component: Hair7}, 
    { id: 'hair8', component: Hair8}, 
    { id: 'hair9', component: Hair9}, 
]

export const SKIN_DEFS = [
    { id: 'skin1', component: Skin1}, 
    { id: 'skin2', component: Skin2}, 
    { id: 'skin3', component: Skin3}, 
    { id: 'skin4', component: Skin4}, 
    { id: 'skin5', component: Skin5}, 
    { id: 'skin6', component: Skin6}, 
    { id: 'skin7', component: Skin7}, 
    { id: 'skin8', component: Skin8}, 
    { id: 'skin9', component: Skin9}, 

]

interface WindowProps {
    onClose?: () => void; 
    activeWindow: ActiveWindow; 
}

const saveSelected = () => {

}

export const SelectedHair = () => {

}

export const SelectedTop = () => {
    
}

export const SelectedBottoms = () => {
    
}

export const SelectedShoes = () => {
    
}

export const SelectedAccessory = () => {
    
}

//export let SelectedSkin = () => {};

export function Window ({ onClose, activeWindow}: WindowProps) {
    const [selectedId, setSelectedId] = useState(null); 
    const [name, setName] = useState(""); 
    let setObjects: string | any[] = []; 

    const SelectedSkin = () => {
    let component; 
    for (let i=0; i<SKIN_DEFS.length; i++){
        if (SKIN_DEFS[i].id === selectedId) {
            component = SKIN_DEFS[i].component; 
        }
    }
    return (
        {component}
    );

}

    console.log("in window", activeWindow);

    switch (activeWindow) {
        case 'hair' : {setName("Hair");
            setObjects = HAIR_DEFS; 
        } break;  
        case 'skin' : {setName("Skin Tone");
            setObjects = SKIN_DEFS;
         } break;  
        case 'top' : setName("Top"); break; 
        case 'bottom' : setName("Bottoms"); break; 
        case 'feet' : setName("Shoes"); break;
        case 'accessory' : setName("Accessory"); break; 
        default : break; 
    }

    const rows = []; 
    for (let i = 0; i < setObjects.length; i += 3) {
        rows.push(setObjects.slice(i, i + 3));
    }
    console.log("inside window", selectedId);

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
                                  onPress={() => setSelectedId(sticker.id)}
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