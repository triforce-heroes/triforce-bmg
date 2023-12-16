import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { extract, getEntries, getStrings } from "../src/Extract.js";

describe("extract", () => {
  it("extract sample 0", () => {
    const sampleData = readFileSync(`${__dirname}/fixtures/sample0.bmg`);
    const sampleSections = new Map<string, Buffer>(extract(sampleData));

    expect([...sampleSections.keys()]).toStrictEqual(["INF1", "DAT1"]);

    expect(sampleSections.get("INF1")).toHaveLength(24);
    expect(sampleSections.get("DAT1")).toHaveLength(24);

    const sampleEntries = getEntries(sampleSections.get("INF1")!);

    expect(sampleEntries).toHaveLength(1);

    const samplesEntriesOffsets = new Map<number, number>(
      sampleEntries.map((entry) => [entry[0], entry[1]]),
    );

    expect(samplesEntriesOffsets.get(0)).toBe(undefined);
    expect(samplesEntriesOffsets.get(1)).toBe(10);

    const samplesStringsBuffer = getStrings(
      sampleEntries,
      sampleSections.get("DAT1")!,
    );

    expect(samplesStringsBuffer).toStrictEqual([
      [10, "AA\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0"],
    ]);
  });

  it("extract sample 1", () => {
    const sampleData = readFileSync(`${__dirname}/fixtures/sample1.bmg`);
    const sampleSections = new Map<string, Buffer>(extract(sampleData));

    expect([...sampleSections.keys()]).toStrictEqual([
      "INF1",
      "DAT1",
      "XTR1",
      "XTR2",
    ]);

    expect(sampleSections.get("INF1")).toHaveLength(120);
    expect(sampleSections.get("DAT1")).toHaveLength(24);
    expect(sampleSections.get("XTR1")).toHaveLength(24);
    expect(sampleSections.get("XTR2")).toHaveLength(16);

    const sampleEntries = getEntries(sampleSections.get("INF1")!);

    expect(sampleEntries).toHaveLength(6);

    const samplesEntriesOffsets = new Map<number, number>(
      sampleEntries.map((entry) => [entry[0], entry[1]]),
    );

    expect(samplesEntriesOffsets.get(0)).toBe(0);
    expect(samplesEntriesOffsets.get(1)).toBe(10);
    expect(samplesEntriesOffsets.get(4)).toBe(20);
    expect(samplesEntriesOffsets.get(8)).toBe(30);
    expect(samplesEntriesOffsets.get(12)).toBe(40);
    expect(samplesEntriesOffsets.get(16)).toBe(50);

    const samplesStringsBuffer = getStrings(
      sampleEntries,
      sampleSections.get("DAT1")!,
    );

    expect(samplesStringsBuffer).toStrictEqual([
      [10, "AA"],
      [20, "BBB"],
      [30, "CCC"],
      [40, "DDD"],
      [50, "EEE\0\0\0\0"],
    ]);
  });
});
