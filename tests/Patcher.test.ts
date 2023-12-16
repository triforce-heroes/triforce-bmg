import { readFileSync } from "node:fs";

import { describe, it, expect } from "vitest";

import { Patcher } from "../src/Patcher.js";

describe("class Patcher", () => {
  it("patch sample 0", () => {
    const sample = new Patcher(
      readFileSync(`${__dirname}/fixtures/sample0.bmg`),
    );

    sample.patchString(10, "BOGUS");
    sample.patchString(10, "HELLO");

    expect(sample.build()).toStrictEqual(
      readFileSync(`${__dirname}/fixtures/sample0.patched.bmg`),
    );
  });

  it("patch sample 1", () => {
    const sample = new Patcher(
      readFileSync(`${__dirname}/fixtures/sample1.bmg`),
    );

    sample.patchString(10, "A");
    sample.patchString(20, "B");
    sample.patchString(30, "C");
    sample.patchString(40, "D");
    sample.patchString(50, "E");

    expect(sample.build()).toStrictEqual(
      readFileSync(`${__dirname}/fixtures/sample1.patched.bmg`),
    );
  });
});
