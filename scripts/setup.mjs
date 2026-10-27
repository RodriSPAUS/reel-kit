// One-step setup. Safe to run again at any time: it only does what is missing.
//
//   npm run setup
//
// It installs the project's packages, the voice engine and its model, checks
// ffmpeg and the browser Remotion uses to draw frames, and finally makes a test
// picture. At the end it prints a checklist. Anything it can't fix by itself
// comes with the exact command to fix it.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findPython } from "./py.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIN = process.platform === "win32";
const MAC = process.platform === "darwin";
const results = [];

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: WIN, ...opts });
const ok = (name, detail = "") => results.push({ ok: true, name, detail });
const fail = (name, fix) => results.push({ ok: false, name, fix });
const step = (msg) => console.log(`\n▶ ${msg}`);

// 1. Node
step("Checking Node.js");
const major = Number(process.versions.node.split(".")[0]);
if (major >= 20) ok("Node.js", process.versions.node);
else
  fail(
    "Node.js 20 or newer",
    WIN ? "winget install OpenJS.NodeJS.LTS" : MAC ? "brew install node" : "install Node 20+ from https://nodejs.org",
  );

// 2. npm packages
step("Installing project packages (first time takes a minute or two)");
if (fs.existsSync(path.join(ROOT, "node_modules", "remotion", "package.json"))) {
  ok("Project packages", "already installed");
} else {
  const npm = run(WIN ? "npm.cmd" : "npm", ["install"], { stdio: "inherit" });
  if (npm.status === 0) ok("Project packages");
  else fail("Project packages", "npm install   (read the error above)");
}

// 3. Python + voice engine
step("Checking Python and the voice engine");
const py = findPython();
if (!py) {
  fail(
    "Python 3.10 or newer",
    WIN ? "winget install Python.Python.3.12" : MAC ? "brew install python" : "sudo apt-get install -y python3 python3-pip",
  );
} else {
  ok("Python", py);
  const has = run(py, ["-c", "import kokoro_onnx, soundfile, numpy"]);
  if (has.status !== 0) {
    console.log("  Installing voice engine packages…");
    let pip = run(py, ["-m", "pip", "install", "--user", "-r", "requirements.txt"], { stdio: "inherit" });
    if (pip.status !== 0)
      pip = run(py, ["-m", "pip", "install", "--break-system-packages", "-r", "requirements.txt"], { stdio: "inherit" });
    if (pip.status !== 0) {
      // Python without pip: try to add it.
      run(py, ["-m", "ensurepip", "--upgrade"], { stdio: "inherit" });
      pip = run(py, ["-m", "pip", "install", "--user", "-r", "requirements.txt"], { stdio: "inherit" });
    }
  }
  if (run(py, ["-c", "import kokoro_onnx, soundfile, numpy"]).status === 0) {
    ok("Voice engine (Kokoro)");
    const dl = run(py, ["scripts/voice.py", "--download-only"], { stdio: "inherit" });
    if (dl.status === 0) ok("Voice model");
    else fail("Voice model", `${py} scripts/voice.py --download-only   (needs internet access to github.com)`);
  } else {
    fail("Voice engine (Kokoro)", `${py} -m pip install -r requirements.txt`);
  }
}

// 4. ffmpeg
step("Checking ffmpeg");
const ff = run("ffmpeg", ["-version"]);
if (ff.status === 0) ok("ffmpeg", ff.stdout.split("\n")[0].split(" ")[2] ?? "");
else
  fail(
    "ffmpeg",
    WIN ? "winget install Gyan.FFmpeg   (then open a new terminal)" : MAC ? "brew install ffmpeg" : "sudo apt-get install -y ffmpeg",
  );

// 5. Browser + test frame
step("Checking the browser that draws the frames");
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  ok("Browser", `using ${process.env.REMOTION_BROWSER_EXECUTABLE}`);
} else {
  const local = path.join(ROOT, "bin", "chromium");
  const br = fs.existsSync(local)
    ? { status: 0, local: true }
    : run(WIN ? "npx.cmd" : "npx", ["remotion", "browser", "ensure"], { stdio: "inherit" });
  if (br.status === 0) ok("Browser", br.local ? "bin/chromium" : "");
  else if (process.platform === "linux") {
    // Cloud sandboxes often block Remotion's own download. Fall back to a
    // Chromium build published on npm, and keep a copy in bin/ (git-ignored).
    console.log("  Remotion's browser download is blocked here; trying a backup browser…");
    const npmCmd = WIN ? "npm.cmd" : "npm";
    run(npmCmd, ["i", "--no-save", "@sparticuz/chromium"], { stdio: "inherit" });
    const p = run(process.execPath, [
      "-e",
      "require('@sparticuz/chromium').default.executablePath().then(p=>console.log(p))",
    ]);
    const exe = p.stdout.trim().split("\n").pop();
    if (p.status === 0 && exe && fs.existsSync(exe)) {
      fs.mkdirSync(path.dirname(local), { recursive: true });
      fs.copyFileSync(exe, local);
      fs.chmodSync(local, 0o755);
      ok("Browser", "backup browser in bin/chromium");
    } else fail("Browser", "could not get a browser. See 'Troubleshooting' in AGENTS.md");
  } else
    fail("Browser", "Remotion could not download its browser. See 'Troubleshooting' in AGENTS.md");
}

if (results.every((r) => r.ok)) {
  step("Making a test picture");
  const still = run(process.execPath, ["scripts/style-preview.mjs"], { stdio: "inherit" });
  if (still.status === 0) ok("Test picture", "videos/style-preview.png");
  else fail("Test picture", "node scripts/style-preview.mjs   (read the error above)");
}

// Summary
console.log("\n──────── Setup checklist ────────");
for (const r of results) console.log(`${r.ok ? "✔" : "✖"} ${r.name}${r.ok && r.detail ? `  (${r.detail})` : ""}`);
const bad = results.filter((r) => !r.ok);
if (bad.length) {
  console.log("\nTo fix:");
  for (const r of bad) console.log(`  • ${r.name}: ${r.fix}`);
  console.log("\nAfter fixing, run: npm run setup");
  process.exit(1);
}
console.log("\nAll set! Everything works.");
