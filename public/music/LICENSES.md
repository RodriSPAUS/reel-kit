---
type: license-log
title: Music licenses
description: Record where every music track in this folder came from and what its license allows.
tags: [music, licenses]
status: draft
---

# Music licenses

Only put music here that you're allowed to use in videos you publish. For each track, write down where it came from **when you download it**, because licenses change.

| File | Track and author | Where from (URL) | License | Credit needed? | Date downloaded |
|---|---|---|---|---|---|
| *(example)* `calm.m4a` | *Track name – Artist* | *https://…* | *e.g. free for commercial use* | *yes / no* | *2026-01-01* |

Tips:
- Read the full license, not just the summary. Check that it covers YouTube, Instagram and TikTok.
- Music from inside an app (Instagram or TikTok sounds) usually only works on that one app: don't bake it into the video.
- To make a track quiet under the voice: `ffmpeg -i track.mp3 -af loudnorm=I=-33:TP=-3 -c:a aac track.m4a`
