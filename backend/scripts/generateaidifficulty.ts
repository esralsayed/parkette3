// scripts/generateDifficultyVariants.ts
import Anthropic from '@anthropic-ai/sdk';
import Level from '../models/content agent/Level.js';

const client = new Anthropic();

async function generateVariantsForLevel(level: any) {
  const prompt = `
You are adapting a children's educational game level into 3 difficulty variants.

ORIGINAL LEVEL DIALOG:
${JSON.stringify(level.dialog, null, 2)}

Return ONLY valid JSON in this exact shape:
{
  "easy": {
    "dialog": [
      // same number of steps as original, with simplified text, instructions, and choice options
      // use very simple words (age 5-6 level), short sentences, encouraging tone
    ]
  },
  "medium": {
    "dialog": [
      // same as original but slightly polished
    ]
  },
  "hard": {
    "dialog": [
      // same steps, more complex vocabulary, no hints, less feedback
    ]
  }
}

Rules:
- Keep the exact same number of dialog steps
- Keep taskType, type, speaker, content structure intact
- Only modify: text, instruction, correctFeedback, wrongFeedback, and choice option text
- For easy: short words, big encouragement, max 2 choices
- For hard: remove hints, add distractor choices, terse feedback
`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}

async function run() {
  const levels = await Level.find({ isActive: true });
  
  for (const level of levels) {
    console.log(`Processing level: ${level.title}`);
    try {
      const variants = await generateVariantsForLevel(level);
      
      await Level.findByIdAndUpdate(level._id, {
        'difficultyVariants.easy': { dialog: variants.easy.dialog },
        'difficultyVariants.medium': { dialog: variants.medium.dialog },
        'difficultyVariants.hard': { dialog: variants.hard.dialog },
      });
      
      console.log(`✅ Done: ${level.title}`);
    } catch (err) {
      console.error(`❌ Failed: ${level.title}`, err);
    }
  }
}

run();