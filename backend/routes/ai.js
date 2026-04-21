import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

const airouter = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const levelGuide = {
  easy: 'Kindergarten level (ages 5-6). Very short sentences, 5-8 words. Use only the simplest words like "good", "bad", "safe", "not safe".',
  medium: '2nd grade level (ages 7-8). Simple sentences, 8-12 words.',
  hard: '3rd grade level (ages 9-10). Varied sentences, introduce new words with context.',
};

airouter.post('/simplify', async (req, res) => {
  console.log('📥 Received simplification request:', JSON.stringify(req.body, null, 2));
  try {
    const { text, level } = req.body;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Simplify this children's safety education game text to ${levelGuide[level]}

Rules:
- Keep the EXACT same safety message
- Do NOT change names or key actions
- Return ONLY the simplified text, nothing else

Text: "${text}"`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API ${response.status}: ${err}`);
    }

    const data = await response.json();
    const simplifiedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;

    console.log(`🤖 Simplified: "${text}" → "${simplifiedText}"`);

    res.json({ original: text, simplifiedText });

  } catch (error) {
    console.error('AI simplification error:', error);
    res.status(500).json({
      error: 'Failed to simplify text',
      simplifiedText: req.body.text
    });
  }
});

airouter.post('/simplify-batch', async (req, res) => {
  try {
    const { texts, level } = req.body;
    const simplified = await Promise.all(
      texts.map(async (text) => {
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/ai/simplify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, level })
        });
        const data = await response.json();
        return data.simplifiedText;
      })
    );
    res.json({ simplifiedTexts: simplified });
  } catch (error) {
    res.status(500).json({ error: 'Batch simplification failed' });
  }
});

export default airouter;