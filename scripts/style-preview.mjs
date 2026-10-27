// Draw one picture that shows the current style (colours, fonts, subtitles).
//
//   npm run style-preview   →  videos/style-preview.png
import path from "node:path";
import fs from "node:fs";
import { renderStill } from "@remotion/renderer";
import { ROOT, prepare, browserExecutable } from "./_remotion.mjs";

const { serveUrl, composition } = await prepare("style-preview");
const dir = path.join(ROOT, "videos");
fs.mkdirSync(dir, { recursive: true });
const out = path.join(dir, "style-preview.png");
await renderStill({ serveUrl, composition, output: out, frame: 45, browserExecutable });
console.log(`✔ ${path.relative(ROOT, out)}`);
