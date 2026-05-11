import Bow from "@/assets/svgs/avatar/bow.svg";
import Feet from '@/assets/svgs/avatar/Feet.svg';
import Hair from "@/assets/svgs/avatar/hair.svg";
import Pants from "@/assets/svgs/avatar/Pnats.svg";
import Skin from "@/assets/svgs/avatar/Skin tone.svg";
import Top from "@/assets/svgs/avatar/Top.svg";
import Bald2 from '@/assets/svgs/diary/bald2.png';
import { AppColors, AppFonts, AppFontSizes, Spacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Footer from "../../components/Footer";
import NavBar from "../../components/navbar";
import { useAvatar } from "../hooks/useAvatar";
import { AvatarLayer, RENDERED_H, RENDERED_W, Window } from "./AvatarWindows";


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

    
export default function CommunityLanding() {
const [name, setName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('user').then((userStr) => {
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name);
      }
    });
  }, []);
const { width: screenWidth, height:screenHeight } = useWindowDimensions();
const {handleAccessory, handleBottom, handleHair, handleSkin, handleTop, handleFeet, activeWindow, closeWindow, selectedHair, selectedSkin, setSelectedHair,setSelectedSkin,
  saving, saveError, saveAll
} = useAvatar(); 

const ACTION_OPTIONS: ActionOption[] =  [
{ id: 'hair', label: 'hair' , icon: <Hair style={[{left:5}]} />, onPress: handleHair },
{ id: 'skin', label: 'skin Tone' , icon: <Skin />, onPress: handleSkin }, 
{ id: 'top', label: 'top' , icon: <Top />, onPress: handleTop }, 
{ id: 'bottom', label: 'bottom' , icon: <Pants />, onPress: handleBottom }, 
{ id: 'feet', label: 'feet' , icon: <Feet />, onPress : handleFeet }, 
{ id: 'bow', label: 'accessory' , icon: <Bow />, onPress: handleAccessory }, 
]

console.log("inside main1", selectedHair); 

  return (
    <ScrollView style={styles.container}>
      <NavBar />
      <View style={styles.main}>
        <View style={styles.cont}>
            <View style={[{ marginBottom:20}]}>
                <Text style={[{...AppFonts.title, color:AppColors.blue, fontSize:AppFontSizes.title}]}>Character Customization</Text>
            </View>
            <View style={[{flexDirection:'row', alignContent: 'center', justifyContent:'space-between'}]}>
                <View>
                   <Buttons actions={ACTION_OPTIONS} />
                </View>
                <View style={{ width: RENDERED_W, height: RENDERED_H, position: 'relative' }}>
                <Image
                  source={Bald2}
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0,
                    width: RENDERED_W, 
                    height: RENDERED_H 
                  }}
                  resizeMode="contain"
                />
                  <AvatarLayer selectedId={selectedSkin} layerKey="skin" />
                  <AvatarLayer selectedId={selectedHair} layerKey="hair" />
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
                        }} />
                        )}
                    </View>
                    <View></View>
                </View>
            </View>
            <View style={[{flexDirection: 'row', justifyContent:'space-between' , marginTop: 150}]}>
                <Text style={styles.pinText}>Name: {name}</Text>
                <TouchableOpacity style={styles.pin} 
                onPress={() => router.push('/community/main')}>
                    <Text style={styles.pinText}>Back to menu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pin} onPress={saveAll} disabled={saving}>
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