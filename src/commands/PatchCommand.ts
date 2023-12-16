import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { normalize } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core";

import { Patcher } from "../Patcher.js";

type StringEntry = [index: number, value: string | null];

export function PatchCommand(source: string, input: string, output?: string) {
  if (!existsSync(source)) {
    fatal(`Source file not found: ${source}`);
  }

  if (!existsSync(input)) {
    fatal(`Transpiled JSON file not found: ${input}`);
  }

  const outputPath = normalize(output ?? `${source}.patched`);

  process.stdout.write(
    `Patching ${source} using ${normalize(input)} to ${outputPath}... `,
  );

  const patcher = new Patcher(readFileSync(source));
  const strings = JSON.parse(readFileSync(input).toString()) as StringEntry[];

  for (const [index, value] of strings) {
    patcher.patchString(index, value);
  }

  writeFileSync(outputPath, patcher.build());

  process.stdout.write("OK\n");
}
