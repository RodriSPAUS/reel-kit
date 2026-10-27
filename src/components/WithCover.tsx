import React from "react";
import { Freeze, Sequence, useCurrentFrame, useVideoConfig } from "remotion";

/** Number of frames at the very start that show the cover (8 frames = 0.27 s at 30 fps). */
export const COVER_FRAMES = 8;

/**
 * Cover frames: the first few frames of the video show a frozen moment of the
 * reel (usually the hook, fully drawn). Platforms let you pick a cover frame
 * from the video, so this gives you a good one. After those frames the video
 * starts from the beginning.
 *
 * `freezeAt` is a frame in the same units as cue() (timings.json) where the
 * hook is complete and still on screen, e.g. `cueEnd(T, "hook") - 4`.
 */
export const WithCover: React.FC<{
  freezeAt: number;
  frames?: number;
  children: React.ReactNode;
}> = ({ freezeAt, frames = COVER_FRAMES, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      {frame < frames && (
        // Mounted with the full length so the slow zoom matches the real frame.
        <Sequence durationInFrames={durationInFrames - frames} layout="none">
          <Freeze frame={freezeAt}>{children}</Freeze>
        </Sequence>
      )}
      <Sequence from={frames} layout="none">
        {children}
      </Sequence>
    </>
  );
};
