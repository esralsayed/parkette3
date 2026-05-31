import { useEffect, useState } from "react";
import { loadAvatar, saveAvatar } from "../repository/Avatar";

export type ActiveWindow = 'hair' | 'skin' | 'top' | 'bottom' | 'feet' | 'accessory' | null;

export function useAvatar() {
    const [activeWindow, setActiveWindow] = useState<ActiveWindow>(null); 
    const [selectedSkin, setSelectedSkin] = useState<string | null>(null);
    const [selectedHair, setSelectedHair] = useState<string | null>(null);
    const [selectedGender, setSelectedGender] = useState<'girl' | 'boy'>('girl');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
      loadAvatar()
        .then((avatar) => {
          if (avatar.hair) setSelectedHair(avatar.hair);
          if (avatar.skin) setSelectedSkin(avatar.skin);
          if (avatar.gender) setSelectedGender(avatar.gender as 'girl' | 'boy');
        })
        .catch((err) => console.log('Failed to load avatar:', err));
    }, []);

  //   const saveLayer = async (updates: Record<string, string | null>) => {
  //   setSaving(true);
  //   setSaveError(null);
  //   try {
  //     await saveAvatar(updates);
  //   } catch (e: any) {
  //     setSaveError(e.message);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const saveAll = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveAvatar({
        hair: selectedHair,
        skin: selectedSkin,
        gender: selectedGender,
        // miniAvatar key so backend knows which PNG to reference
        miniAvatar: selectedHair && selectedSkin
          ? `${selectedGender}_${selectedHair}_${selectedSkin}`
          : null,
      });
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

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
        closeWindow,   
        selectedSkin, setSelectedSkin,
        selectedHair, setSelectedHair, selectedGender, setSelectedGender,
        saveAll, saveError, saving
}; 


}