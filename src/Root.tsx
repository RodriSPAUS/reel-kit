import React from "react";
import { Composition } from "remotion";
import { theme } from "./style/theme";
import { StylePreview } from "./style/StylePreview";
import { reelDuration } from "./components/ReelFrame";
import { reels } from "./reels/registry";

export const RemotionRoot: React.FC = () => (
  <>
    {/* A single picture that shows your style. */}
    <Composition
      id="style-preview"
      component={StylePreview}
      durationInFrames={60}
      fps={theme.video.fps}
      width={theme.video.width}
      height={theme.video.height}
    />
    {reels.map((r) => (
      <Composition
        key={r.id}
        id={r.id}
        component={r.component}
        durationInFrames={reelDuration(r.timings)}
        fps={theme.video.fps}
        width={theme.video.width}
        height={theme.video.height}
      />
    ))}
  </>
);
