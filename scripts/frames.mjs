// Save single frames as PNG to check a scene without rendering the video.
//
//   npm run frames -- <reel> 0,120,300
//
// Frames are counted in the final video (the first 8 are the cover).
// Pictures go to out/frames/<reel>/.
import path from "node:path";
import fs from "node:fs";
import { renderStill } from "@remotion/renderer";
import { ROOT, prepare, browserExecutable } from "./_remotion.mjs";

const [id, list = "0"] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const { serveUrl, composition } = await prepare(id);
const dir = path.join(ROOT, "out", "frames", id);
fs.mkdirSync(dir, { recursive: true });

for (const f of list.split(",").map(Number)) {
  if (f >= composition.durationInFrames) {
    console.log(`  skip ${f}: the reel has ${composition.durationInFrames} frames`);
    continue;
  }
  const out = path.join(dir, `f${String(f).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, output: out, frame: f, browserExecutable });
  console.log(`✔ ${path.relative(ROOT, out)}`);
}
