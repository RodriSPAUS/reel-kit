---
type: guide
title: reel-kit
description: Make short vertical videos (Reels, Shorts, TikTok) with code. Write a script, get a voice, animate scenes in sync with the words, render an MP4.
tags: [remotion, video, reels, shorts, tiktok, text-to-speech]
status: draft
generated: {by: claude/opus-5, at: 2026-10-27}
---

# reel-kit

Make short vertical videos (Reels, Shorts, TikTok) with code instead of a video editor.

You write a script. The kit gives it a voice, works out when every word is spoken, and lets you make drawings, numbers and text appear exactly on that word. Then it renders a 1080×1920 MP4 ready to upload, with subtitles burned in and a cover frame at the start.

It is built on [Remotion](https://www.remotion.dev) (videos written in React).

**Free, and everything runs on your computer.** The voice comes from [Kokoro](https://github.com/hexgrad/kokoro), an open-source text-to-speech model (or from your own recording), and the video renders locally. No accounts, no API keys, no paid services.

---

## How it works

```
script.txt ──► npm run voice ──► voice.m4a + timings.json ──► Reel.tsx (scenes) ──► npm run render ──► MP4
                 (Kokoro or your mic)                         cue(T, "scene", "word")
```

1. **Script.** `src/reels/<name>/script.txt`: scenes in `[brackets]`, one sentence per line.
2. **Voice.** `npm run voice -- <name>` makes `voice.m4a` and `timings.json` (the frame where every scene and word starts).
3. **Scenes.** In `Reel.tsx`, one component per scene. `cue(T, "hook", "three")` gives you the frame where "three" is said.
4. **Check.** `npm run studio` to watch it live, `npm run frames` for still pictures, `npm run preview` for a quick low-quality video.
5. **Render.** `npm run render -- <name>` → `out/<name>.mp4` and `out/<name>-cover.png`.

There is a complete example in `src/reels/example/` (a 20-second reel about octopus hearts). Open it in the studio first.

---

## Install

You need:

- **Node.js 20 or newer**: <https://nodejs.org>
- **Python 3.10 or newer**: <https://www.python.org>
- **ffmpeg**: macOS `brew install ffmpeg` · Windows `winget install ffmpeg` · Linux `sudo apt install ffmpeg`

Then, in the project folder:

```bash
npm install
pip install -r requirements.txt
npm run studio
```

The studio opens in your browser. Pick **example** on the left and press play.

The first time you run `npm run voice`, it downloads the Kokoro voice model (about 120 MB) into `models/`. That folder is ignored by git.

---

## Make your first reel

```bash
npm run new -- octopus-ink      # creates src/reels/octopus-ink/
```

Edit `src/reels/octopus-ink/script.txt`:

```
[hook]
An octopus can disappear in less than a second.

[ink]
It shoots a cloud of ink shaped like itself.
Predators attack the cloud.

[outro]
Which animal should I do next?
```

Then:

```bash
npm run voice -- octopus-ink
npm run studio                  # draw the scenes in Reel.tsx and watch them update
npm run preview -- octopus-ink  # half-size video to check
npm run render -- octopus-ink   # final video
```

### Making things appear on a word

```tsx
<Scene t={T} name="ink">
  <Appear at={cue(T, "ink", "cloud")} effect="pop">
    <Title>Ink decoy</Title>
  </Appear>
</Scene>
```

Ready-made pieces in `src/components/`:

| Component | What it does |
|---|---|
| `Scene` | Shows its content only while that part of the voice plays |
| `Appear` | Fades, slides up or pops in at a frame |
| `Title`, `Body` | Big and normal text in your style |
| `Highlight` | Draws a marker behind a word |
| `Counter` | A number that counts up |
| `Footnote` | Small "Source: …" line |
| `Heart`, `Drop`, `Chip` | Simple drawn icons (add your own SVGs) |

`cue(T, scene)` is when a scene starts, `cue(T, scene, word)` when a word starts, `cueEnd(...)` when it ends. If a word appears twice in a scene, `cue(T, scene, word, 2)` is the second one.

---

## Voices

Choose in `voice.config.json` (`"engine"`) or per run with `--engine`.

| Engine | Cost | Quality | What you need |
|---|---|---|---|
| `kokoro` (default) | Free | Good, slightly robotic | Nothing. Runs on your computer |
| `recorded` | Free | As good as your mic | A recording of yourself |

**Kokoro.** Change `"voice"` and `"lang"` in `voice.config.json`. Some voices: `af_heart`, `af_bella`, `am_michael`, `bf_emma`, `bm_george` (English); `ef_dora`, `em_alex` (Spanish, with `"lang": "es"`); also French, Italian, Portuguese, Japanese, Chinese and Hindi. If a voice name is wrong, the script lists all of them.

**Your own voice.** Record the script with your phone, reading each line once and **leaving about one second of silence between lines**. Save it as `public/reels/<name>/voice-raw.m4a` (or `.mp3` / `.wav`), then:

```bash
npm run voice -- <name> --engine recorded
```

The script finds one chunk per line, shortens the pauses, speeds the voice up a little without changing its pitch (`"speed"` under `"recorded"`), and evens out the volume. If it can't match the lines, it tells you why.

Word timings are estimated from the length of each word inside its line, not detected from the audio. They are close enough for animations; if a word lands a little early or late, add or subtract a few frames: `cue(T, "ink", "cloud") + 4`.

---

## Your style

- **`STYLE.md`**: describe in words who the videos are for, the tone, what to avoid. Fill it in once; it guides you (and any AI assistant you use) for every reel.
- **`src/style/theme.ts`**: the numbers: channel name, colours, fonts, subtitle look, safe zone. Change it once and every reel follows.

**Fonts.** Any font installed on your computer works: put its name in `theme.fonts`. For a Google Font that works the same on every computer, `npm i @remotion/google-fonts` and follow <https://www.remotion.dev/docs/google-fonts>.

**Safe zone.** The apps cover the bottom and right of the video with buttons and captions. `Scene` keeps things inside `theme.safeZone`; keep important text there.

**Cover.** The first 8 frames (a quarter of a second) show your hook, already drawn. When you upload, choose the first frame as the cover. `npm run render` also saves it as `out/<name>-cover.png`.

**Music (optional).** Put a track in `public/music/` and pass `music="music/track.m4a"` to `ReelFrame`. Only use music you are allowed to use, and note where it came from in `public/music/LICENSES.md`. Keep it quiet: the voice matters more.

---

## Safety

This kit needs no accounts, passwords or API keys, so there is nothing secret to protect in it. Keep it that way: never paste a password or key into a file you push to GitHub.

If you are making videos as a kid or teen: ask an adult before creating accounts or posting. Most platforms require you to be at least 13, and some ask for more.

---

## Rendering

```bash
npm run preview -- <name>                 # 540×960, fast
npm run render -- <name>                  # 1080×1920, H.264, ready to upload
npm run render -- <name> --frames=0-150   # just a part
npm run frames -- <name> 0,120,300        # still pictures to out/frames/
```

One MP4 works for Instagram Reels, YouTube Shorts and TikTok. A 30-second reel takes a few minutes on a normal laptop; more CPU cores = faster.

If Remotion cannot download its browser (some school or office networks block it), install Chrome or Chromium and set the environment variable `REMOTION_BROWSER_EXECUTABLE` to its path before rendering.

---

## Using an AI assistant

`AGENTS.md` explains the workflow to coding assistants such as Claude Code, Cursor or Copilot: how a reel is built, which files to touch, and when to stop and ask you. A good way to start:

> Read AGENTS.md and STYLE.md. Help me write a script for a reel about why cats purr.

[docs/writing-scripts.md](docs/writing-scripts.md) has tips for hooks and keeping people watching.

---

## Project layout

```
src/
  reels/<name>/       script.txt, Reel.tsx, timings.json   ← one folder per reel
  reels/registry.ts   list of reels (npm run new updates it)
  components/         reusable pieces
  style/theme.ts      your style
  lib/timings.ts      cue() and friends
public/reels/<name>/  voice.m4a (and voice-raw.* if you recorded)
scripts/              voice.py, render.mjs, frames.mjs, new-reel.mjs
templates/reel/       what npm run new copies
voice.config.json     voice settings
STYLE.md              your style in words
AGENTS.md             instructions for AI assistants
```

---

## Licenses

- The code in this repo: MIT (see `LICENSE`).
- **Remotion** has its own license: free for individuals and small teams, paid for larger companies. Read <https://www.remotion.dev/license>.
- **Kokoro** model: Apache 2.0. You can use the voices it makes, including commercially.
- Anything you add (music, images, fonts) has its own license. Check before you publish.
