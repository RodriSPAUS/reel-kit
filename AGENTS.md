---
type: agent-instructions
title: Instructions for AI assistants
description: How an AI coding assistant should help make reels in this repo - workflow, files, checkpoints and rules.
tags: [agents, workflow, remotion]
status: draft
---

# Instructions for AI assistants

This repo makes short vertical videos with Remotion. The user may be young or new to coding: explain briefly, in plain words, and let them make the creative choices.

Read `STYLE.md` before writing a script or drawing a scene. Read `README.md` for commands.

## Workflow and checkpoints

Do the steps in order. **Stop and wait for the user's OK at each checkpoint (✋).**

1. **Idea → script.** Write `src/reels/<name>/script.txt` (create the reel with `npm run new -- <name>`). Scenes in `[brackets]`, one sentence per line, 60–110 words. Hook first. Follow `STYLE.md`. List the source for every fact as a `#` comment at the top. ✋ *Script approved?*
2. **Voice.** `npm run voice -- <name>` (Kokoro by default). If the user recorded themselves, `--engine recorded`. If the script fails to split a recording, relay its message; don't edit the audio by hand. Check that the scene names in `timings.json` match the script.
3. **Scenes.** In `src/reels/<name>/Reel.tsx`: one component per scene, wrapped in `<Scene t={T} name="...">`. Sync with `cue(T, scene, word)`. Use components from `src/components/` and colours/fonts only from `theme`. Text and numbers on screen must match the script.
4. **Check frames.** `npm run frames -- <name> <a few frames>` and look at the PNGs: nothing outside the safe zone, nothing overlapping the subtitles, text readable on a phone. `npm run typecheck` must pass.
5. **Preview.** `npm run preview -- <name>`. Tell the user what to check: voice/animation sync, spelling and numbers, subtitles, cover frame. ✋ *Preview approved?*
6. **Final.** `npm run render -- <name>`. Deliver `out/<name>.mp4` and `out/<name>-cover.png`, plus a short caption and the sources for the description.

## Rules

- **Secrets.** Never write an API key, token or password into any tracked file, commit, log or message. Keys live only in `.env` (git-ignored). If you see a key in a tracked file, stop and tell the user to revoke it.
- **Paid services.** ElevenLabs and AWS cost money. Only use them if the user asks, and say so before running anything that spends credits.
- **Facts.** Don't invent facts or numbers. Each one needs a source the user can check. If unsure, say so.
- **Other people's work.** No copyrighted characters, logos, song lyrics or music the user doesn't have rights to. Original drawings only.
- **Privacy.** No personal details (full names, school, location) in videos or captions.
- **Scope.** Change a reel's own folder freely. Ask before changing `src/components/`, `src/style/theme.ts` or `scripts/`, since that affects every reel.
- **Long renders.** Final renders can take several minutes; tell the user before starting.

## Useful facts

- 30 fps, 1080×1920. The first 8 frames are the cover (`WithCover`); voice and subtitles start after them. `cue()` frames are already relative to the voice, so scenes don't need offsets.
- Word timings are estimated by word length, not detected. Nudge with `+ n` frames if needed; to change the timing of whole lines, change the pauses in `voice.config.json`.
- Re-running `npm run voice` rewrites `timings.json`. Changing the script's words changes `cue()` targets: update `Reel.tsx` if a cued word disappears (the error message names the scene and its words).
