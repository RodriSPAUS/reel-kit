import React from "react";
import { AbsoluteFill } from "remotion";
import { Canvas, Safe } from "../components/Canvas";
import { Badge } from "../components/Badge";
import { Title, Body, Highlight, Counter, Footnote } from "../components/Text";
import { Subtitles } from "../components/Subtitles";
import { theme } from "./theme";

/**
 * One frame that shows the whole style at a glance: badge, heading, marker,
 * big number, body text, footnote and subtitles. Rendered by
 * `npm run style-preview` to videos/style-preview.png after every style change.
 */
export const STYLE_PREVIEW_FRAME = 45;

const words = ["This", "is", "how", "subtitles", "look"].map((text, i) => ({
  text,
  scene: "s",
  start: i * 8,
  end: i * 8 + 8,
}));

export const StylePreview: React.FC = () => (
  <AbsoluteFill>
    <Canvas>
      <Badge series="Series name" number={1} />
      <Safe style={{ gap: 36 }}>
        <Title>
          Your <Highlight at={0}>hook</Highlight> here
        </Title>
        <Counter at={0} to={73} duration={1} suffix="%" />
        <Body>Normal text looks like this.</Body>
        <Body color={theme.colors.accent2}>Second colour, for comparisons.</Body>
      </Safe>
      <Footnote>Source: where the facts come from</Footnote>
    </Canvas>
    {/* Subtitles frozen on the 4th word so the "active word" colour shows. */}
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <SubtitlesAt frame={27} />
    </AbsoluteFill>
  </AbsoluteFill>
);

// Shows the subtitles as they look at a given frame.
const SubtitlesAt: React.FC<{ frame: number }> = ({ frame }) => {
  const shifted = words.map((w) => ({ ...w, start: w.start - frame + STYLE_PREVIEW_FRAME, end: w.end - frame + STYLE_PREVIEW_FRAME }));
  return <Subtitles words={shifted} />;
};
