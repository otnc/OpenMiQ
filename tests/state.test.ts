import { describe, expect, it } from "vitest";
import { getQuoteState, saveQuoteState } from "../src/state.js";
import type { QuoteState } from "../src/state.js";

function stateFor(id: string): QuoteState {
  return {
    data: { text: id } as QuoteState["data"],
    settings: {} as QuoteState["settings"],
    locale: "en",
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
});
