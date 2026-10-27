import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../style/theme";
import type { Word } from "../lib/timings";

/**
 * Burned-in subtitles, a few words at a time, with the spoken word coloured.
 * Many people watch without sound, so these matter.
 */
export const Subtitles: React.FC<{ words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const s = theme.subtitles;
  if (!s.enabled || words.length === 0) return null;

  // Group words into chunks. A chunk never crosses the end of a sentence or a scene.
  const chunks: Word[][] = [];
  for (const w of words) {
    const last = chunks[chunks.length - 1];
    const prev = last?.[last.length - 1];
    const sentenceEnded = prev ? /[.!?…]["')\]]?$/.test(prev.text) : true;
    if (last && last.length < s.wordsPerLine && prev!.scene === w.scene && !sentenceEnded) last.push(w);
    else chunks.push([w]);
  }

  const chunk = chunks.find(
    (c, i) => frame >= c[0].start && frame < (chunks[i + 1]?.[0].start ?? c[c.length - 1].end + 15),
  );
  if (!chunk || frame > chunk[chunk.length - 1].end + 15) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: theme.safeZone.left,
        right: theme.safeZone.right,
        bottom: s.bottom,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: s.background,
          borderRadius: 18,
          padding: "10px 24px",
          fontFamily: theme.fonts.heading,
      fontWeight: 800,
          fontSize: s.fontSize,
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {chunk.map((w, i) => (
          <span
            key={i}
            style={{ color: frame >= w.start && frame < w.end ? s.activeColor : s.color }}
          >
            {w.text}
            {i < chunk.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
