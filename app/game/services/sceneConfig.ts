// sceneRegistry.ts

// svg imports
import Couch from "@/assets/svgs/game/chapters/couch.svg";
import Door from "@/assets/svgs/game/chapters/door.svg";
import Frame1 from "@/assets/svgs/game/chapters/frame1.svg";
import Frame2 from "@/assets/svgs/game/chapters/frame2.svg";
import Table from "@/assets/svgs/game/chapters/table.svg";
import TV from "@/assets/svgs/game/chapters/tv.svg";

import Bag from "@/assets/svgs/game/chapters/bag.svg";
import Book from "@/assets/svgs/game/chapters/book.svg";
import Bottle from "@/assets/svgs/game/chapters/bottle.svg";
import Counter2 from "@/assets/svgs/game/chapters/counter2.svg";
import Curtain from "@/assets/svgs/game/chapters/curtain.svg";
import Door2 from "@/assets/svgs/game/chapters/door2.svg";
import Pen from "@/assets/svgs/game/chapters/pen.svg";
import SmokeAlarm from "@/assets/svgs/game/chapters/smokealarm.svg";
import Spoon from "@/assets/svgs/game/chapters/spoon.svg";
import Stove from "@/assets/svgs/game/chapters/stove.svg";
import Towel from "@/assets/svgs/game/chapters/towel.svg";


// image imports
import Ball from '../../../assets/images/chapters/Ball.png';
import Cat from '../../../assets/images/chapters/Cat.png';
import Friend1 from '../../../assets/images/chapters/friend1.png';
import Friend2 from '../../../assets/images/chapters/friend2.png';
import Friend3 from '../../../assets/images/chapters/friend3.png';
import Man from '../../../assets/images/chapters/Man.png';
import Mom from '../../../assets/images/chapters/Mom.png';
import MainGirl from '../../../assets/images/maingirl.png';

import { SceneDefinition } from './sceneSystem';

export const SCENE_REGISTRY: Record<string, SceneDefinition> = {

  'park_arrival': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'oak',  slot: 'far-left',  size: 'large', depth: 'near' },
      { kind: 'tree',      variant: 'pine', slot: 'right',     size: 'large', depth: 'mid'  },
      { kind: 'tree',      variant: 'oak',  slot: 'far-right', size: 'large', depth: 'near' },
      { kind: 'character', image: Mom,      slot: 'left',         size: 'hero'   },
      { kind: 'character', image: Cat,      slot: 'center-left',  size: 'small'  },
      { kind: 'character', image: MainGirl, slot: 'center-right', size: 'medium' },
    ],
  },

  'park_play': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'pine', slot: 'center',       size: 'large',  depth: 'near' },
      { kind: 'character', image: MainGirl, slot: 'left',         size: 'medium' },
      { kind: 'character', image: Cat,      slot: 'center-left',  size: 'small'  },
      { kind: 'character', image: Friend1,  slot: 'center-right', size: 'medium' },
      { kind: 'character', image: Friend2,  slot: 'right',        size: 'medium' },
      { kind: 'character', image: Friend3,  slot: 'far-right',    size: 'medium' },
    ],
  },

  'park_volleyball': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'pine', slot: 'left',         size: 'large', depth: 'near' },
      { kind: 'tree',      variant: 'pine', slot: 'far-right',    size: 'large', depth: 'near' },
      { kind: 'character', image: MainGirl, slot: 'center',       size: 'medium' },
      { kind: 'character', image: Friend3,  slot: 'right',        size: 'medium' },
      { kind: 'prop',      image: Ball,     slot: 'center-right', size: 'small', depth: 'mid'  },
    ],
  },

  'park_stranger': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'pine', slot: 'left',         size: 'large', depth: 'near' },
      { kind: 'character', image: MainGirl, slot: 'center',       size: 'medium' },
      { kind: 'character', image: Man,      slot: 'far-right',    size: 'large'  },
      { kind: 'prop',      image: Ball,     slot: 'center-right', size: 'small', depth: 'mid'  },
    ],
  },

  'park_slide': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: Friend2,  slot: 'far-right',    size: 'medium' },
      { kind: 'character', image: MainGirl, slot: 'center',       size: 'medium' },
      { kind: 'tree',      variant: 'oak',  slot: 'center-right', size: 'large', depth: 'near' },
      { kind: 'tree',      variant: 'oak',  slot: 'far-left',     size: 'large', depth: 'near' },
    ],
  },

  'home': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center', size: 'large' },
      { kind: 'prop',      image: Door,     slot: 'center',      size: 'xxlarge', verticalOffset: -185 },
      { kind: 'prop',      image: Couch,    slot: 'center-right', size: 'xxxlarge', verticalOffset: -305 },
      { kind: 'prop',      image: Table,    slot: 'left',  size: 'xlarge',  verticalOffset: -90 },
      { kind: 'prop',      image: Frame1,   slot: 'left', size: 'hero', verticalOffset: 300 },
      { kind: 'prop',      image: Frame2,   slot: 'right', size: 'hero', verticalOffset: 315 },
      { kind: 'prop',      image: TV,       slot: 'far-left', size: 'herox', verticalOffset: -65 },
    ],
  },

  'kitchen': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center', size: 'large' },
      { kind: 'prop',      image: Door2,    slot: 'center-toward-right', size: 'xxlarge', verticalOffset: -210 },
      { kind: 'prop',      image: Couch,    slot: 'far-far-left', size: 'xxxlarge', verticalOffset: -300 },
      { kind: 'prop',      image: Book,    slot: 'center-right',  size: 'medium',  verticalOffset: 10 },
      { kind: 'prop',      image: Pen,    slot: 'center-toward-right', size: 'medium', verticalOffset: -50 },
      { kind: 'prop',      image: SmokeAlarm,    slot: 'center-toward-right', size: 'large', verticalOffset: 455 },
    ],
  },

  'kitchen2': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'left', size: 'large' },
      { kind: 'prop',      image: Stove,    slot: 'center-slightly-right', size: 'xlarge', verticalOffset: -165 },
      { kind: 'prop',      image: Curtain,    slot: 'center-left', size: 'semixlarge', verticalOffset: 135 },  
      { kind: 'prop',      image: Counter2,    slot: 'center-toward-right', size: 'semixxlarge', verticalOffset: -70 },

    ],
  },

  'kitchen3': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'left', size: 'large' },
      { kind: 'prop',      image: Stove,    slot: 'center', size: 'xlarge', verticalOffset: -165 },
      { kind: 'prop',      image: Curtain,    slot: 'left', size: 'semixlarge', verticalOffset: 235 },  
      { kind: 'prop',      image: Spoon,    slot: 'center-toward-right', size: 'medium', verticalOffset: 335 },
      { kind: 'prop',      image: Towel,    slot: 'right', size: 'medium', verticalOffset: 335 },
      { kind: 'prop',      image: Bag,    slot: 'before-before-far-right', size: 'medium', verticalOffset: 335 },
      { kind: 'prop',      image: Bottle,    slot: 'before-far-right', size: 'medium', verticalOffset: 335 },
      { kind: 'prop',      image: Counter2,    slot: 'center-right', size: 'semixxlarge', verticalOffset: -70 },

    ],
  },

  'kitchen4': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center', size: 'large' },
      { kind: 'prop',      image: Door,     slot: 'center',      size: 'xxlarge', verticalOffset: -185 },
      { kind: 'prop',      image: Couch,    slot: 'center-right', size: 'xxxlarge', verticalOffset: -305 },
      { kind: 'prop',      image: Table,    slot: 'left',  size: 'xlarge',  verticalOffset: -90 },
      { kind: 'prop',      image: Frame1,   slot: 'left', size: 'hero', verticalOffset: 300 },
      { kind: 'prop',      image: Frame2,   slot: 'right', size: 'hero', verticalOffset: 315 },
      { kind: 'prop',      image: TV,       slot: 'far-left', size: 'herox', verticalOffset: -65 },
    ],
  },

};