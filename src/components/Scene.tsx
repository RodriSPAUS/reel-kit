import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Timings } from "../lib/timings";
import { Safe } from "./Canvas";

/**
 * One block of the script. It is on screen only while its part of the voice
 * plays, with a short fade at both ends. Inside, frames are the same as in
 * timings.json, so `cue(T, "scene", "word")` works directly.
 */
export const Scene: React.FC<{
  t: Timings;
  name: string;
  children: React.ReactNode;
  /** Set false to place things yourself instead of centring them in the safe zone. */
  centered?: boolean;
}> = ({ t, name, children, centered = true }) => {
  const frame = useCurrentFrame();
  const s = t.scenes[name];
  if (!s) throw new Error(`Scene "${name}" is not in timings.json. Did you run npm run voice?`);
  const isLast = s.end >= t.totalFrames;
  if (frame < s.start - 1 || (!isLast && frame > s.end + 6)) return null;

  const opacity = interpolate(
    frame,
    [s.start, s.start + 6, s.end, s.end + 6],
    [s.start === 0 ? 1 : 0, 1, 1, isLast ? 1 : 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      {centered ? <Safe style={{ gap: 40 }}>{children}</Safe> : children}
    </AbsoluteFill>
  );
};
