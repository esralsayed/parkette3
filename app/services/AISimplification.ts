// services/AISimplificationService.ts

export class AISimplificationService {

  async simplifyText(text: string, level: 'easy' | 'medium' | 'hard'): Promise<string> {
    console.log(`🤖 Simplifying for level ${level}:`, text);

    const levelGuide = {
      easy: 'Kindergarten level (ages 5-6). Very short sentences, 5-8 words. Use only the simplest words like "good", "bad", "safe", "not safe".',
      medium: '2nd grade level (ages 7-8). Simple sentences, 8-12 words.',
      hard: '3rd grade level (ages 9-10). Varied sentences, introduce new words with context.',
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Simplify this children's safety education game text to ${levelGuide[level]}

Rules:
- Keep the EXACT same safety message
- Do NOT change names or key actions
- Return ONLY the simplified text, nothing else

Text: "${text}"`
          }]
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic API ${response.status}: ${err}`);
      }

      const data = await response.json();
      const simplified = data.content?.[0]?.text?.trim();
      if (!simplified) throw new Error('Empty response');

      console.log(`✅ "${text}" → "${simplified}"`);
      return simplified;

    } catch (error) {
      console.error('❌ Simplification failed:', error);
      return text;
    }
  }

  async simplifyBatch(texts: string[], level: 'easy' | 'medium' | 'hard'): Promise<string[]> {
    return Promise.all(texts.map(t => this.simplifyText(t, level)));
  }
}