import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Canvas } from "./Canvas";
import { Badge } from "./Badge";
import { Subtitles } from "./Subtitles";
import { COVER_FRAMES, WithCover } from "./WithCover";
import type { Timings } from "../lib/timings";

type Props = {
  /** Reel folder name, e.g. "example". Voice is read from public/reels/<slug>/voice.m4a */
  slug: string;
  timings: Timings;
  /** Frame (of the real video) to use as cover. */
  coverAt: number;
  series?: string;
  number?: number;
  /** Optional background music file inside public/, e.g. "music/calm.m4a". */
  music?: string;
  /** Music volume (0-1). The voice should always be clearly louder. */
  musicVolume?: number;
  /** Set to false if the reel has no voice yet. */
  withVoice?: boolean;
  children: React.ReactNode;
};

/**
 * Everything every reel shares: canvas, badge, cover frames, voice, music and
 * subtitles. Your scenes go inside as children.
 */
export const ReelFrame: React.FC<Props> = ({
  slug,
  timings,
  coverAt,
  series,
  number,
  music,
  musicVolume = 0.08,
  withVoice = true,
  children,
}) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      {withVoice ? (
        <Sequence from={COVER_FRAMES} layout="none">
          <Audio src={staticFile(`reels/${slug}/voice.m4a`)} />
        </Sequence>
      ) : null}
      {music ? (
        <Audio
          src={staticFile(music)}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, 20, durationInFrames - 30, durationInFrames],
              [0, musicVolume, musicVolume, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
      <WithCover freezeAt={coverAt}>
        <Canvas>
          <Badge series={series} number={number} />
          {children}
        </Canvas>
      </WithCover>
      <Sequence from={COVER_FRAMES} layout="none">
        <Subtitles words={timings.words} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Total length of a reel: the voice plus the cover frames. */
export const reelDuration = (t: Timings) => t.totalFrames + COVER_FRAMES;
