import { describe, it, expect } from "vitest";
import { DEFAULT_TAG_WEIGHTS, weightOf, newId, RANKS, TAGS } from "../src/domain/types";

describe("types", () => {
  it("has the nine default weights", () => {
    expect(DEFAULT_TAG_WEIGHTS).toEqual({ Theme: 9, Tone: 8, Character: 7, Arc: 6, Structure: 5, Exposition: 4, Logic: 3, Scene: 2, Dialogue: 1 });
    expect(TAGS).toEqual(["Theme","Tone","Character","Arc","Structure","Exposition","Logic","Scene","Dialogue"]);
  });
  it("sub-tags inherit the parent weight", () => {
    expect(weightOf("Character/Dynamics", DEFAULT_TAG_WEIGHTS)).toBe(7);
    expect(weightOf("Nonsense", DEFAULT_TAG_WEIGHTS)).toBe(0);
  });
  it("ranks are ordered", () => {
    expect(RANKS).toEqual(["Walked out","Unconvinced","Watching","Nodding","Loves it"]);
  });
  it("ids are unique strings", () => {
    expect(newId()).not.toBe(newId());
  });
});
