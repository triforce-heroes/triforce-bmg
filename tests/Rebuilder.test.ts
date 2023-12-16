import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { Rebuilder } from "../src/Rebuilder.js";

describe("class Rebuilder", () => {
  it("rebuild sample 0", () => {
    const sample = new Rebuilder(10);

    sample.addString(10, "BOGUS", Buffer.from("\u00AA".repeat(10), "binary"));
    sample.updateString(10, "AA");

    expect(sample.build()).toStrictEqual(
      readFileSync(`${__dirname}/fixtures/sample0.bmg`),
    );
  });

  it("rebuild sample 1", () => {
    const sample = new Rebuilder(10);

    sample.addString(10, "AA", Buffer.from("\u00AA".repeat(10), "binary"));
    sample.addNull();
    sample.addString(20, "BBB", Buffer.from("\u00BB".repeat(10), "binary"));
    sample.addString(30, "CCC", Buffer.from("\u00CC".repeat(10), "binary"));
    sample.addString(40, "DDD", Buffer.from("\u00DD".repeat(10), "binary"));
    sample.addString(50, "EEE\n", Buffer.from("\u00EE".repeat(10), "binary"));

    sample.addSection("XTR1", Buffer.from("\u00FF".repeat(22), "binary"));
    sample.addSection("XTR2", Buffer.from("\0\0\0\0\0\0\0\0TRIMMED!"));

    expect(sample.build()).toStrictEqual(
      readFileSync(`${__dirname}/fixtures/sample1.bmg`),
    );
  });
});
