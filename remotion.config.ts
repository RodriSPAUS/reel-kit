import fs from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");

// Optional: point Remotion at a Chrome/Chromium you already have, if its own
// download is blocked on your network. Set it as an environment variable; leave unset normally.
// npm run setup keeps a backup browser in bin/chromium when the download is blocked.
const backupBrowser = path.join(process.cwd(), "bin", "chromium");
const browser =
  process.env.REMOTION_BROWSER_EXECUTABLE || (fs.existsSync(backupBrowser) ? backupBrowser : undefined);
if (browser) Config.setBrowserExecutable(browser);
