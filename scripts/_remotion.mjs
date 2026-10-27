// Shared helpers for the render and frames scripts.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition } from "@remotion/renderer";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
