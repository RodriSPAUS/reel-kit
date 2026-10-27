#!/usr/bin/env python3
"""
Make the voice of a reel and the timings that sync the animation to it.

    npm run voice -- <reel>                      # free local voice (Kokoro)
    npm run voice -- <reel> --engine recorded    # your own recording

Input:  src/reels/<reel>/script.txt   (scenes in [brackets], one sentence per line)
        public/reels/<reel>/voice-raw.(m4a|mp3|wav)   only for --engine recorded
Output: public/reels/<reel>/voice.m4a
        src/reels/<reel>/timings.json

Settings (voice, language, speed, pauses) are in voice.config.json.
Needs: ffmpeg, and `pip install -r requirements.txt`.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 24000  # working sample rate

KOKORO_URLS = {
    "kokoro-v1.0.int8.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}


def die(msg: str) -> None:
    print(f"\n✖ {msg}\n", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------- script ----

def read_script(path: Path) -> list[tuple[str, str]]:
    """Returns [(scene, line), ...]. Lines starting with # are comments."""
    if not path.exists():
        die(f"Script not found: {path.relative_to(ROOT)}")
    scene = None
    lines: list[tuple[str, str]] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if not s or s.startswith("#"):
            continue
        m = re.fullmatch(r"\[([A-Za-z0-9_-]+)\]", s)
        if m:
            scene = m.group(1)
            continue
        if scene is None:
            die("The script must start with a scene name in brackets, e.g. [hook]")
        lines.append((scene, s))
    if not lines:
        die("The script has no lines to say.")
    return lines


# ----------------------------------------------------------------- audio ----

def ffmpeg(*args: str) -> str:
    if not shutil.which("ffmpeg"):
        die("ffmpeg is not installed. See the README, section 'Install'.")
    r = subprocess.run(["ffmpeg", "-hide_banner", "-y", *args], capture_output=True, text=True)
    if r.returncode != 0:
        die("ffmpeg failed:\n" + r.stderr[-1500:])
    return r.stderr


def load_mono(path: Path) -> np.ndarray:
    tmp = path.with_suffix(".tmp.wav")
    ffmpeg("-i", str(path), "-ac", "1", "-ar", str(SR), str(tmp))
    audio, _ = sf.read(tmp, dtype="float32")
    tmp.unlink()
    return audio


def trim_silence(a: np.ndarray, db: float = -40) -> np.ndarray:
    """Cuts silence at both ends of a clip."""
    if len(a) == 0:
        return a
    thr = 10 ** (db / 20)
    win = int(0.01 * SR)
    env = np.convolve(np.abs(a), np.ones(win) / win, mode="same")
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return a
    pad = int(0.03 * SR)
    return a[max(0, idx[0] - pad): min(len(a), idx[-1] + pad)]


# --------------------------------------------------------------- engines ----

def kokoro_segments(lines, cfg, work: Path) -> list[np.ndarray]:
    try:
        from kokoro_onnx import Kokoro
    except ImportError:
        die("Kokoro is not installed. Run: pip install -r requirements.txt")
    models = ROOT / "models"
    models.mkdir(exist_ok=True)
    for name, url in KOKORO_URLS.items():
        dest = models / name
        if not dest.exists():
            print(f"  Downloading voice model {name} (only the first time)…")
            urllib.request.urlretrieve(url, dest)
    k = Kokoro(str(models / "kokoro-v1.0.int8.onnx"), str(models / "voices-v1.0.bin"))
    kc = cfg["kokoro"]
    if kc["voice"] not in k.get_voices():
        die(f"Unknown Kokoro voice '{kc['voice']}'. Available: {', '.join(sorted(k.get_voices()))}")
    out = []
    for i, (_, text) in enumerate(lines, 1):
        print(f"  [{i}/{len(lines)}] {text}")
        samples, sr = k.create(text, voice=kc["voice"], speed=kc["speed"], lang=kc["lang"])
        p = work / f"{i:02d}.wav"
        sf.write(p, samples, sr)
        out.append(trim_silence(load_mono(p)))
    return out


def speech_regions(audio: np.ndarray, db: float, min_silence: float) -> list[tuple[int, int]]:
    """Finds stretches of speech separated by at least `min_silence` seconds of quiet."""
    thr = 10 ** (db / 20)
    win = int(0.02 * SR)
    env = np.convolve(np.abs(audio), np.ones(win) / win, mode="same")
    loud = env > thr
    regions, start, quiet = [], None, 0
    gap = int(min_silence * SR)
    for i, v in enumerate(loud):
        if v:
            if start is None:
                start = i
            quiet = 0
        elif start is not None:
            quiet += 1
            if quiet >= gap:
                regions.append((start, i - quiet))
                start, quiet = None, 0
    if start is not None:
        regions.append((start, len(audio) - quiet))
    # Drop tiny clicks and breaths.
    return [(a, b) for a, b in regions if b - a > int(0.15 * SR)]


def recorded_segments(lines, cfg, slug: str) -> list[np.ndarray]:
    folder = ROOT / "public" / "reels" / slug
    raw = next((p for p in folder.glob("voice-raw.*") if p.suffix.lower() in {".m4a", ".mp3", ".wav", ".ogg", ".aac"}), None)
    if raw is None:
        die(f"Put your recording in public/reels/{slug}/ named voice-raw.m4a (or .mp3 / .wav).")
    audio = load_mono(raw)
    want = len(lines)
    db = cfg["recorded"]["silence_db"]
    # Try different pause lengths until we find exactly one chunk per line.
    tried = {}
    for ms in range(150, 1301, 50):
        regions = speech_regions(audio, db, ms / 1000)
        tried[ms] = len(regions)
        if len(regions) == want:
            print(f"  Found {want} spoken lines (pause ≥ {ms} ms).")
            return [trim_silence(audio[a:b]) for a, b in regions]
    counts = sorted(set(tried.values()))
    die(
        f"The script has {want} lines but the recording splits into {counts} chunks.\n"
        "  Tips: leave a clear pause (about 1 second) between lines, read every line once,\n"
        "  record somewhere quiet, or change 'silence_db' in voice.config.json (try -40 or -30)."
    )
    return []


# ---------------------------------------------------------------- timing ----

def spoken_weight(word: str) -> float:
    """Roughly how long a word takes to say: letters, with digits counting more."""
    letters = len(re.sub(r"[^\w]", "", word))
    digits = len(re.sub(r"\D", "", word))
    return max(1, letters + digits * 2) + 1


def build(lines, segments, cfg, tempo: float):
    p = cfg["pauses"]
    parts = [np.zeros(int(p["start"] * SR), dtype=np.float32)]
    t = p["start"]
    words, scenes, seg_times = [], {}, []
    for i, ((scene, text), seg) in enumerate(zip(lines, segments)):
        if i > 0:
            gap = p["between_scenes"] if scene != lines[i - 1][0] else p["between_lines"]
            # Pauses are set for the final speed, so stretch them before the tempo change.
            parts.append(np.zeros(int(gap * tempo * SR), dtype=np.float32))
            t += gap * tempo
        start, dur = t, len(seg) / SR
        parts.append(seg.astype(np.float32))
        t += dur
        seg_times.append((scene, text, start, start + dur))
    parts.append(np.zeros(int(p["end"] * tempo * SR), dtype=np.float32))
    total = t + p["end"] * tempo
    audio = np.concatenate(parts)

    fps = cfg["fps"]
    f = lambda sec: int(round(sec / tempo * fps))  # noqa: E731
    for scene, text, a, b in seg_times:
        toks = text.split()
        weights = [spoken_weight(w) for w in toks]
        acc = a
        for w, wt in zip(toks, weights):
            d = (b - a) * wt / sum(weights)
            words.append({"text": w, "scene": scene, "start": f(acc), "end": f(acc + d)})
            acc += d
        if scene not in scenes:
            scenes[scene] = {"start": f(a), "end": f(b)}
        else:
            scenes[scene]["end"] = f(b)
    total_frames = math.ceil(total / tempo * fps)
    # Each scene lasts until the next one starts; the last one until the end.
    names = list(scenes)
    for n, nxt in zip(names, names[1:]):
        scenes[n]["end"] = scenes[nxt]["start"]
    scenes[names[-1]]["end"] = total_frames
    scenes[names[0]]["start"] = 0
    return audio, {"fps": fps, "totalFrames": total_frames, "scenes": scenes, "words": words}


def finish_audio(audio: np.ndarray, out: Path, work: Path, tempo: float, lufs: float) -> None:
    tmp = work / "joined.wav"
    sf.write(tmp, audio, SR)
    filters = []
    if abs(tempo - 1) > 1e-3:
        # Rubberband keeps the pitch natural; atempo is the fallback.
        has_rb = "rubberband" in subprocess.run(["ffmpeg", "-hide_banner", "-filters"], capture_output=True, text=True).stdout
        filters.append(f"rubberband=tempo={tempo}" if has_rb else f"atempo={tempo}")
    filters.append(f"loudnorm=I={lufs}:TP=-1.5:LRA=11")
    out.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg("-i", str(tmp), "-af", ",".join(filters), "-ar", "48000", "-c:a", "aac", "-b:a", "192k", str(out))


# ------------------------------------------------------------------ main ----

def main() -> None:
    ap = argparse.ArgumentParser(description="Make the voice and timings for a reel.")
    ap.add_argument("reel", help="reel folder name, e.g. example")
    ap.add_argument("--engine", choices=["kokoro", "recorded"], help="overrides voice.config.json")
    args = ap.parse_args()

    cfg = json.loads((ROOT / "voice.config.json").read_text(encoding="utf-8"))
    engine = args.engine or cfg["engine"]
    slug = args.reel
    src = ROOT / "src" / "reels" / slug
    if not src.is_dir():
        die(f"No reel called '{slug}'. Create it with: npm run new -- {slug}")

    lines = read_script(src / "script.txt")
    work = ROOT / "public" / "reels" / slug / "segments"
    work.mkdir(parents=True, exist_ok=True)
    print(f"▶ Voice for '{slug}' with {engine} ({len(lines)} lines)")

    if engine == "kokoro":
        segs, tempo = kokoro_segments(lines, cfg, work), 1.0
    else:
        segs, tempo = recorded_segments(lines, cfg, slug), float(cfg["recorded"]["speed"])

    audio, timings = build(lines, segs, cfg, tempo)
    finish_audio(audio, ROOT / "public" / "reels" / slug / "voice.m4a", work, tempo, cfg["loudness_lufs"])
    (src / "timings.json").write_text(json.dumps(timings, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    shutil.rmtree(work, ignore_errors=True)

    secs = timings["totalFrames"] / timings["fps"]
    print(f"✔ public/reels/{slug}/voice.m4a  ({secs:.1f} s)")
    print(f"✔ src/reels/{slug}/timings.json  (scenes: {', '.join(timings['scenes'])})")
    if secs > 90:
        print("  Note: longer than 90 s. Most reels work best under 60 s.")


if __name__ == "__main__":
    main()
