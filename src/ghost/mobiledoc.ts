/**
 * Generates a minimal Mobiledoc JSON structure containing a single Markdown card.
 * Ghost uses this format internally to ensure rich text/markdown rendering.
 */
export function createMarkdownMobiledoc(markdown: string): string {
  const mobiledoc = {
    version: '0.3.1',
    atoms: [],
    cards: [
      [
        'markdown',
        {
          markdown: markdown,
        },
      ],
    ],
    markups: [],
    sections: [[10, 0]], // 10 represents a CARD section, 0 is the index of the card in the cards array
  };

  return JSON.stringify(mobiledoc);
}
