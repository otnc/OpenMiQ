import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { renderSwatchPng } from "../src/emojiSwatch.js";

const THEME = {
  key: "test",
  label: "Test",
  gradient: ["#000000", "#FFFFFF"] as const,
};

describe("renderSwatchPng", () => {
  it("renders a 64x64 PNG", () => {
    const png = PNG.sync.read(renderSwatchPng(THEME));
    expect(png.width).toBe(64);
    expect(png.height).toBe(64);
  });

  it("fades from the first gradient color at the top-left corner to the second at the bottom-right", () => {
    const png = PNG.sync.read(renderSwatchPng(THEME));
    const topLeft = png.data.subarray(0, 3);
    const bottomRightIndex =
      (png.width * (png.height - 1) + (png.width - 1)) << 2;
    const bottomRight = png.data.subarray(
      bottomRightIndex,
      bottomRightIndex + 3,
    );
    expect([...topLeft]).toEqual([0, 0, 0]);
    expect([...bottomRight]).toEqual([255, 255, 255]);
  });

  it("is fully opaque", () => {
    const png = PNG.sync.read(renderSwatchPng(THEME));
    for (let i = 3; i < png.data.length; i += 4) {
      expect(png.data[i]).toBe(255);
    }
  });
});
