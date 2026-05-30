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
import House from "@/assets/svgs/game/chapters/house.svg";
import Pen from "@/assets/svgs/game/chapters/pen.svg";
import SmokeAlarm from "@/assets/svgs/game/chapters/smokealarm.svg";
import Socket from "@/assets/svgs/game/chapters/socket.svg";
import Spoon from "@/assets/svgs/game/chapters/spoon.svg";
import Stove from "@/assets/svgs/game/chapters/stove.svg";
import Towel from "@/assets/svgs/game/chapters/towel.svg";
import Toy1 from "@/assets/svgs/game/chapters/toy1.svg";
import Tree2 from "@/assets/svgs/game/chapters/tree2.svg";

//school chapter
import Cloud1 from "@/assets/svgs/community/cloud2.svg";
import Cloud2 from "@/assets/svgs/community/cloud3.svg";
import Board from "@/assets/svgs/game/chapters/board.svg";
import Clock from "@/assets/svgs/game/chapters/clock.svg";
import Crosswalk from "@/assets/svgs/game/chapters/crosswalk.svg";
import Desk from "@/assets/svgs/game/chapters/desk.svg";
import Exit from "@/assets/svgs/game/chapters/exit.svg";
import Locker from "@/assets/svgs/game/chapters/locker.svg";
import School from "@/assets/svgs/game/chapters/school.svg";
import Teacher from "@/assets/svgs/game/chapters/teacher.svg";
import Traffic from "@/assets/svgs/game/chapters/traffic.svg";


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
      { kind: 'character', image: Cat,      slot: 'center-left',  size: 'medium', verticalOffset: 50  },
      { kind: 'character', image: MainGirl, slot: 'center-right', size: 'large' },
      { kind: 'prop',      image: Cloud1,     slot: 'center',       size: 'hero', verticalOffset: 350   },
      { kind: 'prop',      image: Cloud2,     slot: 'center-right', size: 'hero', verticalOffset: 350 },
    ],
  },

  'park_play': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'pine', slot: 'center',       size: 'large',  depth: 'near' },
      { kind: 'character', image: MainGirl, slot: 'left',         size: 'large' },
      { kind: 'character', image: Cat,      slot: 'center-left',  size: 'medium', verticalOffset:50  },
      { kind: 'character', image: Friend1,  slot: 'center-right', size: 'large' },
      { kind: 'character', image: Friend2,  slot: 'right',        size: 'large' },
      { kind: 'character', image: Friend3,  slot: 'far-right',    size: 'large' },
      { kind: 'prop',      image: Cloud1,     slot: 'center',       size: 'hero', verticalOffset: 350 },
      { kind: 'prop',      image: Cloud2,     slot: 'center-right', size: 'hero', verticalOffset: 350  },
    ],
  },

  'park_volleyball': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'pine', slot: 'left',         size: 'large', depth: 'near' },
      { kind: 'tree',      variant: 'pine', slot: 'far-right',    size: 'large', depth: 'near' },
      { kind: 'character', image: MainGirl, slot: 'center',       size: 'large' },
      { kind: 'character', image: Friend3,  slot: 'right',        size: 'large' },
      { kind: 'prop',      image: Ball,     slot: 'center-right', size: 'medium', depth: 'mid'  },
    ],
  },

  'park_stranger': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'pine', slot: 'left',         size: 'large', depth: 'near' },
      { kind: 'character', image: MainGirl, slot: 'center',       size: 'large' },
      { kind: 'character', image: Man,      slot: 'far-right',    size: 'large'  },
      { kind: 'prop',      image: Ball,     slot: 'center-right', size: 'medium', depth: 'mid'  },
    ],
  },

  'park_slide': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: Friend2,  slot: 'far-right',    size: 'large' },
      { kind: 'character', image: MainGirl, slot: 'center',       size: 'large' },
      { kind: 'tree',      variant: 'oak',  slot: 'center-right', size: 'large', depth: 'near' },
      { kind: 'tree',      variant: 'oak',  slot: 'far-left',     size: 'large', depth: 'near' },
    ],
  },

  'home': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center', size: 'large' },
      { kind: 'prop',      image: Door,     slot: 'center',      size: 'xxlarge', verticalOffset: -185 },
      { kind: 'prop',      image: Couch,    slot: 'center-toward-right', size: 'xxlarge', verticalOffset: -205 },
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
      { kind: 'prop',      image: Door2,    slot: 'center-right', size: 'xxlarge', verticalOffset: -210 },
      { kind: 'prop',      image: Couch,    slot: 'far-far-left', size: 'xxlarge', verticalOffset: -200 },
      { kind: 'prop',      image: Book,    slot: 'center-right',  size: 'medium',  verticalOffset: 10 },
      { kind: 'prop',      image: Pen,    slot: 'center-toward-right', size: 'medium', verticalOffset: -50 },
      { kind: 'prop',      image: SmokeAlarm,    slot: 'center-right', size: 'large', verticalOffset: 355 },
    ],
  },

  'kitchen2': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: '0% left', size: 'large' },
      { kind: 'prop',      image: Stove,    slot: 'center-slightly-right', size: 'xlarge', verticalOffset: -165 },
      { kind: 'prop',      image: Curtain,    slot: 'center-left', size: 'semixlarge', verticalOffset: 35 },  
      { kind: 'prop',      image: Counter2,    slot: 'center-toward-right', size: 'semixxlarge', verticalOffset: -70 },

    ],
  },

  'kitchen3': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: '0% left', size: 'large' },
      { kind: 'prop',      image: Stove,    slot: 'center', size: 'xlarge', verticalOffset: -80 },
      { kind: 'prop',      image: Curtain,    slot: 'left', size: 'semixlarge', verticalOffset: 85 },  
      { kind: 'prop',      image: Spoon,    slot: 'center-toward-right', size: 'medium', verticalOffset: 285 },
      { kind: 'prop',      image: Towel,    slot: 'right', size: 'medium', verticalOffset: 290 },
      { kind: 'prop',      image: Bag,    slot: 'before-before-far-right', size: 'medium', verticalOffset: 285 },
      { kind: 'prop',      image: Bottle,    slot: 'before-far-right', size: 'medium', verticalOffset: 280 },
      { kind: 'prop',      image: Counter2,    slot: 'center-right', size: 'semixxlarge', verticalOffset: -75 },

    ],
  },

  'kitchen4': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center', size: 'large' },
      { kind: 'prop',      image: Door,     slot: 'center',      size: 'xxlarge', verticalOffset: -185 },
      { kind: 'prop',      image: Couch,    slot: 'center-toward-right', size: 'xxlarge', verticalOffset: -205 },
      { kind: 'prop',      image: Table,    slot: 'left',  size: 'xlarge',  verticalOffset: -90 },
      { kind: 'prop',      image: Frame1,   slot: 'left', size: 'hero', verticalOffset: 300 },
      { kind: 'prop',      image: Frame2,   slot: 'right', size: 'hero', verticalOffset: 315 },
      { kind: 'prop',      image: TV,       slot: 'far-left', size: 'herox', verticalOffset: -65 },
    ],
  },
  
  'kitchen5': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center-left', size: 'large' },
      { kind: 'prop',      image: House,    slot: 'center', size: 'xxxlarge', verticalOffset: -150 },
      { kind: 'prop',      image: Tree2,    slot: 'far-left', size: 'xlarge', verticalOffset: -25 },
    ]
  },

  'living_room': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center', size: 'large' },
      { kind: 'prop',      image: Toy1,       slot: 'center-slightly-right', size: 'herox', verticalOffset: -185 },
      { kind : 'prop',      image: Pen,     slot: '15% left',      size: 'medium', verticalOffset: 180 },
      { kind: 'character', image: Mom,      slot: 'right', size: 'hero' , depth: 'near',verticalOffset: 20},
      { kind: 'prop',      image: Socket,     slot: 'fifty-percent', size: 'medium', verticalOffset: 270 },
      { kind: 'prop',      image: Table,    slot: 'left',  size: 'xlarge',  verticalOffset: -90 },
      { kind: 'prop' ,     image: Bottle,   slot: 'center-left', size: 'medium', verticalOffset: 250 },
      { kind: 'prop',      image: Frame1,   slot: 'left', size: 'hero', verticalOffset: 320 },
      { kind: 'prop',      image: Frame2,   slot: 'right', size: 'hero', verticalOffset: 360 },
      { kind: 'prop',      image: TV,       slot: 'far-left', size: 'herox', verticalOffset: -65 },
    ],
  },

    'hallway_start': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center-slightly-right', size: 'large' },
      { kind: 'character', image: Teacher,      slot: 'far-left', size: 'hero' , depth: 'near',verticalOffset: 20},
      { kind: 'prop',      image: Board,     slot: 'left',      size: 'semixxlarge', verticalOffset: -130 },
      { kind: 'prop',      image: Clock,    slot: 'center-right', size: 'large', verticalOffset: 360 },
      { kind: 'prop',      image: Desk,    slot: 'before-before-far-right',  size: 'herox',  verticalOffset: -90 },
      { kind: 'prop',      image: Desk,    slot: 'center-right',  size: 'herox',  verticalOffset: -90 },

    ],
  },

  'hallway_busy': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: '15% left', size: 'large' },
      { kind: 'character', image: Teacher,      slot: 'far-left', size: 'hero' , depth: 'near',verticalOffset: 20},
      { kind: 'prop',      image: Exit,     slot: 'right',      size: 'medium', verticalOffset: 430 },
      { kind: 'prop',      image: Clock,    slot: 'center-right', size: 'large', verticalOffset: 430 },
      { kind: 'prop',      image: Locker,    slot: 'right',  size: 'xlarge',  verticalOffset: -5 },
      { kind: 'prop',      image: Locker,    slot: 'center-right',  size: 'xlarge',  verticalOffset: -5 },
      { kind: 'prop',      image: Locker,    slot: '55% right',  size: 'xlarge',  verticalOffset: -5 },
      { kind: 'prop',      image: Locker,    slot: 'center-left',  size: 'xlarge',  verticalOffset: -5 },
    ],
  },

    'school_exit': {
    atmosphere: 'day',
    elements: [
      { kind: 'character', image: MainGirl, slot: 'center-slightly-right', size: 'large' },
      { kind: 'character', image: Teacher,      slot: 'far-left', size: 'hero' , depth: 'near',verticalOffset: 20},
      { kind: 'prop',      image: Crosswalk,     slot: '15% left',      size: 'semixlarge', verticalOffset: -330 },
      { kind: 'prop',      image: School,     slot: 'fifty-percent',      size: 'threexhalf', verticalOffset: -410 },
      { kind: 'prop',      image: Traffic,    slot: '0% left',  size: 'herox',  verticalOffset: 100 },
      { kind: 'prop',      image: Cloud1,    slot: 'center-left',  size: 'herox',  verticalOffset: 400 },
    ],
  },


};