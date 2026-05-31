// utils/resolveAvatar.ts
// Parses a miniAvatar string like "girl_hair1_skin2" and returns the correct image asset.

import { ImageSourcePropType } from 'react-native';

export type GirlHairId = 'hair1' | 'hair2' | 'hair3' | 'hair4';
export type BoyHairId  = 'hair1' | 'hair2' | 'hair3';
export type SkinId     = 'skin1' | 'skin2' | 'skin3' | 'skin4';
export type GenderId = 'girl' | 'boy';

export const HAIR_SKIN_MAP: {
  girl: Record<GirlHairId, Record<SkinId, any>>;
  boy:  Record<BoyHairId,  Record<SkinId, any>>;
} = {
  girl: {
    hair1: {
      skin1: require('@/assets/svgs/avatar/girl/girl_hair1_skin1.png'),
      skin2: require('@/assets/svgs/avatar/girl/girl_hair1_skin2.png'),
      skin3: require('@/assets/svgs/avatar/girl/girl_hair1_skin3.png'),
      skin4: require('@/assets/svgs/avatar/girl/girl_hair1_skin4.png'),
    },
    hair2: {
      skin1: require('@/assets/svgs/avatar/girl/girl_hair2_skin1.png'),
      skin2: require('@/assets/svgs/avatar/girl/girl_hair2_skin2.png'),
      skin3: require('@/assets/svgs/avatar/girl/girl_hair2_skin3.png'),
      skin4: require('@/assets/svgs/avatar/girl/girl_hair2_skin4.png'),
    },
    hair3: {
      skin1: require('@/assets/svgs/avatar/girl/girl_hair3_skin1.png'),
      skin2: require('@/assets/svgs/avatar/girl/girl_hair3_skin2.png'),
      skin3: require('@/assets/svgs/avatar/girl/girl_hair3_skin3.png'),
      skin4: require('@/assets/svgs/avatar/girl/girl_hair3_skin4.png'),
    },
    hair4: {
      skin1: require('@/assets/svgs/avatar/girl/girl_hair9_skin1.png'),
      skin2: require('@/assets/svgs/avatar/girl/girl_hair9_skin2.png'),
      skin3: require('@/assets/svgs/avatar/girl/girl_hair9_skin3.png'),
      skin4: require('@/assets/svgs/avatar/girl/girl_hair9_skin4.png'),
    },
  },
  boy: {
    hair1: {
      skin1: require('@/assets/svgs/avatar/boy/boy_hair1_skin1.png'),
      skin2: require('@/assets/svgs/avatar/boy/boy_hair1_skin2.png'),
      skin3: require('@/assets/svgs/avatar/boy/boy_hair1_skin3.png'),
      skin4: require('@/assets/svgs/avatar/boy/boy_hair1_skin4.png'),
    },
    hair2: {
      skin1: require('@/assets/svgs/avatar/boy/boy_hair2_skin1.png'),
      skin2: require('@/assets/svgs/avatar/boy/boy_hair2_skin2.png'),
      skin3: require('@/assets/svgs/avatar/boy/boy_hair2_skin3.png'),
      skin4: require('@/assets/svgs/avatar/boy/boy_hair2_skin4.png'),
    },
    hair3: {
      skin1: require('@/assets/svgs/avatar/boy/boy_hair3_skin1.png'),
      skin2: require('@/assets/svgs/avatar/boy/boy_hair3_skin2.png'),
      skin3: require('@/assets/svgs/avatar/boy/boy_hair3_skin3.png'),
      skin4: require('@/assets/svgs/avatar/boy/boy_hair3_skin4.png'),
    },
  },
};

/**
 * Resolves a miniAvatar string to its image asset.
 *
 * @param miniAvatar - e.g. "girl_hair1_skin2" or "boy_hair3_skin4"
 * @param fallback   - optional fallback image if parsing fails
 * @returns ImageSourcePropType ready for <Image source={...} />
 */
export function resolveAvatarImage(
  miniAvatar: string | null | undefined,
  fallback?: ImageSourcePropType
): ImageSourcePropType | null {
  if (!miniAvatar) return fallback ?? null;

  // Expected format: "{gender}_{hairId}_{skinId}"
  const parts = miniAvatar.split('_');
  // parts[0] = "girl" or "boy"
  // parts[1] = "hair1" .. "hair4"
  // parts[2] = "skin1" .. "skin4"
  if (parts.length < 3) return fallback ?? null;

  const gender = parts[0] as 'girl' | 'boy';
  const hairId = parts[1] as GirlHairId | BoyHairId;
  const skinId = parts[2] as SkinId;

  try {
    const genderMap = HAIR_SKIN_MAP[gender];
    if (!genderMap) return fallback ?? null;

    const hairMap = (genderMap as any)[hairId];
    if (!hairMap) return fallback ?? null;

    const image = hairMap[skinId];
    if (!image) return fallback ?? null;

    return image;
  } catch {
    return fallback ?? null;
  }
}