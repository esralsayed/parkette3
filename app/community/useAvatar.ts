import { useState } from "react";

export type ActiveWindow = 'hair' | 'skin' | 'top' | 'bottom' | 'feet' | 'accessory' | null;

export function useAvatar() {
    const [activeWindow, setActiveWindow] = useState<ActiveWindow>(null); 

    const closeWindow = async (type: ActiveWindow) => {
        switch (type) {
          case 'hair':
            setActiveWindow(null); 
           // await saveHair();
            break;
          case 'skin':
            setActiveWindow(null); 
            //await saveSkin();
            break;
          case 'top':
            setActiveWindow(null); 
            //await saveTop();
            break;
          case 'bottom' : 
            setActiveWindow(null); 
            //await saveBottom(); 
          case 'feet': 
            setActiveWindow(null); 
            //await saveFeet(); 
          case 'accessory' : 
            setActiveWindow(null); 
            //await saveBow(); 
          default:
            break;
        }
        setActiveWindow(null);
    };

    //windows 

    const handleHair = () => {
        console.log("am in hair?"); 
        setActiveWindow('hair'); 
        console.log(activeWindow); 
    }

    const handleSkin = () => {
        setActiveWindow('skin'); 
    }

    const handleTop = () => {
        setActiveWindow('top'); 
    }

    const handleBottom = () => {
        setActiveWindow('bottom'); 
    }

    const handleAccessory = () => {
        setActiveWindow('accessory'); 
    }

    const handleFeet = () => {
        setActiveWindow('feet');
    }

    return {
        handleAccessory,
        handleBottom, 
        handleHair,
        handleSkin,
        handleTop,
        handleFeet, 
        activeWindow, 
        closeWindow
}; 


}