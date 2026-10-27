// Create a new reel from the template.
//
//   npm run new -- my-reel-name
//
// Makes src/reels/<name>/ with a script.txt to fill in, a starter Reel.tsx,
// and registers it so it shows up in the studio.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv[2];

if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error("Give the reel a name with lowercase letters, numbers and dashes, e.g.: npm run new -- octopus-hearts");
  process.exit(1);
}
const dir = path.join(ROOT, "src", "reels", name);
if (fs.existsSync(dir)) {
  console.error(`A reel called "${name}" already exists.`);
  process.exit(1);
}

const tpl = path.join(ROOT, "templates", "reel");
fs.mkdirSync(dir, { recursive: true });
for (const f of fs.readdirSync(tpl)) {
  const text = fs.readFileSync(path.join(tpl, f), "utf8").replaceAll("__REEL__", name);
  fs.writeFileSync(path.join(dir, f), text);
}
fs.mkdirSync(path.join(ROOT, "public", "reels", name), { recursive: true });

// Register it.
const reg = path.join(ROOT, "src", "reels", "registry.ts");
const varName = "r_" + name.replace(/-/g, "_");
let src = fs.readFileSync(reg, "utf8");
src = src.replace("// </imports>", `import { reel as ${varName} } from "./${name}/Reel";\n// </imports>`);
src = src.replace("  // </list>", `  ${varName},\n  // </list>`);
fs.writeFileSync(reg, src);

console.log(`✔ Created src/reels/${name}/
Next:
  1. Write the script in src/reels/${name}/script.txt
  2. npm run voice -- ${name}          (or record yourself, see README)
  3. Draw the scenes in src/reels/${name}/Reel.tsx
  4. npm run studio                     (watch it live)
  5. npm run preview -- ${name}  →  npm run render -- ${name}`);
