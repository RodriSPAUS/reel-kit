import type React from "react";
import type { Timings } from "../lib/timings";
// <imports> (npm run new adds lines here)
import { reel as example } from "./example/Reel";
// </imports>

export type ReelEntry = {
  /** Composition name, used in `npm run render -- <id>`. Letters, numbers and dashes only. */
  id: string;
  component: React.FC;
  timings: Timings;
};

export const reels: ReelEntry[] = [
  // <list> (npm run new adds lines here)
  example,
  // </list>
];
