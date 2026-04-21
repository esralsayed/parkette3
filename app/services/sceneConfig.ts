// sceneRegistry.ts

import { SceneDefinition } from './sceneSystem';

export const SCENE_REGISTRY: Record<string, SceneDefinition> = {

  'park_arrival': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'oak',  slot: 'far-left',  size: 'large', depth: 'near' },
      { kind: 'tree',      variant: 'pine', slot: 'right',     size: 'large', depth: 'mid'  },
      { kind: 'tree',      variant: 'oak',  slot: 'far-right', size: 'large', depth: 'near' },
      { kind: 'character', image: require('../../assets/images/chapters/Mom.png'),     slot: 'left',         size: 'hero'   },
      { kind: 'character', image: require('../../assets/images/chapters/Cat.png'),     slot: 'center-left',  size: 'small'  },
      { kind: 'character', image: require('../../assets/images/maingirl.png'),slot: 'center-right', size: 'medium' },
    ],
  },

  'park_play': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree',      variant: 'pine', slot: 'center', size: 'large', depth: 'near'  },
      { kind: 'character', image: require('../../assets/images/maingirl.png'), slot: 'left',         size: 'medium' },
      { kind: 'character', image: require('../../assets/images/chapters/Cat.png'),      slot: 'center-left',  size: 'small'  },
      { kind: 'character', image: require('../../assets/images/chapters/friend1.png'),  slot: 'center-right', size: 'medium' },
      { kind: 'character', image: require('../../assets/images/chapters/friend2.png'),  slot: 'right',        size: 'medium' },
      { kind: 'character', image: require('../../assets/images/chapters/friend3.png'),  slot: 'far-right',    size: 'medium' },
    ],
  },

  'park_volleyball': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree', variant: 'pine', slot: 'left',      size: 'large', depth: 'near' },
      { kind: 'tree', variant: 'pine', slot: 'far-right', size: 'large', depth: 'near' },
      { kind: 'character', image: require('../../assets/images/maingirl.png'), slot: 'center', size: 'medium' },
      { kind: 'character', image: require('../../assets/images/chapters/friend3.png'),  slot: 'right',    size: 'medium' },
      { kind: 'prop' , image: require('../../assets/images/chapters/Ball.png'), slot: 'center-right', size: 'small', depth: 'mid' },


    ],
  },

  'park_stranger': {
    atmosphere: 'day',
    elements: [
      { kind: 'tree', variant: 'pine', slot: 'left',      size: 'large', depth: 'near' },
      { kind: 'character', image: require('../../assets/images/maingirl.png'), slot: 'center', size: 'medium' },
      { kind: 'character' , image: require('../../assets/images/chapters/Man.png'), slot: 'far-right', size: 'large' },
      { kind: 'prop' , image: require('../../assets/images/chapters/Ball.png'), slot: 'center-right', size: 'small', depth: 'mid' },

    ], // Game takes over the whole scene
  },
};