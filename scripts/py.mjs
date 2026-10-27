// Runs a Python script with whichever Python this computer has
// (python3 on Mac/Linux, python or py on Windows).
//   node scripts/py.mjs scripts/voice.py <args>
import { spawnSync } from "node:child_process";

export function findPython() {
  for (const cmd of ["python3", "python", "py"]) {
    const r = spawnSync(cmd, ["-c", "import sys; print(sys.version_info[:2] >= (3, 10))"], {
      encoding: "utf8",
      shell: process.platform === "win32",
    });
    if (r.status === 0 && r.stdout.trim() === "True") return cmd;
  }
  return null;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("py.mjs")) {
  const py = findPython();
  if (!py) {
    console.error("✖ Python 3.10 or newer was not found. Run: npm run setup");
    process.exit(1);
  }
  const r = spawnSync(py, process.argv.slice(2), { stdio: "inherit", shell: process.platform === "win32" });
  process.exit(r.status ?? 1);
}
