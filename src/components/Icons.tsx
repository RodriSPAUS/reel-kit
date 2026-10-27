import React from "react";
import { theme } from "../style/theme";

/** A few simple drawn icons. Add your own as plain SVG. */

export const Heart: React.FC<{ size?: number; color?: string }> = ({
  size = 160,
  color = theme.colors.accent,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 20 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z"
      fill={color}
    />
  </svg>
);

export const Drop: React.FC<{ size?: number; color?: string }> = ({
  size = 220,
  color = theme.colors.accent2,
}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
    <path d="M50 6 C50 6 12 58 12 84 C12 106 29 124 50 124 C71 124 88 106 88 84 C88 58 50 6 50 6 Z" fill={color} />
    <ellipse cx="36" cy="88" rx="8" ry="14" fill="#fff" opacity="0.35" />
  </svg>
);

/** A labelled pill, e.g. a chemical symbol. */
export const Chip: React.FC<{
  label: string;
  sub?: string;
  color?: string;
  crossed?: boolean;
}> = ({ label, sub, color = theme.colors.ink, crossed = false }) => (
  <div
    style={{
      position: "relative",
      border: `6px solid ${color}`,
      borderRadius: 28,
      padding: "18px 36px",
      textAlign: "center",
      fontFamily: theme.fonts.heading,
      fontWeight: 800,
      color,
      opacity: crossed ? 0.45 : 1,
    }}
  >
    <div style={{ fontSize: 110, lineHeight: 1 }}>{label}</div>
    {sub ? <div style={{ fontSize: 36, fontFamily: theme.fonts.body }}>{sub}</div> : null}
    {crossed ? (
      <div
        style={{
          position: "absolute",
          left: -10,
          right: -10,
          top: "50%",
          height: 10,
          background: theme.colors.accent,
          transform: "rotate(-18deg)",
        }}
      />
    ) : null}
  </div>
);
