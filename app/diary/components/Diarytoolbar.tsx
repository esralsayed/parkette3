
import Paintbucket from '@/assets/svgs/diary/paint tool.svg';
import Pen1 from '@/assets/svgs/diary/pen1.svg';
import Pen2 from '@/assets/svgs/diary/pen2.svg';
import Sticker from '@/assets/svgs/diary/Sticker.svg';
import Texticon from '@/assets/svgs/diary/type.svg';
import Undo from '@/assets/svgs/diary/undo.svg';
import { AppColors } from '@/constants/theme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}
interface ExpandableActionBarProps {
  style?: object;
  onColor: () => void;
  onText: () => void;
  onStickers: () => void;
  onUndo: () => void;
}

function ActionButton({ action }: { action: ActionOption }) {
  const [showLabel, setShowLabel] = useState(false);

  return (
    <View style={styles.actionWrapper}>
      <TouchableOpacity
        onPress={action.onPress}
        onLongPress={() => setShowLabel(true)}
        onPressOut={() => setShowLabel(false)}
        style={styles.actionButton}
        activeOpacity={0.7}
      >
        {action.icon}
      </TouchableOpacity>

      {showLabel && (
        <View style={styles.labelBubble}>
          <Text style={styles.labelText}>{action.label}</Text>
        </View>
      )}
    </View>
  );
}

export function ExpandableActionBar({ style, onColor, onText, onStickers, onUndo }: ExpandableActionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

    const ACTION_OPTIONS: ActionOption[] = [
    { id: 'color',    label: 'Color',    icon: <Paintbucket width={36} height={36} />, onPress: onColor },
    { id: 'text',     label: 'Text',     icon: <Texticon width={36} height={36} />,    onPress: onText },
    { id: 'stickers', label: 'Stickers', icon: <Sticker width={36} height={36} />,    onPress: onStickers },
    { id: 'undo',     label: 'Undo',     icon: <Undo width={36} height={36} />,        onPress: onUndo },
  ];

return (
    <View style={[styles.wrapper, style]}>
      {isExpanded && <View style={styles.triggerShadow} />}
      <TouchableOpacity
        onPress={() => setIsExpanded(prev => !prev)}
        style={[styles.triggerButton, isExpanded && styles.triggerButtonActive]}
        activeOpacity={0.8}
      >
        {isExpanded ? <Pen2 width={40} height={40} /> : <Pen1 width={40} height={40} />}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.container}>
          {ACTION_OPTIONS.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </View>
      )}
    </View>
);
}

const TRIGGER_SIZE = 64;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const styles = StyleSheet.create({
  outerWrapper: {
  alignSelf: 'flex-start',
},
  wrapper: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'relative'
  },
  triggerButton: {
    width: TRIGGER_SIZE * 1.4,
    height: TRIGGER_SIZE * 1.4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.lilac,
    zIndex: 2,
    borderColor:AppColors.blue,
    borderWidth:1,
    // shadow so it feels elevated
    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  triggerButtonActive: {
    backgroundColor: AppColors.blue, // same, or darken slightly
    shadowOpacity: 0,
    elevation: 0,
    transform: [{ scale: 0.95 }],

  },
  triggerShadow:{
    position:"absolute",
    width: TRIGGER_SIZE *1.4,
    height: TRIGGER_SIZE *1.4,
    backgroundColor:AppColors.lilac,
    borderColor:AppColors.blue,
    borderWidth:1,
    borderRadius:12,
    top: 3,   // offset down
  left: 3,  // offset right
  zIndex: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.lilac,
    borderWidth: 1,
    borderColor: AppColors.blue,
    borderRadius: 10,
    height: TRIGGER_SIZE - 8,
    paddingLeft: 32,   // space so icons don't sit flush to the left edge
    paddingRight: 12,
    gap: 40,
    marginLeft: -12,   // pulls container under the trigger button
    zIndex: 1,
  },
  actionWrapper: {
    alignItems: 'center',
  },
  actionButton: {
    width:36,
    height:36,
    alignItems: 'center',
    justifyContent: 'center',

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
});