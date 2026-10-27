import React from "react";
import { theme } from "../style/theme";

/**
 * Small label in the top corner: channel name, plus an optional series name
 * and episode number. Viewers learn to recognise your videos by it.
 */
export const Badge: React.FC<{ series?: string; number?: number }> = ({ series, number }) => (
  <div
    style={{
      position: "absolute",
      top: theme.safeZone.top - 60,
      left: theme.safeZone.left,
      display: "flex",
      gap: 16,
      alignItems: "center",
      fontFamily: theme.fonts.heading,
      fontWeight: 800,
      fontSize: 34,
      color: theme.colors.ink,
    }}
  >
    <span
      style={{
        background: theme.colors.accent,
        color: "#fff",
        padding: "6px 16px",
        borderRadius: 10,
      }}
    >
      {theme.channelName}
    </span>
    {series ? (
      <span style={{ color: theme.colors.muted, fontFamily: theme.fonts.body }}>
        {series}
        {number !== undefined ? ` · #${number}` : ""}
      </span>
    ) : null}
  </div>
);
