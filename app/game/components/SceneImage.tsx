// components/SceneImage.tsx

import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { SvgProps } from 'react-native-svg';

type ImageSource = number | { uri: string }; // PNG/JPG (require())
type SvgComponent = React.FC<SvgProps>;      // SVG (require().default or import)

interface SceneImageProps {
  source: ImageSource | SvgComponent;
  style?: StyleProp<ImageStyle>;
  width?: number;
  height?: number;
}

function isSvgComponent(src: any): src is SvgComponent {
  return typeof src === 'function';
}

export default function SceneImage({ source, style, width, height }: SceneImageProps) {
  if (isSvgComponent(source)) {
    const SvgComp = source;
    return <SvgComp width={width ?? '100%'} height={height ?? '100%'} />;
  }
  return <Image source={source} style={style} resizeMode="contain" />;
}