import Bow from "@/assets/svgs/avatar/bow.svg";
import Feet from '@/assets/svgs/avatar/Feet.svg';
import Hair from "@/assets/svgs/avatar/hair.svg";
import Bald from "@/assets/svgs/avatar/hairs/rinabald.svg";
import Pants from "@/assets/svgs/avatar/Pnats.svg";
import Skin from "@/assets/svgs/avatar/Skin tone.svg";
import Top from "@/assets/svgs/avatar/Top.svg";
import { AppColors, AppFonts, AppFontSizes, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Footer from "../components/Footer";
import NavBar from "../components/navbar";
import { Window } from "./AvatarWindows";
import { useAvatar } from "./useAvatar";
const { width : screenWidth, height:screenHeight } = Dimensions.get("window");
//copy from diary tool bar actionss

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

    
export default function CommunityLanding() {

const {handleAccessory, handleBottom, handleHair, handleSkin, handleTop, handleFeet, activeWindow, closeWindow} = useAvatar(); 

const ACTION_OPTIONS: ActionOption[] =  [
{ id: 'hair', label: 'hair' , icon: <Hair style={[{left:5}]} />, onPress: handleHair },
{ id: 'skin', label: 'skin Tone' , icon: <Skin />, onPress: handleSkin }, 
{ id: 'top', label: 'top' , icon: <Top />, onPress: handleTop }, 
{ id: 'bottom', label: 'bottom' , icon: <Pants />, onPress: handleBottom }, 
{ id: 'feet', label: 'feet' , icon: <Feet />, onPress : handleFeet }, 
{ id: 'bow', label: 'accessory' , icon: <Bow />, onPress: handleAccessory }, 
]

console.log("in main",activeWindow);
const Buttons = () => (
    <View style={[{flexDirection:"column" , alignItems: "center" , gap:100, marginTop: 20}]}>
        {ACTION_OPTIONS.map((action) => (
            <ActionButton key={action.id} action={action} />
        ))}
    </View>

);

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
                    <Buttons />
                </View>
                <View>
                    <Bald />
                </View>
                <View style={[{flexDirection:"column"}]}>
                    <View>
                        {activeWindow && (
                        <Window
                        onClose={() => closeWindow(activeWindow)}
                        activeWindow={activeWindow} />
                        )}
                    </View>
                    <View></View>
                </View>
            </View>
            <View style={[{flexDirection: 'row', justifyContent:'space-between' , marginTop: 150}]}>
                <Text style={styles.pinText}>Name:</Text>
                <TouchableOpacity style={styles.pin} 
                onPress={() => router.push('/community/main')}>
                    <Text style={styles.pinText}>Back to menu</Text>
                </TouchableOpacity>
                <Text style={styles.pinText}>Pet:</Text>
            </View>
        </View>
      </View>

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

   window: {
    flexDirection: "column",
    borderWidth: 5,
    borderColor: AppColors.blue,
    borderRadius: 24,
    backgroundColor: AppColors.lilac,
    overflow: 'hidden',
    width: screenWidth * 0.25,
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: screenWidth * 0.025,
    paddingHorizontal: screenWidth * 0.01,
    backgroundColor: AppColors.lilac,
  },
  leftWindow: {
    flex: 1,
    alignItems: 'center',
  },
  circleStack: {
  width: screenWidth * 0.08,   // match your SVG width
  height: screenWidth * 0.08,  // match your SVG height
  position: 'relative',
},
  rightWindow: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',  // full height
  },
  divider:{
    width: 2,
    backgroundColor: AppColors.blue
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