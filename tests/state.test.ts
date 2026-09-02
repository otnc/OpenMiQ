import { describe, expect, it } from "vitest";
import {
  deleteQuoteState,
  getQuoteState,
  saveQuoteState,
} from "../src/state.js";
import type { QuoteState } from "../src/state.js";

function stateFor(id: string): QuoteState {
  return {
    data: { text: id } as QuoteState["data"],
    chainTop: null,
    settings: {} as QuoteState["settings"],
    locale: "en",
    guildId: "g1",
    generatorId: "generator1",
    targetId: "target1",
    fake: false,
  };
}

describe("quote state store", () => {
  it("round-trips a saved state by message ID", () => {
    saveQuoteState("m1", stateFor("m1"));
    expect(getQuoteState("m1")?.data.text).toBe("m1");
  });

  it("returns undefined for a message that was never saved", () => {
    expect(getQuoteState("never-saved")).toBeUndefined();
  });

  it("forgets a state once deleted", () => {
    saveQuoteState("m2", stateFor("m2"));
    deleteQuoteState("m2");
    expect(getQuoteState("m2")).toBeUndefined();
  });
});
