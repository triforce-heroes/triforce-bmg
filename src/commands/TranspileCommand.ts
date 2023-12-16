import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { normalize } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core";

import { extract, getEntries, getStrings } from "../Extract.js";

type EntryOutput = [index: number, value: string];

export function TranspileCommand(input: string, output?: string) {
  if (!existsSync(input)) {
    fatal(`File not found: ${input}`);
  }

  const outputPath = normalize(output ?? `${input}.json`);

  process.stdout.write(`Transpiling ${normalize(input)} to ${outputPath}... `);

  const sections = new Map<string, Buffer>(extract(readFileSync(input)));
  const entries = getEntries(sections.get("INF1")!);
  const strings = new Map(getStrings(entries, sections.get("DAT1")!));
  const results: EntryOutput[] = [];

  for (const [, index] of entries) {
    if (index !== 0) {
      const string = strings.get(index);

      if (string !== undefined) {
        results.push([index, string]);
      }
    }
  }

  writeFileSync(outputPath, JSON.stringify(results, null, 2));

  process.stdout.write("OK\n");
}
