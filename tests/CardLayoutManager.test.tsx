import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardLayoutManager, type CardLayout } from "@/components/CardLayoutManager";

describe("CardLayoutManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const makeProps = () => ({
    currentLayouts: [
      { i: "map", x: 0, y: 0, w: 12, h: 8 },
      { i: "details", x: 0, y: 8, w: 8, h: 12 },
      { i: "weather", x: 8, y: 8, w: 4, h: 6 },
      { i: "premium", x: 8, y: 14, w: 4, h: 6 },
    ] as CardLayout[],
    currentStyles: {},
    onLayoutChange: vi.fn(),
    onStylesChange: vi.fn(),
  });

  it("loads Optimized preset by default on mount and updates layout", async () => {
    const props = makeProps();
    render(<CardLayoutManager {...props} />);

    await waitFor(() => {
      expect(props.onLayoutChange).toHaveBeenCalledTimes(1);
    });

    const calledWith = (props.onLayoutChange as any).mock.calls[0][0] as CardLayout[];
    expect(Array.isArray(calledWith)).toBe(true);
    // Expect the optimized preset to have 4 items including map/details/premium/weather
    const ids = calledWith.map((c) => c.i).sort();
    expect(ids).toEqual(["details", "map", "premium", "weather"]);
    // Map should be wider than details in Optimized preset
    const map = calledWith.find((c) => c.i === "map")!;
    const details = calledWith.find((c) => c.i === "details")!;
    expect(map.w).toBeGreaterThan(details.w);
  });

  it("sets selected preset as default via button", async () => {
    const props = makeProps();
    render(<CardLayoutManager {...props} />);

    const setDefaultBtns = await screen.findAllByRole("button", { name: /set default/i });
    await userEvent.click(setDefaultBtns[0]);

    expect(localStorage.getItem("layout-default-preset")).toBe("Optimized");
  });

  it("respects saved default preset on mount when available", async () => {
    // Create and save a custom preset and set as default
    const customPreset = {
      name: "My Preset",
      layouts: [
        { i: "map", x: 0, y: 0, w: 6, h: 6 },
        { i: "details", x: 6, y: 0, w: 6, h: 10 },
        { i: "weather", x: 0, y: 6, w: 6, h: 6 },
        { i: "premium", x: 6, y: 10, w: 6, h: 6 },
      ],
      styles: {},
    };
    localStorage.setItem("layout-presets", JSON.stringify([customPreset]));
    localStorage.setItem("layout-default-preset", "My Preset");

    const props = makeProps();
    render(<CardLayoutManager {...props} />);

    await waitFor(() => {
      expect(props.onLayoutChange).toHaveBeenCalledTimes(1);
    });
    const calledWith = (props.onLayoutChange as any).mock.calls[0][0] as CardLayout[];
    const ids = calledWith.map((c) => c.i).sort();
    expect(ids).toEqual(["details", "map", "premium", "weather"]);
    // Verify that the map width matches our custom preset (6)
    expect(calledWith.find((c) => c.i === "map")!.w).toBe(6);
  });
});
