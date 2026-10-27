import React from "react";
import { ReelFrame } from "../../components/ReelFrame";
import { Scene } from "../../components/Scene";
import { Appear } from "../../components/Appear";
import { Title, Body } from "../../components/Text";
import { cue, cueEnd, type Timings } from "../../lib/timings";
import timings from "./timings.json";

// timings.json is rewritten every time you run `npm run voice -- __REEL__`.
const T = timings as Timings;
const hasVoice = T.words.length > 0;

// One component per [scene] in script.txt. Use cue(T, "scene", "word") to make
// things appear exactly when a word is spoken. See src/reels/example/Reel.tsx.

const Hook: React.FC = () => (
  <Scene t={T} name="hook">
    <Title>Your hook</Title>
  </Scene>
);

const Point: React.FC = () => (
  <Scene t={T} name="point">
    <Appear at={cue(T, "point")}>
      <Body>The main idea</Body>
    </Appear>
  </Scene>
);

const Outro: React.FC = () => (
  <Scene t={T} name="outro">
    <Title>Follow for more</Title>
  </Scene>
);

const Reel: React.FC = () => (
  <ReelFrame slug="__REEL__" timings={T} coverAt={cueEnd(T, "hook") - 4} withVoice={hasVoice}>
    <Hook />
    <Point />
    <Outro />
  </ReelFrame>
);

export const reel = { id: "__REEL__", component: Reel, timings: T };
