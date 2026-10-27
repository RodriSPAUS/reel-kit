/**
 * Helpers to sync animations with the voice.
 *
 * `npm run voice` writes a timings.json for each reel. It lists every scene
 * and every spoken word with its start and end frame, so instead of guessing
 * frame numbers you can say "when the word 'hearts' is spoken in scene 'fact'".
 */
export type Word = { text: string; scene: string; start: number; end: number };
export type Scene = { start: number; end: number };

export type Timings = {
  fps: number;
  totalFrames: number;
  scenes: Record<string, Scene>;
  words: Word[];
};

const clean = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}%]/gu, "");

function findWord(t: Timings, scene: string, word: string, nth: number): Word {
  const target = clean(word);
  const matches = t.words.filter((w) => w.scene === scene && clean(w.text) === target);
  const found = matches[nth - 1];
  if (!found) {
    const said = t.words.filter((w) => w.scene === scene).map((w) => w.text).join(" ");
    throw new Error(
      `cue(): word "${word}" (#${nth}) not found in scene "${scene}". The scene says: ${said}`,
    );
  }
  return found;
}

function findScene(t: Timings, scene: string): Scene {
  const s = t.scenes[scene];
  if (!s) {
    throw new Error(`Scene "${scene}" not found. Scenes: ${Object.keys(t.scenes).join(", ")}`);
  }
  return s;
}

/** Frame where a scene starts, or where a word in it starts being spoken. */
export function cue(t: Timings, scene: string, word?: string, nth = 1): number {
  return word ? findWord(t, scene, word, nth).start : findScene(t, scene).start;
}

/** Frame where a scene ends, or where a word in it finishes. */
export function cueEnd(t: Timings, scene: string, word?: string, nth = 1): number {
  return word ? findWord(t, scene, word, nth).end : findScene(t, scene).end;
}

/** Length of a scene in frames. */
export function sceneLength(t: Timings, scene: string): number {
  const s = findScene(t, scene);
  return s.end - s.start;
}
