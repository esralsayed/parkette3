// DevOffsetPanel.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SCENE_REGISTRY } from '../services/sceneConfig';

interface Props {
  sceneKey?: string;
  offsets: Record<number, number>;
  setOffsets: React.Dispatch<React.SetStateAction<Record<number, number>>>;
}

export default function DevOffsetPanel({ sceneKey, offsets, setOffsets }: Props) {
  if (!sceneKey) return null;

  const config = SCENE_REGISTRY[sceneKey];
  if (!config) return null;

  const elements = config.elements.filter(el => el.kind === 'character' || el.kind === 'prop');

  return (
    <View style={styles.panel} pointerEvents="box-none">
      {elements.map((el, i) => {
        const current = offsets[i] ?? ('verticalOffset' in el ? el.verticalOffset ?? 0 : 0);
        return (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{el.kind}[{i}]</Text>
            <Pressable style={styles.btn} onPress={() => setOffsets(p => ({ ...p, [i]: current + 5 }))}>
              <Text>▲</Text>
            </Pressable>
            <Text style={styles.val}>{current}</Text>
            <Pressable style={styles.btn} onPress={() => setOffsets(p => ({ ...p, [i]: current - 5 }))}>
              <Text>▼</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { position: 'absolute', top: 60, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 8, zIndex: 9999 },
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  label: { color: 'white', fontSize: 10, marginRight: 6, width: 70 },
  btn:   { backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginHorizontal: 2 },
  val:   { color: 'white', width: 36, textAlign: 'center', fontSize: 12 },
});