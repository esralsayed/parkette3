import Hair from "@/assets/svgs/avatar/hair.svg";
import Skin from "@/assets/svgs/avatar/Skin tone.svg";
import { AppColors, AppFonts, AppFontSizes, Spacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ViewShot from 'react-native-view-shot';
import Footer from "../../components/Footer";
import NavBar from "../../components/navbar";
import { useAvatar } from "../hooks/useAvatar";
import { BALD_MAP, HAIR_SKIN_MAP, RENDERED_H, RENDERED_W, Window } from "./AvatarWindows";


interface ActionOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

function ActionButton({action} : {action:ActionOption}) {
const [showLabel, setShowLabel] = useState(false); 
    return (
        <View>
            <TouchableOpacity onPress={action.onPress}
            onLongPress={() => setShowLabel(true)}
            onPressOut={() => setShowLabel(false)}>
                <View style={[{position:"relative"}]}>
                    <View style={styles.box2}></View>
                    <View style={styles.box1}></View>
                    <View style={styles.box3}>
                        {action.icon}
                    </View>
                </View>
            </TouchableOpacity>

            {showLabel && (
                <View style={styles.labelBubble}>
                    <Text style={styles.labelText}>{action.label}</Text>
                </View>
            )}
        </View>
    )
}

function Buttons({ actions }: { actions: ActionOption[] }) {
    return (
        <View style={{ flexDirection: "column", alignItems: "center", gap: 100, marginTop: 20 }}>
            {actions.map((action) => (
                <ActionButton key={action.id} action={action} />
            ))}
        </View>
    );
}

function GenderToggle({ selected, onToggle }: { 
  selected: 'girl' | 'boy'; 
  onToggle: () => void 
}) {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: selected === 'girl' ? 0 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [selected]);

  const sliderX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 120], // adjust based on pill width
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={1}>
      <View style={toggleStyles.track}>
        <Animated.View style={[toggleStyles.slider, { transform: [{ translateX: sliderX }] }]} />
        <View style={toggleStyles.labels}>
          <Text style={[toggleStyles.label, selected === 'girl' && toggleStyles.labelActive]}>👧 Girl</Text>
          <Text style={[toggleStyles.label, selected === 'boy' && toggleStyles.labelActive]}>👦 Boy</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const toggleStyles = StyleSheet.create({
  track: {
    width: 250,
    height: 60,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AppColors.blue,
    backgroundColor: AppColors.lilac,
    justifyContent: 'center',
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    width: 125,
    height: 60,
    borderRadius: 20,
    backgroundColor: AppColors.blue,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    width: 80,
    textAlign: 'center',
    ...AppFonts.body,
    fontSize: 27,
    color: AppColors.blue,
  },
  labelActive: {
    color: AppColors.lilac,
  },
});

    
export default function CommunityLanding() {
  const [name, setName] = useState('');
  const [unlockedItems, setUnlockedItems] = useState<{ type: string; itemId: string }[]>([]);

  const avatarRef = useRef<ViewShot>(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then((userStr) => {
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name);
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chapters/${user.id}/rewards`)
          .then(r => r.json())
          .then(data => setUnlockedItems(data.unlockedItems ?? []))
          .catch(e => console.error('Failed to fetch rewards:', e));
      }
    });
  }, []);

  console.log("unlocked items", unlockedItems)
const {handleHair, handleSkin, activeWindow, closeWindow, selectedHair, selectedSkin, setSelectedHair,setSelectedSkin,
  saving, saveError, saveAll, selectedGender, setSelectedGender
} = useAvatar(); 

const ACTION_OPTIONS: ActionOption[] =  [
{ id: 'hair', label: 'hair' , icon: <Hair style={[{left:5}]} />, onPress: handleHair },
{ id: 'skin', label: 'skin Tone' , icon: <Skin />, onPress: handleSkin }, 
]

  function toggleGender() {
  setSelectedGender(g => g === 'girl' ? 'boy' : 'girl');
  setSelectedHair(null); // reset hair when switching
  setSelectedSkin(null);
}

console.log("inside main1", selectedHair); 
console.log('skin:', selectedSkin, '→', BALD_MAP[selectedGender][selectedSkin ?? 'skin1']);
const hairSkinMap = HAIR_SKIN_MAP as Record<string, Record<string, Record<string, any>>>;

  return (
    <ScrollView style={styles.container}>
      <NavBar />
      <View style={styles.main}>
        <View style={styles.cont}>
            <View style={[{ marginBottom:20, flexDirection: 'row', gap: 40}]}>
                <Text style={[{...AppFonts.title, color:AppColors.blue, fontSize:48}]}>Character Customization</Text>
                <GenderToggle selected={selectedGender} onToggle={toggleGender} />
            </View>
            <View style={[{flexDirection:'row', alignContent: 'center', justifyContent:'space-between'}]}>
                <View>
                   <Buttons actions={ACTION_OPTIONS} />
                </View>
                <View style={{ width: RENDERED_W, height: RENDERED_H, position: 'relative' }}>
                  {selectedHair && hairSkinMap[selectedGender][selectedHair] ? (
                  <Image
                    source={hairSkinMap[selectedGender][selectedHair][selectedSkin ?? 'skin1']}
                    style={{ position: 'absolute', top: 0, left: 0, width: RENDERED_W, height: RENDERED_H }}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={BALD_MAP[selectedGender][selectedSkin ?? 'skin1']}
                    style={{ position: 'absolute', top: 0, left: 0, width: RENDERED_W, height: RENDERED_H }}
                    resizeMode="contain"
                  />
                  )}
                </View>
                <View style={[{flexDirection:"column"}]}>
                    <View>
                        {activeWindow && (
                        <Window
                        onClose={() => closeWindow(activeWindow)}
                        activeWindow={activeWindow}
                        onSelect={(id) => {
                          console.log("inside main" , id);
                          if (activeWindow === 'hair') setSelectedHair(id); 
                          if (activeWindow === 'skin') setSelectedSkin(id); 
                        }} 
                        gender={selectedGender}
                        unlockedItems={unlockedItems}/>
         
                        )}
                    </View>
                    <View></View>
                </View>
            </View>
            <View style={[{flexDirection: 'row', justifyContent:'space-between' , marginTop: 50}]}>
                <Text style={styles.pinText}>Name: {name}</Text>
                <TouchableOpacity style={styles.pin} 
                onPress={() => router.push('/protected/Community')}>
                    <Text style={styles.pinText}>Back to menu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pin} onPress={() => saveAll()} disabled={saving}>
                <Text style={styles.pinText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
                <Text style={styles.pinText}>Pet:</Text>
            </View>
        </View>
      </View>
      {saveError && <Text style={{ color: 'red' }}>{saveError}</Text>}

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lilac,
    flexDirection: 'column'
  },
  main: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxl, 

  },
  cont:{
    flexGrow: 1,
    flexDirection: "column" , 
    justifyContent: 'space-between',
  },
  box1:{
    position:"absolute",
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 20,
    width: 85,
    height: 85,
    zIndex: 10
  },
  box2:{
    position:"absolute",
    backgroundColor: AppColors.blue,
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 20,
    width: 85,
    height: 85,
    top: 5,
    left: 5
  },
    box3:{
    position:"absolute",
    backgroundColor: "transparent",
    borderRadius: 20,
    zIndex: 10, 
    alignContent: 'center',
    left: 12,
    top: 12
  },
    labelBubble: {
    position: 'absolute',
    bottom: 44,
    backgroundColor: '#003E8F',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
    pin: {
    backgroundColor: AppColors.lilac,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderRadius: 4,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,

    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },

  pinText: {
    ...AppFonts.body,
    color: AppColors.blue,
    fontSize: AppFontSizes.subhead
  },
});