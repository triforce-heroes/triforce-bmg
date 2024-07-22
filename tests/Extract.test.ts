import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { extract } from "../src/Extract.js";
import { rebuild } from "../src/Rebuild.js";
import { MessageEntry } from "../src/types/Message.js";

const sources = [
  [
    "sample0.bmg",
    [[10, "AA"]],
    [[10, "BBB"]] satisfies MessageEntry[],
    "sample0.patched.bmg",
  ],
  [
    "sample1.bmg",
    [
      [10, "AA"],
      [0, ""],
      [20, "BBB"],
      [30, "CCC"],
      [40, "DDD"],
      [50, "EEE\n"],
    ],
    [
      [0, "must ignore this patch: intrinsic null message"],
      [60, "must ignore this patch: message does not exist"],
    ] satisfies MessageEntry[],
    "sample1.bmg",
  ],
  [
    "sample1.bmg",
    [
      [10, "AA"],
      [0, ""],
      [20, "BBB"],
      [30, "CCC"],
      [40, "DDD"],
      [50, "EEE\n"],
    ],
    [[10, "AAA"]] satisfies MessageEntry[],
    "sample1.patched.bmg",
  ],
  ["sample2.bmg", [[10, "AA\u001A\u0006\u00AA\u00BB\u00CC\u00DD!"]]],
  [
    "sample3.bmg",
    [
      [2, "AAAAA"],
      [3, "BBBBBB"],
      [4, "CCCCC"],
      [5, "DDDDDD"],
    ],
  ],
  [
    "sample3.bmg",
    [
      [2, "AAAAA"],
      [3, "BBBBBB"],
      [4, "CCCCC"],
      [5, "DDDDDD"],
    ],
    [
      [2, "EEE"],
      [5, "F"],
    ] satisfies MessageEntry[],
    "sample3.patched.bmg",
  ],
] as const;

describe("extract", () => {
  it.each(sources)(
    "source: %j",
    (
      source,
      entries,
      patches: MessageEntry[] = [],
      patchedBuffer: string | null = null,
    ) => {
      const sourceBuffer = readFileSync(`${__dirname}/fixtures/${source}`);

      expect(extract(sourceBuffer)).toStrictEqual(entries);

      rebuild(sourceBuffer, []);

      expect(rebuild(sourceBuffer, patches)).toStrictEqual(
        typeof patchedBuffer === "string"
          ? readFileSync(`${__dirname}/fixtures/${patchedBuffer}`)
          : sourceBuffer,
      );
    },
  );
});
