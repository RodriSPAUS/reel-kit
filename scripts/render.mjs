// Render a reel to MP4, plus its cover image.
//
//   npm run preview -- <reel>    half size, fast, to check timing and text
//   npm run render  -- <reel>    final 1080x1920 video for upload
//
// Options: --frames=100-300 (render only part), --concurrency=4
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { renderMedia, renderStill } from "@remotion/renderer";
import { ROOT, prepare, arg, browserExecutable } from "./_remotion.mjs";

const preview = process.argv.includes("--preview");
const id = process.argv.slice(2).find((a) => !a.startsWith("--"));
const { serveUrl, composition } = await prepare(id);

const outDir = path.join(ROOT, "out");
fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, preview ? `${id}-preview.mp4` : `${id}.mp4`);

const range = arg("frames");
const frameRange = range ? range.split("-").map(Number) : null;
const concurrency = Number(arg("concurrency", Math.max(1, Math.floor(os.cpus().length / 2))));

const started = Date.now();
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  codec: "h264",
  outputLocation: file,
  browserExecutable,
  concurrency,
  frameRange,
  scale: preview ? 0.5 : 1,
  crf: preview ? 32 : 18,
  jpegQuality: preview ? 70 : 90,
  pixelFormat: "yuv420p",
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct !== last && pct % 5 === 0) {
      last = pct;
      process.stdout.write(`\rRendering ${id}: ${pct}%   `);
    }
  },
});
console.log(`\n✔ ${path.relative(ROOT, file)}  (${Math.round((Date.now() - started) / 1000)} s)`);

if (!preview && !frameRange) {
  const cover = path.join(outDir, `${id}-cover.png`);
  await renderStill({ serveUrl, composition, output: cover, frame: 0, browserExecutable });
  console.log(`✔ ${path.relative(ROOT, cover)}  (the cover frame, for platforms that ask for an image)`);
}
