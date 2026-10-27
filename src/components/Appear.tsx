import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  /** Frame when it appears (use cue(...)). */
  at: number;
  /** Optional frame when it fades out. */
  until?: number;
  /** "fade" | "up" (slides up) | "pop" (springy scale). */
  effect?: "fade" | "up" | "pop";
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/** Shows its content from frame `at` (and hides it after `until`) with a short animation. */
export const Appear: React.FC<Props> = ({ at, until, effect = "up", children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [at, at + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut =
    until === undefined
      ? 1
      : interpolate(frame, [until - 6, until], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  let transform = "none";
  if (effect === "up") {
    const y = interpolate(frame, [at, at + 12], [40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    transform = `translateY(${y}px)`;
  } else if (effect === "pop") {
    const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 160 } });
    transform = `scale(${0.6 + 0.4 * s})`;
  }

  return <div style={{ opacity: fadeIn * fadeOut, transform, ...style }}>{children}</div>;
};
