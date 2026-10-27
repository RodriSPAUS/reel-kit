// Shared helpers for the render and frames scripts.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition } from "@remotion/renderer";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Reads .env so REMOTION_BROWSER_EXECUTABLE works without exporting it.
const envFile = path.join(ROOT, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

export const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;

export async function prepare(id) {
  if (!id) {
    console.error("Say which reel, e.g.: npm run render -- example");
    process.exit(1);
  }
  process.stdout.write("Bundling… ");
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts") });
  console.log("done");
  let composition;
  try {
    composition = await selectComposition({ serveUrl, id, browserExecutable });
  } catch (e) {
    console.error(`\nCould not find a reel called "${id}". Check src/reels/registry.ts.\n${e.message}`);
    process.exit(1);
  }
  return { serveUrl, composition };
}

export function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
}
