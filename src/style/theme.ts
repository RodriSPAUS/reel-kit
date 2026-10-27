/**
 * YOUR STYLE LIVES HERE.
 *
 * Every reel reads its colours, fonts and layout from this file, so changing
 * a value here changes the look of all your videos at once.
 * Describe the feeling you want in STYLE.md; put the numbers here.
 */
export const theme = {
  // Name shown on the badge in the top corner of every reel.
  channelName: "My Channel",

  colors: {
    background: "#F6F1E7", // canvas colour
    ink: "#1E1E24", // main text
    muted: "#6B6B76", // secondary text, footnotes
    accent: "#E4572E", // the one colour that grabs attention
    accent2: "#2E86AB", // a second colour for comparisons
    highlight: "#FFD23F", // marker behind key words
  },

  fonts: {
    // Any font installed on your computer works. To use a Google Font,
    // see "Fonts" in the README.
    heading: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
    body: "'Helvetica Neue', Arial, sans-serif",
  },

  subtitles: {
    enabled: true,
    fontSize: 58,
    color: "#1E1E24",
    activeColor: "#E4572E", // colour of the word being spoken
    background: "rgba(255,255,255,0.85)",
    wordsPerLine: 4, // how many words are shown at once
    bottom: 430, // distance from the bottom edge, in pixels
  },

  // Areas the apps cover with buttons and captions. Keep important things
  // inside. Values are pixels on a 1080x1920 frame.
  safeZone: { top: 220, bottom: 380, left: 80, right: 160 },

  // Slow zoom of the whole canvas (1 = none). Adds life to still scenes.
  canvasZoom: 1.04,

  video: { width: 1080, height: 1920, fps: 30 },
} as const;

export type Theme = typeof theme;
