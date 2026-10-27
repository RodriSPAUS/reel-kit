import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ReelFrame } from "../../components/ReelFrame";
import { Scene } from "../../components/Scene";
import { Appear } from "../../components/Appear";
import { Title, Body, Highlight, Footnote } from "../../components/Text";
import { Heart, Drop, Chip } from "../../components/Icons";
import { cue, cueEnd, type Timings } from "../../lib/timings";
import { theme } from "../../style/theme";
import timings from "./timings.json";

const T = timings as Timings;
const SOURCE = "Source: Smithsonian Magazine";

// ---- Scene: hook -----------------------------------------------------------
const Hook: React.FC = () => (
  <Scene t={T} name="hook">
    <Title size={96}>An octopus has</Title>
    <div style={{ display: "flex", gap: 30 }}>
      {[0, 1, 2].map((i) => (
        <Appear key={i} at={cue(T, "hook", "three") + i * 4} effect="pop">
          <Heart size={200} />
        </Appear>
      ))}
    </div>
    <Appear at={cue(T, "hook", "hearts")}>
      <Title size={150} color={theme.colors.accent}>
        3 hearts
      </Title>
    </Appear>
  </Scene>
);

// ---- Scene: blood ----------------------------------------------------------
const Blood: React.FC = () => (
  <Scene t={T} name="blood">
    <Appear at={cue(T, "blood")} effect="pop">
      <Drop size={240} />
    </Appear>
    <Title>
      <Highlight at={cue(T, "blood", "blue")}>Blue</Highlight> blood
    </Title>
    <div style={{ display: "flex", gap: 50, marginTop: 20 }}>
      <Appear at={cue(T, "blood", "copper")} effect="pop">
        <Chip label="Cu" sub="copper" color={theme.colors.accent2} />
      </Appear>
      <Appear at={cue(T, "blood", "iron")} effect="pop">
        <Chip label="Fe" sub="iron" crossed />
      </Appear>
    </div>
    <Footnote>{SOURCE}</Footnote>
  </Scene>
);

// ---- Scene: hearts ---------------------------------------------------------
const Labelled: React.FC<{ at: number; label: string; color?: string; dim?: boolean }> = ({
  at,
  label,
  color,
  dim,
}) => (
  <Appear at={at} effect="pop" style={{ textAlign: "center", opacity: dim ? 0.3 : 1 }}>
    <Heart size={190} color={color} />
    <Body size={48}>{label}</Body>
  </Appear>
);

const Hearts: React.FC = () => (
  <Scene t={T} name="hearts">
    <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
      <Labelled at={cue(T, "hearts", "Two")} label="gills" />
      <Labelled at={cue(T, "hearts", "Two") + 5} label="gills" />
      <Labelled at={cue(T, "hearts", "third")} label="body" color={theme.colors.accent2} />
    </div>
    <Appear at={cue(T, "hearts", "gills")}>
      <Body>
        2 for the <b>gills</b>
      </Body>
    </Appear>
    <Appear at={cue(T, "hearts", "body")}>
      <Body>
        1 for the <b>body</b>
      </Body>
    </Appear>
    <Footnote>{SOURCE}</Footnote>
  </Scene>
);

// ---- Scene: twist ----------------------------------------------------------
const Twist: React.FC = () => {
  const frame = useCurrentFrame();
  const stop = cue(T, "twist", "stops");
  // The body heart beats until the word "stops", then goes grey.
  const beat = frame < stop ? 1 + 0.08 * Math.max(0, Math.sin(frame / 3)) : 1;
  const grey = interpolate(frame, [stop, stop + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Scene t={T} name="twist">
      <Title size={100}>When it swims…</Title>
      <div style={{ transform: `scale(${beat})`, filter: `grayscale(${grey})`, opacity: 1 - 0.5 * grey }}>
        <Heart size={300} color={theme.colors.accent2} />
      </div>
      <Appear at={stop}>
        <Title size={90} color={theme.colors.accent}>
          the body heart stops
        </Title>
      </Appear>
      <Appear at={cue(T, "twist", "crawl")} effect="pop">
        <Body size={70}>
          …so it would rather <Highlight at={cue(T, "twist", "crawl")}>crawl</Highlight>
        </Body>
      </Appear>
      <Footnote>{SOURCE}</Footnote>
    </Scene>
  );
};

// ---- Scene: outro ----------------------------------------------------------
const Outro: React.FC = () => (
  <Scene t={T} name="outro">
    <Appear at={cue(T, "outro")} effect="pop">
      <Title size={120} color={theme.colors.accent}>
        Follow
      </Title>
    </Appear>
    <Appear at={cue(T, "outro", "weird")}>
      <Body size={64}>one weird animal fact a day</Body>
    </Appear>
  </Scene>
);

// ---- The reel --------------------------------------------------------------
const Reel: React.FC = () => (
  <ReelFrame
    slug="example"
    timings={T}
    // Cover: the hook fully drawn, just before it fades out.
    coverAt={cueEnd(T, "hook") - 4}
    series="Animal facts"
    number={1}
  >
    <Hook />
    <Blood />
    <Hearts />
    <Twist />
    <Outro />
  </ReelFrame>
);

export const reel = { id: "example", component: Reel, timings: T };
