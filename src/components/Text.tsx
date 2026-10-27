import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../style/theme";

/** Big heading text. */
export const Title: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 110,
  color = theme.colors.ink,
}) => (
  <div
    style={{
      fontFamily: theme.fonts.heading,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.05,
      color,
      textAlign: "center",
      letterSpacing: -1,
    }}
  >
    {children}
  </div>
);

/** Normal body text. */
export const Body: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 60,
  color = theme.colors.ink,
}) => (
  <div
    style={{
      fontFamily: theme.fonts.body,
      fontSize: size,
      lineHeight: 1.25,
      color,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

/** Marker-pen highlight that is drawn behind a word starting at frame `at`. */
export const Highlight: React.FC<{ at: number; children: React.ReactNode; color?: string }> = ({
  at,
  children,
  color = theme.colors.highlight,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 10], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${p}% 42%`,
        backgroundPosition: "0 88%",
        padding: "0 6px",
      }}
    >
      {children}
    </span>
  );
};

/** A number that counts up from `from` to `to` between frames `at` and `at + duration`. */
export const Counter: React.FC<{
  at: number;
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  color?: string;
}> = ({
  at,
  to,
  from = 0,
  duration = 25,
  decimals = 0,
  prefix = "",
  suffix = "",
  size = 220,
  color = theme.colors.accent,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: size, color, lineHeight: 1 }}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </div>
  );
};

/** Small source line at the bottom of a scene, e.g. "Source: NOAA". */
export const Footnote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: theme.safeZone.left,
      right: theme.safeZone.right,
      bottom: theme.safeZone.bottom - 70,
      fontFamily: theme.fonts.body,
      fontSize: 30,
      color: theme.colors.muted,
      textAlign: "left",
    }}
  >
    {children}
  </div>
);
