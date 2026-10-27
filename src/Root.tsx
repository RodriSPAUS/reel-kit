import React from "react";
import { Composition } from "remotion";
import { theme } from "./style/theme";
import { reelDuration } from "./components/ReelFrame";
import { reels } from "./reels/registry";

export const RemotionRoot: React.FC = () => (
  <>
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
