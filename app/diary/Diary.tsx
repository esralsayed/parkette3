"use client";

import type { Diary } from "@/app/repositories/Diary";
import { AppColors, AppFonts } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import NavBar from "../components/navbar";
import { getDiary } from "../repositories/Diary";
import { DiaryBook } from "./DiaryBook";
import { ExpandableActionBar } from "./Diarytoolbar";
import { DiarySpread } from "./OpenDiary";
import { ColoredWindow, StickersWindow, TextWindow } from "./toolBarActions";
import { useDiaryToolbar } from "./useToolBar";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DiaryLandingPage() {
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [diaryId, setDiaryId] = useState<string | null>(null); 
  const backendTheme = diary?.theme === 'blue' ? 'blue' : 'lilac';
  const { diaryTheme, activeWindow, closeWindow, handleColorPicked, handleColor,
  handleStickers, handleText, handleUndo, handleStickerRemove,
  selectedLetter, selectedLetterIndex, handleLetterSelect,    // ← add
  setFontFamily, setFontSize, setAlignment, setLetterColor, setLetters, letters,
  handleStickerPlaced, placedStickers, handleStickerSelected, selectedStickerId
   } = useDiaryToolbar(diaryId,backendTheme,  diary?.stickers ?? []);

  const [openDiary, setOpenDiary] = useState(false); 
  


  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.id || null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadUserName();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getDiary(userId);
        if (!cancelled) setDiary(data);
        setDiaryId(data._id); 
        console.log(diaryId);
        console.log(diary);
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error).message ?? "Could not load diary");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const handleDiaryClick = async () => {
  console.log("this is active window BEFORE condition:", activeWindow);

  if (!activeWindow) {
    console.log("opening diary...");
    setOpenDiary(true);
  } else {
    console.log("blocked because activeWindow =", activeWindow);
  }
  };

useEffect(() => {
  if (!diary) return;
  const defaultColor = diary.theme === 'blue' ? AppColors.lilac : AppColors.blue;

  if (diary.diaryTitle.letters && diary.diaryTitle.letters.length > 0) {
    // backend has saved letters — use them
    setLetters(diary.diaryTitle.letters);
  } else {
    // no saved letters — generate from title
    const generated = diary.diaryTitle.text.split('').map((char, i) => ({
      letter: char,
      style: {
        fontFamily: 'Game Paused DEMO',
        fontSize: screenWidth * 0.055,
        alignment: 'center',
        color: defaultColor ?? '#003E8F',
      },
      position: { x: i, y: 0 },
    }));
    setLetters(generated);
  }
}, [diary]);

  const ownerName = diary?.diaryTitle.text ?? "Your";
  const theme = diary?.theme === "blue" ? "blue" : "lilac";

  if (loading) {
    return (
      <View style={styles.container}>
        <NavBar />
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color={AppColors.blue} />
          <Text style={styles.loadingText}>Loading your diary…</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <NavBar />
        <View style={styles.errorArea}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>😿</Text>
          <Text style={{ fontWeight: '700' }}>Couldn't load your diary</Text>
          <Text style={{ opacity: 0.7, fontSize: 14, marginTop: 4 }}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavBar />
      {/* Window anchored to top right of page */}
    {activeWindow === 'color' && (
      <View style={styles.colorWindowAnchor}>
        <ColoredWindow
          onClose={()=>closeWindow("color")}
          onColorPicked={handleColorPicked}
        />
      </View>
    )}
    {activeWindow === 'text' && (
  <View style={styles.colorWindowAnchor}>
    <TextWindow
      onClose={() => closeWindow('text')}
      selectedLetter={selectedLetter}
      onFontFamily={setFontFamily}
      onFontSize={setFontSize}
      onAlignment={setAlignment}
      onColor={setLetterColor}
    />
  </View>
)}
{activeWindow === 'stickers' && (
  <View style={styles.colorWindowAnchor}>
    <StickersWindow
      onClose={() => closeWindow('stickers')}
      onStickerSelected={handleStickerSelected}
      selectedStickerId={selectedStickerId}
    />
  </View>
)}
      <View style={styles.main}>
        {!openDiary && (
        <View>
        <DiaryBook
        ownerName={ownerName}
        onPress={handleDiaryClick}
        opening={opening}
        theme={diaryTheme}
        onLetterSelect={handleLetterSelect}
        selectedLetterIndex={selectedLetterIndex}
        isTextMode={activeWindow === 'text'}   // ← only interactive when text window open
        letters={letters}
        placedStickers={placedStickers}
        onStickerPlace={handleStickerPlaced}
        isStickerMode={activeWindow === 'stickers'}
        onStickerRemove={handleStickerRemove}
      />
        <ExpandableActionBar
        onColor={handleColor}
        onText={handleText}
        onStickers={handleStickers}
        onUndo={handleUndo}
 />
 </View>
        )}

 {openDiary && (
  <DiarySpread
  diaryId={diaryId}
/>
 )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lilac,
  },
  colorWindowAnchor: {
  position: 'absolute',
  top: screenHeight * 0.1,    // 10% from top — sits below navbar
  right: screenWidth *0.05 ,  // 4% from right edge
  zIndex: 50,
},
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap:48
  },
  loadingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    ...AppFonts.body,
    color: AppColors.blue,
  },
  errorArea: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});